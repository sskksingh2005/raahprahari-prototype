const API_ERRORS = {
  INVALID_REQUEST: {
    status: 400,
    message: "Request is invalid.",
    retryable: false,
  },
  AUTH_REQUIRED: {
    status: 401,
    message: "Authentication is required.",
    retryable: false,
  },
  FORBIDDEN: {
    status: 403,
    message: "This action is not allowed.",
    retryable: false,
  },
  NOT_FOUND: {
    status: 404,
    message: "The requested resource was not found.",
    retryable: false,
  },
  REPORT_CONFLICT: {
    status: 409,
    message: "The report conflicts with an existing record.",
    retryable: false,
  },
  RATE_LIMITED: {
    status: 429,
    message: "The request limit was reached.",
    retryable: true,
  },
  UPSTREAM_UNAVAILABLE: {
    status: 503,
    message: "A required service is temporarily unavailable.",
    retryable: true,
  },
  INTERNAL_ERROR: {
    status: 500,
    message: "The request could not be completed.",
    retryable: true,
  },
} as const;

export type ApiErrorCode = keyof typeof API_ERRORS;

export interface ApiErrorEnvelope {
  code: ApiErrorCode;
  message: string;
  field_errors: Record<string, string>;
  retryable: boolean;
  request_id: string;
}

export function createApiErrorEnvelope(code: ApiErrorCode): ApiErrorEnvelope {
  const definition = API_ERRORS[code];
  return {
    code,
    message: definition.message,
    field_errors: {},
    retryable: definition.retryable,
    request_id: crypto.randomUUID(),
  };
}

/** Returns a safe error response; internal error details are never accepted. */
export function apiErrorResponse(code: ApiErrorCode): Response {
  const definition = API_ERRORS[code];
  const body = createApiErrorEnvelope(code);

  if (definition.status >= 500) {
    console.error("[api] request failed", {
      code,
      request_id: body.request_id,
    });
  }

  return new Response(JSON.stringify(body), {
    status: definition.status,
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": body.request_id,
    },
  });
}
