import { useCallback, useRef, useState } from "react";
import { getAccountSession } from "@/lib/account-session";
import { REDACTED, sanitizeDescription } from "@/lib/pii-sanitize";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  REPORT_HAZARDS,
  observationExtras,
  type LaneDirection,
  type ObservationSource,
  type ReportHazard,
  type VehicleApplicability,
} from "@/lib/report-store";

/** What the extract-hazard Edge Function returns. Never applied automatically. */
export type AiSuggestions = {
  hazardType: ReportHazard | "unknown";
  laneDirection: LaneDirection;
  vehicleApplicability: VehicleApplicability;
  source: ObservationSource;
};

export type AiErrorKind =
  "network" | "invalid_input" | "timeout" | "rate_limited" | "failed";

/** Client wait; a little longer than the function's own 20 s provider deadline. */
export const AI_CLIENT_TIMEOUT_MS = 25_000;

export type AiExtractionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; suggestions: AiSuggestions }
  /** retryAfterSeconds is set for rate_limited (from the server's answer). */
  | { status: "error"; kind: AiErrorKind; retryAfterSeconds?: number }
  /** No Supabase project or no Gemini key on the server. */
  | { status: "unavailable" }
  /** Manual reporting works regardless of authentication state. */
  | { status: "signin_required" };

export const AI_FUNCTION_NAME = "extract-hazard";
export const AI_MAX_DESCRIPTION = 2000;

const GUEST_ID_STORAGE_KEY = "raahprahari.ai-guest-id";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let volatileGuestId: string | null = null;

type InvokeError = {
  name?: string;
  context?: { name?: string; status?: number; json?: () => Promise<unknown> };
};

const SAFE_ERROR_MESSAGES: Record<string, string> = {
  auth_required: "The function rejected the session.",
  auth_unavailable: "Authentication could not be verified.",
  invalid_input: "The description was rejected.",
  not_configured: "The suggestion service is not configured.",
  quota_unavailable: "The request limit could not be checked.",
  rate_limited: "The request limit was reached.",
  timeout: "The suggestion service timed out.",
  upstream_error: "The suggestion provider failed.",
  network: "The suggestion service could not be reached.",
  request_failed: "The suggestion request failed.",
};

function logAiFailure(
  status: number | undefined,
  code: keyof typeof SAFE_ERROR_MESSAGES,
) {
  if (!import.meta.env.DEV) return;
  console.error("[ai-suggestions] request failed", {
    status,
    code,
    message: SAFE_ERROR_MESSAGES[code],
  });
}

function createGuestId(): string | null {
  if (typeof crypto === "undefined") return null;
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10).join(""),
  ].join("-");
}

function getGuestId(): string | null {
  if (typeof window === "undefined") return null;
  if (volatileGuestId) return volatileGuestId;
  try {
    const stored = window.localStorage.getItem(GUEST_ID_STORAGE_KEY);
    if (stored && UUID_PATTERN.test(stored)) {
      volatileGuestId = stored;
      return stored;
    }
  } catch {
    // Storage may be disabled; keep a per-page identifier instead.
  }
  volatileGuestId = createGuestId();
  if (!volatileGuestId) return null;
  try {
    window.localStorage.setItem(GUEST_ID_STORAGE_KEY, volatileGuestId);
  } catch {
    // Guest suggestions still work for this page session.
  }
  return volatileGuestId;
}

async function classifyInvokeError(
  error: InvokeError,
): Promise<
  Exclude<AiExtractionState, { status: "idle" | "loading" | "success" }>
> {
  // The client-side timeout surfaces as an abort, possibly wrapped in a fetch error.
  const aborted = (name?: string) =>
    name === "AbortError" || name === "TimeoutError";
  if (aborted(error.name) || aborted(error.context?.name)) {
    logAiFailure(error.context?.status, "timeout");
    return { status: "error", kind: "timeout" };
  }
  if (
    error.name === "FunctionsFetchError" ||
    error.name === "FunctionsRelayError"
  ) {
    logAiFailure(error.context?.status, "network");
    return { status: "error", kind: "network" };
  }
  const status = error.context?.status;
  let body: { error?: unknown; retryAfterSeconds?: unknown } | undefined;
  try {
    body = (await error.context?.json?.()) as typeof body;
  } catch {
    body = undefined;
  }
  const rawCode = body?.error;
  const code =
    typeof rawCode === "string" && rawCode in SAFE_ERROR_MESSAGES
      ? rawCode
      : status === 401
        ? "auth_required"
        : status === 429
          ? "rate_limited"
          : status === 504
            ? "timeout"
            : "request_failed";
  logAiFailure(status, code);
  if (code === "rate_limited" || status === 429) {
    const seconds = Number(body?.retryAfterSeconds);
    return {
      status: "error",
      kind: "rate_limited",
      retryAfterSeconds:
        Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 60,
    };
  }
  if (code === "not_configured" || status === 404)
    return { status: "unavailable" };
  if (code === "auth_required" || status === 401)
    return { status: "signin_required" };
  if (code === "invalid_input")
    return { status: "error", kind: "invalid_input" };
  if (code === "timeout" || status === 504)
    return { status: "error", kind: "timeout" };
  return { status: "error", kind: "failed" };
}

/** Calls the Edge Function with a PII-sanitized description. */
export async function requestAiSuggestions(
  description: string,
): Promise<Exclude<AiExtractionState, { status: "idle" | "loading" }>> {
  if (!isSupabaseConfigured()) return { status: "unavailable" };
  const accountSession = getAccountSession();
  if (accountSession.status === "loading")
    return { status: "signin_required" };
  const isSignedIn = accountSession.status === "authenticated";
  const guestId = isSignedIn ? null : getGuestId();
  if (!isSignedIn && !guestId) return { status: "error", kind: "failed" };
  const text = sanitizeDescription(description).slice(0, AI_MAX_DESCRIPTION);
  // Nothing useful left once personal data is removed: do not call the service.
  if (!text.split(REDACTED).join("").trim())
    return { status: "error", kind: "invalid_input" };
  if (typeof navigator !== "undefined" && navigator.onLine === false)
    return { status: "error", kind: "network" };
  try {
    const { data, error } = await getSupabaseClient().functions.invoke(
      AI_FUNCTION_NAME,
      {
        body: { description: text },
        headers: guestId ? { "x-guest-id": guestId } : undefined,
        timeout: AI_CLIENT_TIMEOUT_MS,
      },
    );
    if (error) return classifyInvokeError(error as InvokeError);
    const raw = (data as { suggestions?: unknown } | null)?.suggestions;
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      logAiFailure(undefined, "request_failed");
      return { status: "error", kind: "failed" };
    }
    // Re-check on the client: anything outside the known values is "unknown".
    const hazard = (raw as { hazardType?: unknown }).hazardType;
    return {
      status: "success",
      suggestions: {
        hazardType: REPORT_HAZARDS.includes(hazard as ReportHazard)
          ? (hazard as ReportHazard)
          : "unknown",
        ...observationExtras(raw),
      },
    };
  } catch (error) {
    const name = (error as { name?: string })?.name;
    const timedOut = name === "AbortError" || name === "TimeoutError";
    logAiFailure(undefined, timedOut ? "timeout" : "network");
    return {
      status: "error",
      kind: timedOut ? "timeout" : "network",
    };
  }
}

export function useAiExtraction() {
  const [state, setState] = useState<AiExtractionState>({ status: "idle" });
  // Ignore responses from an older request.
  const requestId = useRef(0);

  const run = useCallback(async (description: string) => {
    const id = ++requestId.current;
    setState({ status: "loading" });
    const result = await requestAiSuggestions(description);
    if (id === requestId.current) setState(result);
  }, []);

  const reset = useCallback(() => {
    requestId.current++;
    setState({ status: "idle" });
  }, []);

  return { state, run, reset };
}
