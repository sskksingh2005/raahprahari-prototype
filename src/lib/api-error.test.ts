import { describe, expect, it, vi } from "vitest";
import {
  apiErrorResponse,
  createApiErrorEnvelope,
} from "../../supabase/functions/_shared/api-error";

describe("API error responses", () => {
  it("returns a stable envelope with a generated request ID", async () => {
    const response = apiErrorResponse("REPORT_CONFLICT");
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(response.headers.get("X-Request-Id")).toBe(body.request_id);
    expect(body).toEqual({
      code: "REPORT_CONFLICT",
      message: "The report conflicts with an existing record.",
      field_errors: {},
      retryable: false,
      request_id: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ),
    });
  });

  it("uses only safe, predefined details in error envelopes and logs", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const envelope = createApiErrorEnvelope("INTERNAL_ERROR");
    const response = apiErrorResponse("INTERNAL_ERROR");
    const body = await response.json();

    expect(body.message).toBe("The request could not be completed.");
    expect(log).toHaveBeenCalledWith("[api] request failed", {
      code: "INTERNAL_ERROR",
      request_id: body.request_id,
    });
    expect(
      JSON.stringify({ envelope, body, calls: log.mock.calls }),
    ).not.toMatch(/stack trace|secret|provider response/i);
    log.mockRestore();
  });
});
