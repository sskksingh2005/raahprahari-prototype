import { applyAuthSession } from "@/lib/account-session";
import { SupabaseConfigError, getSupabaseClient } from "@/lib/supabase";

/**
 * Signup, password recovery and email-link handling on top of the shared
 * Supabase client. Every result reflects what Supabase actually returned.
 */

export type AuthFlowErrorKind =
  | "network"
  | "not_configured"
  | "user_exists"
  | "weak_password"
  | "same_password"
  | "rate_limited"
  | "session_missing"
  | "link_invalid"
  | "generic";

/** Maps Supabase errors to safe categories; never surfaces raw provider text. */
export function classifyAuthFlowError(error: unknown): AuthFlowErrorKind {
  if (error instanceof SupabaseConfigError) return "not_configured";
  if (typeof navigator !== "undefined" && navigator.onLine === false)
    return "network";
  const e = (error ?? {}) as { name?: string; code?: string; status?: number };
  switch (e.code) {
    case "user_already_exists":
    case "email_exists":
      return "user_exists";
    case "weak_password":
      return "weak_password";
    case "same_password":
      return "same_password";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "rate_limited";
    case "session_not_found":
    case "session_expired":
      return "session_missing";
    case "flow_state_not_found":
    case "flow_state_expired":
    case "bad_code_verifier":
    case "otp_expired":
    case "bad_jwt":
      return "link_invalid";
  }
  if (e.name === "AuthSessionMissingError") return "session_missing";
  if (e.status === 429) return "rate_limited";
  if (
    e.name === "AuthRetryableFetchError" ||
    e.name === "TypeError" ||
    e.status === 0
  )
    return "network";
  return "generic";
}

function origin() {
  return typeof window === "undefined" ? "" : window.location.origin;
}

/** Where email links land. `next` is resolved by the callback route. */
export function callbackUrl(next?: SafeNext) {
  const url = new URL("/auth/callback", origin() || "http://localhost");
  if (next) url.searchParams.set("next", next);
  return url.toString();
}

export type SignUpResult =
  /** Email confirmation is off: Supabase returned a session. */
  | { kind: "signed_in" }
  /** Email confirmation is on (or the address is already registered). */
  | { kind: "check_email" };

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<SignUpResult> {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email,
    password,
    options: { emailRedirectTo: callbackUrl() },
  });
  if (error) throw error;
  if (data.session) {
    applyAuthSession(data.session);
    return { kind: "signed_in" };
  }
  // With confirmation enabled Supabase returns a user but no session. It also
  // does this for an already-registered address, so the message stays neutral.
  if (data.user) return { kind: "check_email" };
  throw Object.assign(new Error("Signup returned no user"), {
    code: "generic",
  });
}

export async function requestPasswordReset(email: string) {
  const { error } = await getSupabaseClient().auth.resetPasswordForEmail(
    email,
    { redirectTo: callbackUrl("/auth/reset-password") },
  );
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { data, error } = await getSupabaseClient().auth.updateUser({
    password,
  });
  if (error) throw error;
  if (!data.user) {
    throw Object.assign(new Error("No user returned"), {
      code: "session_not_found",
    });
  }
}

/** Only these internal paths may follow a callback (no open redirects). */
const SAFE_NEXT = ["/", "/auth/reset-password"] as const;
export type SafeNext = (typeof SAFE_NEXT)[number];

export function safeNext(value: string | null | undefined): SafeNext {
  return (SAFE_NEXT as readonly string[]).includes(value ?? "")
    ? (value as SafeNext)
    : "/";
}

export type CallbackResult =
  | { ok: true; next: SafeNext }
  | { ok: false; kind: AuthFlowErrorKind | "missing_code" };

type ExchangeAuth = {
  exchangeCodeForSession(code: string): Promise<{
    data: {
      session: {
        access_token: string;
        expires_at?: number;
        user: { id: string };
      } | null;
    };
    error: unknown;
  }>;
};

/**
 * Completes an email confirmation or recovery link. Succeeds only when
 * Supabase exchanges the code for a real session.
 */
export async function completeAuthCallback(
  href: string,
  auth?: ExchangeAuth,
): Promise<CallbackResult> {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  const errorCode =
    url.searchParams.get("error_code") ??
    hash.get("error_code") ??
    url.searchParams.get("error") ??
    hash.get("error");
  if (errorCode) {
    const kind = classifyAuthFlowError({ code: errorCode });
    return { ok: false, kind: kind === "generic" ? "link_invalid" : kind };
  }
  const code = url.searchParams.get("code");
  if (!code) return { ok: false, kind: "missing_code" };
  try {
    const client = auth ?? getSupabaseClient().auth;
    const { data, error } = await client.exchangeCodeForSession(code);
    if (error) {
      const kind = classifyAuthFlowError(error);
      return { ok: false, kind: kind === "generic" ? "link_invalid" : kind };
    }
    if (!data.session) return { ok: false, kind: "link_invalid" };
    applyAuthSession(data.session);
    return { ok: true, next: safeNext(url.searchParams.get("next")) };
  } catch (error) {
    return { ok: false, kind: classifyAuthFlowError(error) };
  }
}
