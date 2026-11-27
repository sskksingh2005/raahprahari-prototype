# Backend Operations (BE1-04)

## Current repository state

- `supabase/migrations/` contains
  `20261114120000_ai_usage_rate_limit.sql` and
  `20261126003000_ai_guest_rate_limit.sql`, plus
  `20261127090000_core_domain_schema.sql` for the BE1-05 core domain schema.
- The core schema defines profiles, road segments, hazard reports and
  attachments, hazard clusters, segment advisories, official updates,
  moderation actions, and audit events. The base tables have RLS enabled with
  no client policies; server-side authorization policies are a separate step.
- `20261127130000_postgis_spatial_columns.sql` enables PostGIS in
  `extensions`, adds SRID 4326 road-centerline and report-point geometry, and
  creates GIST indexes. District boundaries have a separate protected lookup
  table and must be populated from authoritative data; synthetic route lines
  are not copied into the spatial column.
- `20261127130100_postgis_lookup_functions.sql` adds server-only
  `find_nearby_road_segments` and `find_nearest_road_segment` helpers. They
  use geography distances in meters and return only segment IDs, route labels,
  and distance; invalid coordinates, radii, or limits return no matches.
- `20261127131000_protected_profile_roles.sql` creates traveller profiles on
  Auth signup, grants users access only to their own profile and display name,
  and adds the audited `assign_profile_role` path. Roles are read from the
  protected profile, never from user-editable metadata. Bootstrap the first
  admin only from the Supabase SQL Editor as a database administrator, using
  `select public.assign_profile_role('<auth-user-uuid>', 'admin');`; later
  assignments require an admin profile or trusted `service_role`.
- `supabase/tests/profile_role_security.test.sql` verifies the profile grants,
  signup default, metadata handling, and ordinary-user elevation denials with
  pgTAP (`supabase test db`).
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
