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
  /** AI is limited to signed-in users; manual reporting does not need sign-in. */
  | { status: "signin_required" };

export const AI_FUNCTION_NAME = "extract-hazard";
export const AI_MAX_DESCRIPTION = 2000;

type InvokeError = {
  name?: string;
  context?: { name?: string; status?: number; json?: () => Promise<unknown> };
};

async function classifyInvokeError(
  error: InvokeError,
): Promise<
  Exclude<AiExtractionState, { status: "idle" | "loading" | "success" }>
> {
  // The client-side timeout surfaces as an abort, possibly wrapped in a fetch error.
  const aborted = (name?: string) =>
    name === "AbortError" || name === "TimeoutError";
  if (aborted(error.name) || aborted(error.context?.name))
    return { status: "error", kind: "timeout" };
  if (
    error.name === "FunctionsFetchError" ||
    error.name === "FunctionsRelayError"
  )
    return { status: "error", kind: "network" };
  const status = error.context?.status;
  let body: { error?: unknown; retryAfterSeconds?: unknown } | undefined;
  try {
    body = (await error.context?.json?.()) as typeof body;
  } catch {
    body = undefined;
  }
  const code = body?.error;
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
  // The server rejects callers without a user session; don't send the text.
  if (getAccountSession().status !== "authenticated")
    return { status: "signin_required" };
  const text = sanitizeDescription(description).slice(0, AI_MAX_DESCRIPTION);
  // Nothing useful left once personal data is removed: do not call the service.
  if (!text.split(REDACTED).join("").trim())
    return { status: "error", kind: "invalid_input" };
  if (typeof navigator !== "undefined" && navigator.onLine === false)
    return { status: "error", kind: "network" };
  try {
    const { data, error } = await getSupabaseClient().functions.invoke(
      AI_FUNCTION_NAME,
      { body: { description: text }, timeout: AI_CLIENT_TIMEOUT_MS },
    );
    if (error) return classifyInvokeError(error as InvokeError);
    const raw = (data as { suggestions?: unknown } | null)?.suggestions;
    if (typeof raw !== "object" || raw === null)
      return { status: "error", kind: "failed" };
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
    return {
      status: "error",
      kind:
        name === "AbortError" || name === "TimeoutError"
          ? "timeout"
          : "network",
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
