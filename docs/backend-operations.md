# Backend Operations (BE1-04)

## Current repository state

- `supabase/migrations/` contains
  `20261114120000_ai_usage_rate_limit.sql` and
  `20261126003000_ai_guest_rate_limit.sql`.
- There is no `supabase/seed.sql` or configured database seed path. The app's
  fixtures in `src/data/fixtures.ts` are client-side synthetic data, not a
  Supabase seed.
- `supabase/config.toml` configures the `extract-hazard` function only.
- CI runs checks only; it must not link to Supabase, apply migrations, seed a
  remote database, or deploy functions.

## Migration conventions

1. Add a new timestamped, descriptive SQL file under `supabase/migrations/`
   for each schema change. Do not edit or delete a migration that has been
   applied or shared.
2. Keep migrations additive and include least-privilege grants and RLS policy
   changes where needed. Review SQL and its rollback/data impact before use.
3. Use a disposable local Supabase stack for development:

   ```sh
   supabase start
   supabase migration list --local
   supabase migration up --local
   ```

4. `supabase db reset` is destructive: it recreates the local database and
   replays migrations and configured seeds. Use it only on a disposable local
   stack with explicit operator intent. Never use it against staging, pilot, or
   production.
5. Before any remote migration, confirm the linked project identity and review
   pending changes:

   ```sh
   supabase migration list --linked
   supabase db push --dry-run
   ```

   Applying a migration to shared staging or production requires explicit
   approval. Do not run remote migration commands from CI.

## Seed conventions

There is currently no database seed. If one is introduced, keep it in
`supabase/seed.sql`, add only synthetic fixture data, and configure its path in
`supabase/config.toml`. Seeds are for local development and isolated demo
projects only. Do not put credentials, real accounts, real reports, or pilot
data in a seed, and do not apply demo seeds to staging or pilot.

## Edge/API error contract

New handlers can use
`supabase/functions/_shared/api-error.ts`. It creates a `request_id`, returns a stable `{ code, message, field_errors, retryable,
request_id }` JSON envelope, and logs only the error code and request ID for
server errors. Field errors are empty unless a future safe, fixed mapping is
added. Callers select from predefined error codes; the helper does not accept
or return raw exceptions, provider messages, SQL errors, or arbitrary detail
strings.

The existing `extract-hazard` handler retains its established response shape
and logging behavior; it is not wired to this helper as part of BE1-04.

## Continuous integration

`.github/workflows/ci.yml` runs environment-template validation, typecheck,
lint, unit tests, and a production build on pull requests and pushes. The job
uses no Supabase credentials and performs no migration, seed, or deployment.
