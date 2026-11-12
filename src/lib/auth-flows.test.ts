import { afterEach, describe, expect, it, vi } from "vitest";
import { getAccountSession, setAccountSession } from "@/lib/account-session";
import {
  callbackUrl,
  classifyAuthFlowError,
  completeAuthCallback,
  requestPasswordReset,
  safeNext,
  signUpWithEmail,
  updatePassword,
} from "@/lib/auth-flows";

const auth = vi.hoisted(() => ({
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  exchangeCodeForSession: vi.fn(),
}));

vi.mock("@/lib/supabase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabase")>();
  return { ...actual, getSupabaseClient: () => ({ auth }) };
});

const session = (id = "u1") => ({
  access_token: "token",
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: { id },
});

afterEach(() => {
  for (const fn of Object.values(auth)) fn.mockReset();
  setAccountSession({ status: "signed_out", userId: null });
});

describe("signUpWithEmail", () => {
  it("signs in when Supabase returns a session (confirmation disabled)", async () => {
    auth.signUp.mockResolvedValue({
      data: { session: session(), user: { id: "u1" } },
      error: null,
    });
    await expect(
      signUpWithEmail("a@example.com", "longpassword"),
    ).resolves.toEqual({
      kind: "signed_in",
    });
    expect(auth.signUp).toHaveBeenCalledWith({
      email: "a@example.com",
      password: "longpassword",
      options: { emailRedirectTo: callbackUrl() },
    });
    expect(getAccountSession()).toMatchObject({
      status: "authenticated",
      userId: "u1",
    });
  });

  it("asks to check email when Supabase returns a user without a session", async () => {
    auth.signUp.mockResolvedValue({
      data: { session: null, user: { id: "u1" } },
      error: null,
    });
    await expect(
      signUpWithEmail("a@example.com", "longpassword"),
    ).resolves.toEqual({
      kind: "check_email",
    });
    expect(getAccountSession().status).toBe("signed_out");
  });

  it("rejects with the provider error", async () => {
    const error = { name: "AuthApiError", status: 422, code: "weak_password" };
    auth.signUp.mockResolvedValue({
      data: { session: null, user: null },
      error,
    });
    await expect(signUpWithEmail("a@example.com", "longpassword")).rejects.toBe(
      error,
    );
  });
});

describe("password recovery", () => {
  it("sends the reset email with a callback that continues to the reset page", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    await requestPasswordReset("a@example.com");
    const [, options] = auth.resetPasswordForEmail.mock.calls[0];
    const url = new URL(options.redirectTo);
    expect(url.pathname).toBe("/auth/callback");
    expect(url.searchParams.get("next")).toBe("/auth/reset-password");
  });

  it("surfaces reset and update errors instead of reporting success", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({
      data: null,
      error: { status: 429, code: "over_email_send_rate_limit" },
    });
    await expect(requestPasswordReset("a@example.com")).rejects.toMatchObject({
      status: 429,
    });
    auth.updateUser.mockResolvedValue({
      data: { user: null },
      error: { name: "AuthSessionMissingError" },
    });
    await expect(updatePassword("newpassword")).rejects.toMatchObject({
      name: "AuthSessionMissingError",
    });
  });
});

describe("completeAuthCallback", () => {
  it("exchanges the code, applies the session and keeps an allow-listed next", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({
      data: { session: session() },
      error: null,
    });
    await expect(
      completeAuthCallback(
        "https://app.test/auth/callback?code=abc&next=/auth/reset-password",
      ),
    ).resolves.toEqual({ ok: true, next: "/auth/reset-password" });
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(getAccountSession().status).toBe("authenticated");
  });

  it("never redirects outside the app", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({
      data: { session: session() },
      error: null,
    });
    await expect(
      completeAuthCallback(
        "https://app.test/auth/callback?code=abc&next=//evil.example",
      ),
    ).resolves.toEqual({ ok: true, next: "/" });
    expect(safeNext("https://evil.example")).toBe("/");
  });

  it("reports expired links, provider error params and missing codes", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({
      data: { session: null },
      error: { code: "flow_state_expired" },
    });
    await expect(
      completeAuthCallback("https://app.test/auth/callback?code=old"),
    ).resolves.toEqual({ ok: false, kind: "link_invalid" });
    await expect(
      completeAuthCallback(
        "https://app.test/auth/callback#error=access_denied&error_code=otp_expired",
      ),
    ).resolves.toEqual({ ok: false, kind: "link_invalid" });
    await expect(
      completeAuthCallback("https://app.test/auth/callback"),
    ).resolves.toEqual({
      ok: false,
      kind: "missing_code",
    });
    expect(getAccountSession().status).toBe("signed_out");
  });
});

describe("classifyAuthFlowError", () => {
  it("maps provider codes to safe categories", () => {
    expect(classifyAuthFlowError({ code: "user_already_exists" })).toBe(
      "user_exists",
    );
    expect(classifyAuthFlowError({ code: "same_password" })).toBe(
      "same_password",
    );
    expect(classifyAuthFlowError({ status: 429 })).toBe("rate_limited");
    expect(classifyAuthFlowError(new TypeError("Failed to fetch"))).toBe(
      "network",
    );
    expect(classifyAuthFlowError({ status: 500 })).toBe("generic");
  });
});
