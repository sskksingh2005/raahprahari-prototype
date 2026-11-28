begin;

select plan(11);

select ok(
  (
    select routine.prosecdef
      and routine.proconfig @> array['search_path=""']
    from pg_catalog.pg_proc as routine
    where routine.oid = 'public.audit_domain_change()'::regprocedure
  ),
  'audit trigger function is security-definer with an empty search path'
);
select ok(
  (
    select routine.provolatile = 'i'
      and routine.proconfig @> array['search_path=""']
    from pg_catalog.pg_proc as routine
    where routine.oid = 'public.audit_domain_snapshot(text,jsonb)'::regprocedure
  ),
  'snapshot helper is immutable and uses an empty search path'
);
select ok(
  not pg_catalog.has_function_privilege(
    'anon',
    'public.audit_domain_change()',
    'EXECUTE'
  )
    and not pg_catalog.has_function_privilege(
      'authenticated',
      'public.audit_domain_change()',
      'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'authenticated',
      'public.audit_domain_snapshot(text,jsonb)',
      'EXECUTE'
    ),
  'audit helpers are not callable by client roles'
);
select ok(
  not pg_catalog.has_table_privilege('anon', 'public.audit_events', 'SELECT')
    and not pg_catalog.has_table_privilege('authenticated', 'public.audit_events', 'SELECT')
    and not pg_catalog.has_table_privilege('authenticated', 'public.audit_events', 'INSERT')
    and pg_catalog.has_table_privilege('service_role', 'public.audit_events', 'INSERT'),
  'audit events remain private and writable only through trusted server access'
);
select ok(
  pg_catalog.pg_get_functiondef(
    'public.audit_domain_snapshot(text,jsonb)'::regprocedure
  ) not like '%description%'
    and pg_catalog.pg_get_functiondef(
      'public.audit_domain_snapshot(text,jsonb)'::regprocedure
    ) not like '%storage_path%'
    and pg_catalog.pg_get_functiondef(
      'public.audit_domain_snapshot(text,jsonb)'::regprocedure
    ) not like '%rationale%',
  'audit snapshots exclude report prose, storage paths, and moderation rationale'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'public.hazard_reports'::regclass
      and tgname = 'audit_domain_hazard_reports'
      and not tgisinternal
      and (tgtype::integer & 28) = 28
  ),
  'report insert, update, and delete mutations are audited'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'public.report_attachments'::regclass
      and tgname = 'audit_domain_report_attachments'
      and not tgisinternal
      and (tgtype::integer & 28) = 28
  ),
  'attachment insert, update, and delete mutations are audited'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'public.moderation_actions'::regclass
      and tgname = 'audit_domain_moderation_actions'
      and not tgisinternal
      and (tgtype::integer & 28) = 28
  ),
  'moderation decision mutations are audited'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'public.official_updates'::regclass
      and tgname = 'audit_domain_official_updates'
      and not tgisinternal
      and (tgtype::integer & 28) = 28
  ),
  'official restriction and clearance mutations are audited'
);
select ok(
  pg_catalog.has_function_privilege(
    'authenticated',
    'public.assign_profile_role(uuid,public.profile_role,public.uttarakhand_district)',
    'EXECUTE'
  )
    and pg_catalog.pg_get_functiondef(
      'public.assign_profile_role(uuid,public.profile_role,public.uttarakhand_district)'::regprocedure
    ) like '%profile_role_assigned%',
  'existing audited profile-role assignment remains in place'
);
select ok(
  not exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'public.profiles'::regclass
      and tgname like 'audit_domain_%'
      and not tgisinternal
  ),
  'profile role assignments are not duplicated by a row audit trigger'
);

select * from finish();
rollback;
