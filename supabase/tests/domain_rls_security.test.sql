begin;

select plan(27);

select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.road_segments'::regclass),
  'road segments has row-level security enabled'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.hazard_reports'::regclass),
  'hazard reports has row-level security enabled'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.report_attachments'::regclass),
  'report attachments has row-level security enabled'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.official_updates'::regclass),
  'official updates has row-level security enabled'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.audit_events'::regclass),
  'audit events has row-level security enabled'
);
select ok(
  pg_catalog.has_column_privilege('anon', 'public.road_segments', 'code', 'SELECT')
    and not pg_catalog.has_column_privilege('anon', 'public.road_segments', 'centerline', 'SELECT'),
  'anonymous readers can see route labels but not spatial geometry'
);
select ok(
  pg_catalog.has_column_privilege('anon', 'public.segment_advisories', 'level', 'SELECT')
    and not pg_catalog.has_column_privilege('anon', 'public.segment_advisories', 'rule_version', 'SELECT'),
  'anonymous readers see advisory output but not internal rule metadata'
);
select ok(
  pg_catalog.has_column_privilege('anon', 'public.official_updates', 'title', 'SELECT')
    and not pg_catalog.has_column_privilege('anon', 'public.official_updates', 'supporting_reference', 'SELECT')
    and not pg_catalog.has_column_privilege('anon', 'public.official_updates', 'clearance', 'SELECT'),
  'anonymous readers see published restriction details without private references or clearance'
);
select ok(
  not pg_catalog.has_table_privilege('anon', 'public.hazard_reports', 'SELECT')
    and not pg_catalog.has_table_privilege('authenticated', 'public.audit_events', 'SELECT'),
  'reports are not public and audit events are not client-readable'
);
select ok(
  pg_catalog.has_column_privilege('authenticated', 'public.hazard_reports', 'reporter_id', 'SELECT')
    and pg_catalog.has_column_privilege('authenticated', 'public.hazard_reports', 'reporter_id', 'INSERT')
    and not pg_catalog.has_column_privilege('authenticated', 'public.hazard_reports', 'status', 'INSERT')
    and not pg_catalog.has_column_privilege('authenticated', 'public.hazard_reports', 'location', 'SELECT')
    and not pg_catalog.has_table_privilege('authenticated', 'public.hazard_reports', 'UPDATE')
    and not pg_catalog.has_table_privilege('authenticated', 'public.hazard_reports', 'DELETE'),
  'authenticated report creation cannot set status or update/delete reports'
);
select ok(
  pg_catalog.has_table_privilege('authenticated', 'public.report_attachments', 'SELECT')
    and pg_catalog.has_column_privilege('authenticated', 'public.report_attachments', 'report_reference', 'INSERT')
    and not pg_catalog.has_table_privilege('authenticated', 'public.report_attachments', 'UPDATE')
    and not pg_catalog.has_table_privilege('authenticated', 'public.report_attachments', 'DELETE'),
  'authenticated attachment access is read/create only'
);
select ok(
  pg_catalog.has_table_privilege('authenticated', 'public.moderation_actions', 'INSERT')
    and not pg_catalog.has_table_privilege('authenticated', 'public.moderation_actions', 'UPDATE')
    and not pg_catalog.has_table_privilege('authenticated', 'public.moderation_actions', 'DELETE'),
  'moderation actions are append-only for clients'
);
select ok(
  pg_catalog.has_column_privilege('authenticated', 'public.official_updates', 'clearance', 'UPDATE')
    and pg_catalog.has_column_privilege('authenticated', 'public.official_updates', 'status', 'UPDATE')
    and not pg_catalog.has_table_privilege('authenticated', 'public.official_updates', 'DELETE'),
  'official updates expose only limited role-gated state changes'
);
select ok(
  pg_catalog.has_function_privilege(
    'authenticated',
    'public.has_profile_role(public.profile_role[])',
    'EXECUTE'
  )
    and not pg_catalog.has_function_privilege(
      'anon',
      'public.has_profile_role(public.profile_role[])',
      'EXECUTE'
    ),
  'profile role checks are available only to authenticated callers'
);
select ok(
  (
    select routine.prosecdef
      and routine.proconfig @> array['search_path=""']
    from pg_catalog.pg_proc as routine
    where routine.oid = 'public.has_profile_role(public.profile_role[])'::regprocedure
  ),
  'profile role checks use a definer function with an empty search path'
);
select ok(
  pg_catalog.has_function_privilege(
    'authenticated',
    'public.list_official_updates_for_staff()',
    'EXECUTE'
  )
    and not pg_catalog.has_function_privilege(
      'anon',
      'public.list_official_updates_for_staff()',
      'EXECUTE'
    ),
  'full restriction details are exposed only through the staff helper'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_policy
    where polrelid = 'public.hazard_reports'::regclass
      and polname = 'hazard_reports_owner_create'
      and pg_catalog.pg_get_expr(polwithcheck, polrelid) like '%under_review%'
  ),
  'new reports are constrained to the initial review state'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_policy
    where polrelid = 'public.report_attachments'::regclass
      and polname = 'report_attachments_owner_create'
      and pg_catalog.pg_get_expr(polwithcheck, polrelid) like '%needs_info%'
  ),
  'attachments are limited to owned reports awaiting review or more information'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_policy
    where polrelid = 'public.moderation_actions'::regclass
      and polname = 'moderation_actions_staff_create'
      and pg_catalog.pg_get_expr(polwithcheck, polrelid) like '%has_profile_role%'
  ),
  'moderation logging requires a verified staff role'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_policy
    where polrelid = 'public.official_updates'::regclass
      and polname = 'official_updates_staff_update'
      and pg_catalog.pg_get_expr(polqual, polrelid) like '%has_profile_role%'
  ),
  'restriction and clearance updates require a verified official role'
);
select ok(
  not pg_catalog.has_table_privilege('authenticated', 'public.audit_events', 'INSERT')
    and pg_catalog.has_table_privilege('service_role', 'public.audit_events', 'INSERT'),
  'audit writes are reserved for trusted server-side access'
);
select ok(
  pg_catalog.has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE')
    and not pg_catalog.has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE'),
  'BE1-08 profile self-service and role protection remain intact'
);
select ok(
  not pg_catalog.has_table_privilege('anon', 'public.jurisdiction_boundaries', 'SELECT')
    and pg_catalog.has_table_privilege('service_role', 'public.jurisdiction_boundaries', 'SELECT'),
  'district boundary lookup remains server-only'
);
select ok(
  pg_catalog.has_type_privilege('anon', 'public.advisory_level', 'USAGE')
    and pg_catalog.has_type_privilege('anon', 'public.official_restriction_type', 'USAGE'),
  'anonymous readers can use enum types exposed by public entities'
);
select ok(
  pg_catalog.has_type_privilege('authenticated', 'public.hazard_report_status', 'USAGE')
    and pg_catalog.has_type_privilege('authenticated', 'public.clearance_status', 'USAGE'),
  'authenticated report and staff helpers can use their exposed enum types'
);
select ok(
  not pg_catalog.has_table_privilege('authenticated', 'public.segment_advisories', 'INSERT')
    and not pg_catalog.has_table_privilege('authenticated', 'public.hazard_clusters', 'UPDATE'),
  'advisories and clusters remain server-controlled'
);
select ok(
  pg_catalog.has_table_privilege('service_role', 'public.hazard_reports', 'UPDATE')
    and pg_catalog.has_table_privilege('service_role', 'public.official_updates', 'DELETE'),
  'trusted server role retains domain workflow access'
);

select * from finish();
rollback;
