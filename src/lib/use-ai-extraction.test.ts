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
  vi.restoreAllMocks();
  invoke.mockReset();
  configured.value = true;
  setAccountSession({ status: "signed_out", userId: null });
  window.localStorage.removeItem("raahprahari.ai-guest-id");
});

describe("guest and signed-in access", () => {
  it("allows guests with a stable guest quota ID", async () => {
    setAccountSession({ status: "signed_out", userId: null });
    invoke.mockResolvedValue({
      data: {
        suggestions: {
          hazardType: "landslide",
          laneDirection: "unknown",
          vehicleApplicability: "unknown",
          source: "unknown",
        },
      },
      error: null,
    });
    await expect(requestAiSuggestions("Rocks on road")).resolves.toMatchObject({
      status: "success",
      suggestions: { hazardType: "landslide" },
    });
    const [, options] = invoke.mock.calls[0];
    expect(options).toMatchObject({
      body: { description: "Rocks on road" },
      headers: { "x-guest-id": expect.stringMatching(/^[0-9a-f-]{36}$/i) },
      timeout: AI_CLIENT_TIMEOUT_MS,
    });
    expect(options.headers).not.toHaveProperty("Authorization");
    expect(window.localStorage.getItem("raahprahari.ai-guest-id")).toBe(
      options.headers["x-guest-id"],
    );
  });

  it("does not send the description while the account session is loading", async () => {
    setAccountSession({ status: "loading", userId: null });
    await expect(requestAiSuggestions("Rocks on road")).resolves.toEqual({
      status: "signin_required",
    });
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
      headers: undefined,
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

  it("logs safe request diagnostics in development without logging report data", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    invoke.mockResolvedValue({
      data: null,
      error: httpError(502, {
        error: "upstream_error",
        message: "private report text must not be logged",
      }),
    });
    await expect(
      requestAiSuggestions("Rocks at 9876543210"),
    ).resolves.toMatchObject({ status: "error", kind: "failed" });
    expect(log).toHaveBeenCalledWith("[ai-suggestions] request failed", {
      status: 502,
      code: "upstream_error",
      message: "The suggestion provider failed.",
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain("private report text");
    expect(JSON.stringify(log.mock.calls)).not.toContain("9876543210");
  });

  it("does not call the service when only personal data was entered", async () => {
    await expect(requestAiSuggestions("9876543210")).resolves.toEqual({
      status: "error",
      kind: "invalid_input",
    });
    expect(invoke).not.toHaveBeenCalled();
  });
});
