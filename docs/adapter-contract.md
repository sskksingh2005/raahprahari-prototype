# Adapter Contract (BE1-02)

Status: canonical boundaries confirmed; implementation is partial.

This document defines the boundary between the React PWA and the canonical
Supabase backend. A planned contract is not evidence that a production handler
or remote Supabase configuration exists.

## Canonical boundaries

| Behaviour                     | Contract boundary                                                                                                                                                                                                                        | Current repo state                                                                                                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account session               | Supabase Auth owns sign-in, email confirmation, recovery, and session refresh. The browser uses only the project URL and public anon key; authorization is enforced by server-side policies/handlers, never by client-selected roles.    | Auth client flows are implemented. Core role/jurisdiction schema and server-side role policies are not present in repo migrations.                                                              |
| AI hazard extraction          | `POST` to the Supabase `extract-hazard` Edge Function with a sanitized description. Return schema-limited suggestions as unconfirmed assistance; never create or approve a report. Gemini and service-role credentials stay server-side. | Function and client invocation are implemented. Deployment/secrets are unverified. The current function error response uses `{ error, detail? }`, not the proposed common error envelope below. |
| Report metadata sync          | Idempotent `PUT /reports/{reportId}` with an authenticated user token; return a validated receipt. The client contract is in `src/lib/sync/contract.ts`; the HTTP adapter uses `VITE_REPORTS_API_BASE`.                                  | Client transport and local outbox exist. The server endpoint is not implemented in this repo; local report flow remains device-backed when no service is configured.                            |
| Report media                  | Request a short-lived signed upload target for an authenticated report/attachment, then upload the blob to a private Storage bucket. The backend validates ownership and binds the object to its report.                                 | Client transport expects the upload-target contract, but no report handler, bucket, or Storage policy is defined in repo.                                                                       |
| Segment/advisory reads        | Return sanitized public segment/advisory data. Keep private evidence and reviewer-only data out of public responses.                                                                                                                     | Planned contract only; current advisories use synthetic fixtures.                                                                                                                               |
| Review and official mutations | Require backend-verified identity, role and jurisdiction; validate expected version; return the persisted decision/state and audit history.                                                                                              | Planned contract only. Role policies, review handlers, and persistence schema are absent from repo migrations.                                                                                  |
| Official publishing adapter   | The current client placeholder posts to `/api/official/notices`; any live implementation must be a server-side Supabase-backed handler with authorization and audit enforcement.                                                         | No production route exists. Development `?mock=` responses are simulated and are not a live adapter.                                                                                            |

## Response and security rules

- Timestamps are UTC. Event, receipt, review, and cache times are separate
  fields.
- Public advisory output and private evidence are separate.
- Never return raw SQL errors, provider secrets, or service-role credentials.
- The server validates identity, ownership, authorization, input, and database
  state. The PWA is not an authorization boundary.
- AI output is unconfirmed assistance and does not replace a traveller,
  reviewer, or official decision.

## Common error envelope (target for new/updated adapters)

```json
{
  "code": "REPORT_CONFLICT",
  "message": "A different payload already exists for this report ID.",
  "field_errors": { "event_time": "Must not be in the future." },
  "retryable": false,
  "request_id": "req_8f3a1c"
}
```

This is a target contract, not a claim that existing handlers already return
this shape. Preserve existing behavior when aligning adapters; in particular,
`extract-hazard` retains its existing `{ error, detail? }` response shape.
New handlers can use `supabase/functions/_shared/api-error.ts` for predefined
safe messages and generated request IDs; the helper is not wired into
`extract-hazard`.

## Development stubs vs live paths

- `src/dev/receipt-stub.ts` is an in-memory development-only report receipt and
  identity stub. It is not a persistence service and must not be used as
  evidence of production delivery.
- The `?mock=` responses in `src/official/publishApi.ts` are development-only.
  The production request currently has no in-repo server handler.
- Live report delivery requires a configured `VITE_REPORTS_API_BASE` pointing
  to the separately implemented report service. Live Auth and
  `extract-hazard` require a configured Supabase project and deployed function.
- Never silently fall back from a failed live integration to a success-shaped
  stub response.

## Planned endpoint inventory

| Behaviour                    | Contract                                                                                  | Status                                     | Actual name / implementation                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Submit report                | Authenticated, idempotent metadata write; return report/receipt and media requirements.   | Planned                                    | `PUT /reports/{reportId}` — client contract only, no in-repo server handler                |
| Complete media               | Validate owner and report link; issue short-lived upload target for private Storage.      | Planned                                    | `POST /reports/{reportId}/attachments/{attachmentId}/upload-target` — client contract only |
| Get segments/advisory        | Filtered, sanitized public advisory data with evidence freshness and rule version.        | Planned                                    | No live endpoint; seeded client fixtures                                                   |
| Extract report               | Return schema-valid, unconfirmed suggestions and safe errors.                             | Implemented in repo; deployment unverified | `extract-hazard` Supabase Edge Function                                                    |
| Get reviewer incidents       | Return authorized incidents and evidence to the assigned reviewer.                        | Planned                                    | No handler or application schema                                                           |
| Review mutation              | Validate role, jurisdiction, rationale, and expected version; persist decision and audit. | Planned                                    | No handler or application schema                                                           |
| Clearance report             | Record a pending clearance observation for review.                                        | Planned                                    | No handler or application schema                                                           |
| Official update              | Validate official role/jurisdiction and source; persist restriction/version/history.      | Planned                                    | Client placeholder `/api/official/notices`; no production handler                          |
| Contribution views/mutations | Optional; define only when a live use case is approved.                                   | Optional                                   | No live adapter                                                                            |

## Change safety

No destructive migration or provider replacement is authorized by this
contract. Do not drop/delete/truncate data, edit/delete an existing migration,
replace Auth or Storage providers, change a bucket's public/private setting,
loosen RLS, or apply migrations to shared/production environments without
explicit approval. Prefer additive migrations for approved schema changes.
