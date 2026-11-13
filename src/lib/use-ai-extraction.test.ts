import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setAccountSession } from "@/lib/account-session";
import {
  AI_CLIENT_TIMEOUT_MS,
  requestAiSuggestions,
} from "@/lib/use-ai-extraction";

const invoke = vi.hoisted(() => vi.fn());
const configured = vi.hoisted(() => ({ value: true }));

vi.mock("@/lib/supabase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabase")>();
  return {
    ...actual,
    isSupabaseConfigured: () => configured.value,
    getSupabaseClient: () => ({ functions: { invoke } }),
  };
});

const httpError = (status: number, body: unknown) => ({
  name: "FunctionsHttpError",
  context: { status, json: async () => body },
});

beforeEach(() => {
  setAccountSession({ status: "authenticated", userId: "u1" });
});

afterEach(() => {
  invoke.mockReset();
  configured.value = true;
  setAccountSession({ status: "signed_out", userId: null });
});

describe("sign-in requirement", () => {
  it("does not send the description while signed out or loading", async () => {
    for (const session of [
      { status: "signed_out", userId: null },
      { status: "loading", userId: null },
    ] as const) {
      setAccountSession(session);
      await expect(requestAiSuggestions("Rocks on road")).resolves.toEqual({
        status: "signin_required",
      });
    }
    expect(invoke).not.toHaveBeenCalled();
  });

  it("maps a 429 to rate_limited with the server's retry time", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: httpError(429, { error: "rate_limited", retryAfterSeconds: 42 }),
    });
    await expect(requestAiSuggestions("Rocks")).resolves.toEqual({
      status: "error",
      kind: "rate_limited",
      retryAfterSeconds: 42,
    });
    invoke.mockResolvedValue({ data: null, error: httpError(429, {}) });
    await expect(requestAiSuggestions("Rocks")).resolves.toMatchObject({
      kind: "rate_limited",
      retryAfterSeconds: 60,
    });
  });

  it("treats a quota-service outage as a failure", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: httpError(503, { error: "quota_unavailable" }),
    });
    await expect(requestAiSuggestions("Rocks")).resolves.toEqual({
      status: "error",
      kind: "failed",
    });
  });

  it("maps a 401 from the function (expired session) to signin_required", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: httpError(401, { error: "auth_required" }),
    });
    await expect(requestAiSuggestions("Rocks")).resolves.toEqual({
      status: "signin_required",
    });
  });
});

describe("requestAiSuggestions", () => {
  it("sends a sanitized description and returns suggestions without applying them", async () => {
    invoke.mockResolvedValue({
      data: {
        suggestions: {
          hazardType: "flooding",
          laneDirection: "full_width",
          vehicleApplicability: "no_vehicles",
          source: "secondhand",
        },
      },
      error: null,
    });
    await expect(
      requestAiSuggestions("Water over road, call 9876543210 or a@b.com"),
    ).resolves.toEqual({
      status: "success",
      suggestions: {
        hazardType: "flooding",
        laneDirection: "full_width",
        vehicleApplicability: "no_vehicles",
        source: "secondhand",
      },
    });
    expect(invoke).toHaveBeenCalledWith("extract-hazard", {
      body: { description: "Water over road, call [removed] or [removed]" },
      timeout: AI_CLIENT_TIMEOUT_MS,
    });
  });

  it("maps server and client timeouts to a timeout error", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: httpError(504, { error: "timeout" }),
    });
    await expect(requestAiSuggestions("Rocks")).resolves.toEqual({
      status: "error",
      kind: "timeout",
    });
    invoke.mockResolvedValue({
      data: null,
      error: { name: "FunctionsFetchError", context: { name: "AbortError" } },
    });
    await expect(requestAiSuggestions("Rocks")).resolves.toEqual({
      status: "error",
      kind: "timeout",
    });
    invoke.mockRejectedValue(new DOMException("timed out", "TimeoutError"));
    await expect(requestAiSuggestions("Rocks")).resolves.toEqual({
      status: "error",
      kind: "timeout",
    });
  });

  it("treats a malformed success body as a failure, not as suggestions", async () => {
    for (const data of [null, {}, { suggestions: "landslide" }]) {
      invoke.mockResolvedValue({ data, error: null });
      await expect(requestAiSuggestions("Rocks")).resolves.toEqual({
        status: "error",
        kind: "failed",
      });
    }
  });

  it("treats unexpected values from the server as unknown", async () => {
    invoke.mockResolvedValue({
      data: { suggestions: { hazardType: "meteor", laneDirection: 3 } },
      error: null,
    });
    await expect(requestAiSuggestions("Something")).resolves.toEqual({
      status: "success",
      suggestions: {
        hazardType: "unknown",
        laneDirection: "unknown",
        vehicleApplicability: "unknown",
        source: "unknown",
      },
    });
  });

  it("is unavailable without Supabase config, a deployed function or a server key", async () => {
    configured.value = false;
    await expect(requestAiSuggestions("Rocks")).resolves.toEqual({
      status: "unavailable",
    });
    expect(invoke).not.toHaveBeenCalled();
    configured.value = true;
    invoke.mockResolvedValue({
      data: null,
      error: httpError(503, { error: "not_configured" }),
    });
    await expect(requestAiSuggestions("Rocks")).resolves.toEqual({
      status: "unavailable",
    });
    invoke.mockResolvedValue({ data: null, error: httpError(404, {}) });
    await expect(requestAiSuggestions("Rocks")).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("maps network, invalid input and upstream failures to errors", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: { name: "FunctionsFetchError" },
    });
    await expect(requestAiSuggestions("Rocks")).resolves.toEqual({
      status: "error",
      kind: "network",
    });
    invoke.mockResolvedValue({
      data: null,
      error: httpError(400, { error: "invalid_input" }),
    });
    await expect(requestAiSuggestions("Rocks")).resolves.toEqual({
      status: "error",
      kind: "invalid_input",
    });
    invoke.mockResolvedValue({
      data: null,
      error: httpError(502, { error: "upstream_error" }),
    });
    await expect(requestAiSuggestions("Rocks")).resolves.toEqual({
      status: "error",
      kind: "failed",
    });
    invoke.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(requestAiSuggestions("Rocks")).resolves.toEqual({
      status: "error",
      kind: "network",
    });
  });

  it("does not call the service when only personal data was entered", async () => {
    await expect(requestAiSuggestions("9876543210")).resolves.toEqual({
      status: "error",
      kind: "invalid_input",
    });
    expect(invoke).not.toHaveBeenCalled();
  });
});
