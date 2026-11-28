# Backend Operations (BE1-04)

## Current repository state

- `supabase/migrations/` contains the AI quota migrations and the ordered
  BE1 database foundation migrations through
  `20261127144000_rate_limit_state_maintenance.sql`. The full execution order
  is listed in the Phase 1 verification runbook below.
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
- `20261127132000_domain_rls_policies.sql` adds the BE1-09 policy matrix:
  anonymous and authenticated clients can read only selected public road,
  advisory, open-cluster, and active-restriction fields; authenticated
  users can create and read their own reports and attachments, with
  attachments limited to reports under review or needing information.
  Verified reviewers/moderators/admins can read reports and append moderation
  actions; verified officials/admins can publish and update restrictions and
  read full restriction details through `list_official_updates_for_staff()`.
  Clients cannot change report status, write advisories/clusters, or access
  audit events; report state transitions remain service-role-only. Direct
  client audit writes remain blocked. Role checks read `public.profiles`
  through a `SECURITY DEFINER` helper with an empty `search_path`.
- `supabase/tests/profile_role_security.test.sql` verifies the profile grants,
  signup default, metadata handling, and ordinary-user elevation denials with
  pgTAP (`supabase test db`).
- `supabase/tests/domain_rls_security.test.sql` checks BE1-09 RLS enablement,
  client column/table grants, role-helper safety, server-only audit access,
  and preservation of profile and spatial-boundary protections.
- `20261127133000_report_media_storage.sql` provisions the private
  `report-media` bucket for JPEG/PNG objects up to 10 MiB. Object names use
  `<report-uuid>/<attachment-key>.<jpg|jpeg|png>` and must match the
  corresponding `report_attachments.storage_path` row and media type.
  Authenticated owners can read their own media and upload while reports are
  under review or need information; reviewers/moderators/admins can read it.
  Anonymous access, client overwrite, and client deletion are blocked, even
  if a broader storage policy exists. The client currently keeps photos in
  IndexedDB and asks the reports API for a short-lived signed PUT URL; that
  trusted endpoint must create the matching attachment metadata and enforce
  the owner before issuing the URL.
- `supabase/tests/report_media_storage_security.test.sql` checks bucket
  privacy/limits and the owner, staff, and restrictive storage policy setup.
- `20261127134000_synthetic_road_reference_seed.sql` adds the fixture-backed
  `road_corridors` reference table and seeds 14 corridors plus 36 road
  segments with stable IDs and `ON CONFLICT DO NOTHING`. Seeded segments are
  marked `is_synthetic = true`; pre-existing segment rows remain unclassified
  (`NULL`). Approximate fixture paths are not copied into PostGIS centerlines.
  Corridor rows remain service-role-only; the existing public road-segment
  policy additionally exposes the synthetic marker. Verify the seed locally
  with `supabase test db` and `supabase db query --local "select count(*) from
public.road_segments where is_synthetic is true;"`.
- `20261127135000_domain_audit_triggers.sql` records successful
  `hazard_reports`, `report_attachments`, `moderation_actions`, and
  `official_updates` inserts, updates, and deletes in `audit_events`. The
  security-definer trigger writes allowlisted before/after snapshots in the
  same transaction, omitting report prose, coordinates, storage paths, and
  moderation rationale. Actor IDs come from the authenticated subject or
  validated row metadata on creation; missing profiles are recorded as null.
  The existing `assign_profile_role` audit path is unchanged, so role changes
  are not double-logged. Client roles still cannot read or write audit events.
- `supabase/tests/domain_audit_security.test.sql` verifies trigger coverage,
  safe function settings, revoked client execution, and the existing role
  assignment audit path.
- `20261127140000_hazard_report_state_validation.sql` requires new reports to
  start `under_review`, permits status changes only while reports are pending,
  and rejects transitions out of settled outcomes. It also rejects self-links
  and contradictory duplicate/conflict links. Client report updates remain
  blocked by BE1-09; the trigger is a second database-level guard for trusted
  server writes. Verify lifecycle and link rules with
  `supabase test db` after applying the local migrations.
- `20261127141000_segment_aggregation_helpers.sql` adds service-role-only,
  invoker-security refresh functions for hazard clusters and per-segment
  advisories. `refresh_hazard_clusters` reconciles one segment's open groups
  from fresh, non-rejected, non-duplicate hazard reports and is safe to rerun.
  `refresh_segment_advisory` mirrors the client precedence/freshness rules,
  including official restrictions, verified corroboration, and unknown for
  empty or clear-only evidence. Both accept an optional evaluation timestamp;
  an empty timestamp uses the current time. Clients retain read-only access.
  Verify permissions, idempotency, empty evidence, and aggregation behavior
  with `supabase test db`.
- `20261127142000_official_update_lifecycle_validation.sql` validates
  effective/review windows and starts new restrictions as `active` with
  clearance `not_requested`. Restrictions can only be explicitly lifted;
  expired windows do not lift them, and a pending clearance cannot be lifted
  until resolved. Verified clearance cannot be downgraded, and a lifted
  restriction cannot be reactivated. Existing official/admin RLS authorization
  and BE1-12 audit logging remain in force. Verify lifecycle rules and their
  interaction with BE1-14 advisory refresh using `supabase test db`.
- `20261127143000_report_submission_throttle.sql` enforces five newly
  inserted reports per authenticated account in a fixed ten-minute window.
  The private counter stores one row per account, counts only committed new
  rows, and cascades on Auth-user deletion; idempotent updates do not consume
  another slot. Its database error uses the controlled
  `report_submission_rate_limited` marker and retry interval; the reports API
  should translate that to HTTP 429 with `Retry-After`, which the existing
  outbox transport already honors. This is separate from the unchanged AI
  extraction quotas. Verify limits, reset behavior, private grants, and
  cleanup with `supabase test db`.
- `20261127144000_rate_limit_state_maintenance.sql` adds the
  service-role-only `prune_expired_rate_limit_state()` maintenance function.
  It removes only AI-user, AI-guest, and report-submission counters whose
  windows started more than one day ago, returning a deletion count for each
  table. It does not touch reports, audit events, or active quota windows and
  is not scheduled automatically; operators may invoke it from a trusted
  maintenance job. The one-day cutoff exceeds current 60-second AI and
  ten-minute report windows; reassess it if quota window settings change.
  Verify cutoff behavior, repeatability, grants, and Auth-delete cascades with
  `supabase test db`.
- There is no `supabase/seed.sql` or configured database seed path. The app's
  fixtures in `src/data/fixtures.ts` are client-side synthetic data, not a
  Supabase seed.
- `supabase/config.toml` configures the `extract-hazard` function only.
- CI runs checks only; it must not link to Supabase, apply migrations, seed a
  remote database, or deploy functions.

## Phase 1 verification and sign-off (BE1-01–BE1-23)

BE1-01 through BE1-23 establish the Community Auth profile boundary, core
domain schema, PostGIS lookup boundary, RLS and storage policies, synthetic
reference data, audited lifecycle rules, report throttling, quota retention,
and their verification/runbook. BE1-18 through BE1-23 are verification and
handoff work; they add no database migrations. Do not treat this sign-off as
approval to apply migrations to a shared project. The automated pgTAP suite
must pass against the intended database before deployment approval.

### Automated verification

The SQL tests in `supabase/tests/` cover profile roles, domain RLS, private
media, seed data, audit snapshots, report and official-update lifecycles,
advisory/cluster refresh, submission throttling, and quota maintenance. The
cross-cutting `phase1_backend_smoke.test.sql` checks required relations, RLS,
definer-function search paths, and protected writes.
`spatial_lookup_verification.test.sql` checks SRID 4326 typmods, GiST indexes,
server-only lookup grants, synthetic centerline exclusion, and meter-based
lookup results. Tests run inside rollback transactions and do not retain
their fixtures.

On a disposable local Supabase stack, run:

```sh
supabase start
supabase migration list --local
supabase migration up --local
supabase test db
```

Confirm every migration through
`20261127144000_rate_limit_state_maintenance.sql` is applied before interpreting
pgTAP results. `supabase test db` targets the local stack; it does not verify a
remote database. When local Postgres/Docker is unavailable, keep the tests
pending and use the read-only SQL Editor checks below only after the ordered
migrations have been applied to an explicitly approved disposable project.

### Migration ordering and SQL Editor fallback

The current migration filenames sort chronologically in this order; execute
each complete file separately and in order:

1. `20261114120000_ai_usage_rate_limit.sql`
2. `20261126003000_ai_guest_rate_limit.sql`
3. `20261127090000_core_domain_schema.sql`
4. `20261127130000_postgis_spatial_columns.sql`
5. `20261127130100_postgis_lookup_functions.sql`
6. `20261127131000_protected_profile_roles.sql`
7. `20261127132000_domain_rls_policies.sql`
8. `20261127133000_report_media_storage.sql`
9. `20261127134000_synthetic_road_reference_seed.sql`
10. `20261127135000_domain_audit_triggers.sql`
11. `20261127140000_hazard_report_state_validation.sql`
12. `20261127141000_segment_aggregation_helpers.sql`
13. `20261127142000_official_update_lifecycle_validation.sql`
14. `20261127143000_report_submission_throttle.sql`
15. `20261127144000_rate_limit_state_maintenance.sql`

The CLI migration workflow is preferred because it maintains the migration
ledger. The SQL Editor fallback is for a fresh, disposable database and an
operator authorized to change it: review each file, apply one file per query
so enum additions commit before later files use them, then run the checks
below. SQL Editor execution does not register versions in the CLI migration
ledger. Do not subsequently run `supabase migration up` or `db push` against
that database until its migration history has been reconciled. Never run
`supabase db reset` against shared environments.

For catalog and data smoke checks, run the following read-only query batch as
a database administrator after setting the empty search path. All relations
are schema-qualified:

```sql
set search_path = '';

select namespace.nspname, relation.relname, relation.relrowsecurity
from pg_catalog.pg_class as relation
join pg_catalog.pg_namespace as namespace
  on namespace.oid = relation.relnamespace
where namespace.nspname = 'public'
  and relation.relname in (
    'profiles', 'road_corridors', 'road_segments', 'hazard_reports',
    'report_attachments', 'hazard_clusters', 'segment_advisories',
    'official_updates', 'moderation_actions', 'audit_events',
    'jurisdiction_boundaries', 'ai_usage', 'ai_guest_usage',
    'report_submission_usage'
  )
order by relation.relname;

select routine.oid::pg_catalog.regprocedure as unsafe_definer
from pg_catalog.pg_proc as routine
join pg_catalog.pg_namespace as namespace
  on namespace.oid = routine.pronamespace
where namespace.nspname = 'public'
  and routine.prosecdef
  and not coalesce(
    routine.proconfig @> array['search_path=""'],
    false
  );

select
  (select pg_catalog.count(*) from public.road_corridors where is_synthetic) as synthetic_corridors,
  (select pg_catalog.count(*) from public.road_segments where is_synthetic is true) as synthetic_segments,
  (select pg_catalog.count(*) from public.road_segments where is_synthetic is true and centerline is not null) as synthetic_segments_with_centerlines;

select pg_catalog.format_type(attribute.atttypid, attribute.atttypmod) as geometry_type
from pg_catalog.pg_attribute as attribute
where (attribute.attrelid, attribute.attname) in (
  ('public.road_segments'::pg_catalog.regclass, 'centerline'),
  ('public.hazard_reports'::pg_catalog.regclass, 'location'),
  ('public.jurisdiction_boundaries'::pg_catalog.regclass, 'boundary')
)
  and attribute.attnum > 0
  and not attribute.attisdropped
order by attribute.attrelid, attribute.attname;

select audit.entity_type, audit.event_type, pg_catalog.count(*) as event_count
from public.audit_events as audit
group by audit.entity_type, audit.event_type
order by audit.entity_type, audit.event_type;
```

Expected seed results are 14 synthetic corridors, 36 synthetic segments, and
zero synthetic segments with centerlines. The geometry types should report
`LineString,4326`, `Point,4326`, and `MultiPolygon,4326`. The unsafe-definer
query should return no rows. Audit output is aggregate counts only; do not
export snapshots or personal/report details for a smoke check. Review the
`road_reference_seed.test.sql` conflict behavior before applying the seed:
existing segment rows are not overwritten, and approximate fixture paths are
never promoted to surveyed geometry.

Do not invoke `public.prune_expired_rate_limit_state()` as a read-only smoke
check: it deletes quota rows older than one day. It is an optional,
service-role-only maintenance action; review its returned deletion counts and
retention assumptions before scheduling it.

### Phase 2 handoff (BE2-01)

Phase 1 provides database contracts, not a production persistence/API
integration. The BE2-01 handoff is to connect the report outbox to a
server-side, validated submission endpoint using the existing ownership,
idempotency, and ten-minute throttle rules; map the controlled
`report_submission_rate_limited` database error to HTTP 429 with
`Retry-After`; and use a trusted signed-upload endpoint for private report
media. Keep Community Auth/PKCE intact, derive reporter identity and staff
roles server-side, and never expose the service-role key to the browser.
Validate this proposed scope against the BE2 backlog before implementation.
Live routing, authoritative road centerlines/boundaries, and external official
data feeds remain separate integrations; synthetic fixture references are
not production data.

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
