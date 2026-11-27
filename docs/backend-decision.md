# Backend Decision (BE1-02)

Date: 2026-11-26 | Status: CONFIRMED (canonical architecture)

## 1. Canonical backend

Use one backend: Supabase Auth + PostgreSQL/PostGIS + private Supabase Storage +
server-side TypeScript Edge Functions and restricted SQL/RPC. The client is a
React PWA.

This confirms the target architecture, not that every backend capability is
already implemented or deployed.

## 2. BE1-01 implementation boundary

- Supabase Auth client flows and the `extract-hazard` Edge Function are present.
- Repo migrations currently cover AI rate-limit tables/RPCs, not the core
  reports, segments, roles, review, or advisory schema.
- Report sync has a client transport contract, but its report API is external
  and not implemented in this repo. Official publishing also has no production
  server endpoint; its development mock is not a backend.
- Report drafts, queued work, and photos are stored locally in the browser.
- No FastAPI or other competing backend was found.

See [backend-inventory.md](./backend-inventory.md) for the BE1-01 evidence and
gaps, and [adapter-contract.md](./adapter-contract.md) for integration
boundaries.

## 3. Provider and backend choice

| Item                                                                   | Decision                                              | Approval required?     |
| ---------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------- |
| Supabase Auth, PostgreSQL/PostGIS, private Storage, Edge Functions/RPC | Canonical; keep                                       | No                     |
| FastAPI or another overlapping backend                                 | Do not add                                            | Yes, explicit approval |
| Python inference service                                               | Not in scope; reconsider only after an evaluated need | Yes, explicit approval |

## 4. Rationale

- One backend security model for authentication, RLS, and server-enforced roles.
- One migration history and no duplicated business logic across backends.
- Provider secrets and privileged database access remain server-side.

## 5. Explicit approval boundary

No destructive migration/data operation or provider replacement is performed
without explicit approval. This includes:

1. Dropping, deleting, or truncating tables, columns, or data.
2. Editing or deleting an existing migration (prefer a new migration).
3. Replacing the Auth or Storage provider, or changing a bucket's
   public/private setting.
4. Adding an overlapping backend such as FastAPI.
5. Applying migrations to production/shared staging, loosening RLS, rotating
   or deleting secrets, or resetting a shared database.

## 6. Open implementation decisions

- Define and review the core application schema, RLS policies, and private
  Storage policy before implementing live report/reviewer/official workflows.
- Decide the migration sequence for that schema; this decision does not
  authorize applying migrations to any shared or production project.
