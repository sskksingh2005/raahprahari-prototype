begin;

select plan(20);

select ok(
  (
    select not routine.prosecdef
      and routine.proconfig @> array['search_path=""']
    from pg_catalog.pg_proc as routine
    where routine.oid =
      'public.validate_official_update_lifecycle()'::regprocedure
  ),
  'official-update validation is invoker-only and uses an empty search path'
);
select ok(
  not pg_catalog.has_function_privilege(
    'anon',
    'public.validate_official_update_lifecycle()',
    'EXECUTE'
  )
    and not pg_catalog.has_function_privilege(
      'authenticated',
      'public.validate_official_update_lifecycle()',
      'EXECUTE'
    )
    and pg_catalog.has_column_privilege(
      'authenticated',
      'public.official_updates',
      'status',
      'UPDATE'
    ),
  'clients cannot call the trigger directly and role-gated status updates remain available'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'public.official_updates'::regclass
      and tgname = 'official_updates_validate_lifecycle'
      and not tgisinternal
      and (tgtype::integer & 23) = 23
  )
    and exists (
      select 1 from pg_catalog.pg_trigger
      where tgrelid = 'public.official_updates'::regclass
        and tgname = 'audit_domain_official_updates'
        and not tgisinternal
        and (tgtype::integer & 28) = 28
    ),
  'lifecycle validation coexists with the existing audit trigger'
);

select lives_ok(
  $$insert into public.official_updates (
      segment_id, restriction_type, title, issuing_authority, jurisdiction,
      supporting_reference, effective_from, effective_until, review_by,
      clearance
    )
    values (
      'nh7-01', 'road_closed', 'Lifecycle test closure', 'Test authority',
      'Chamoli', 'BE1-15/test', pg_catalog.now() - interval '2 days',
      pg_catalog.now() - interval '1 hour',
      pg_catalog.now() - interval '30 minutes', 'not_requested'
    )$$,
  'active restriction can remain active after its effective window ends'
);
select throws_ok(
  $$insert into public.official_updates (
      segment_id, restriction_type, title, issuing_authority, jurisdiction,
      supporting_reference, effective_from, effective_until, review_by
    )
    values (
      'nh7-01', 'road_closed', 'Invalid window', 'Test authority',
      'Chamoli', 'BE1-15/invalid-window', pg_catalog.now(),
      pg_catalog.now() - interval '1 minute', pg_catalog.now()
    )$$,
  '23514',
  'effective_until cannot be at or before effective_from'
);
select throws_ok(
  $$insert into public.official_updates (
      segment_id, restriction_type, title, issuing_authority, jurisdiction,
      supporting_reference, effective_from, review_by
    )
    values (
      'nh7-01', 'road_closed', 'Invalid review time', 'Test authority',
      'Chamoli', 'BE1-15/invalid-review', pg_catalog.now(),
      pg_catalog.now() - interval '1 minute'
    )$$,
  '23514',
  'review_by cannot precede effective_from'
);
select throws_ok(
  $$insert into public.official_updates (
      segment_id, restriction_type, title, issuing_authority, jurisdiction,
      supporting_reference, effective_from, review_by, status
    )
    values (
      'nh7-01', 'road_closed', 'Invalid initial status', 'Test authority',
      'Chamoli', 'BE1-15/invalid-status', pg_catalog.now(),
      pg_catalog.now(), 'lifted'
    )$$,
  '23514',
  'new restrictions cannot be inserted as already lifted'
);
select throws_ok(
  $$insert into public.official_updates (
      segment_id, restriction_type, title, issuing_authority, jurisdiction,
      supporting_reference, effective_from, review_by, clearance
    )
    values (
      'nh7-01', 'road_closed', 'Invalid initial clearance', 'Test authority',
      'Chamoli', 'BE1-15/invalid-clearance', pg_catalog.now(),
      pg_catalog.now(), 'pending'
    )$$,
  '23514',
  'new restrictions begin without a clearance request'
);

select lives_ok(
  $$update public.official_updates
    set clearance = 'pending'
    where supporting_reference = 'BE1-15/test'$$,
  'active restrictions can enter pending clearance'
);

set local role service_role;

select lives_ok(
  $$select public.refresh_segment_advisory('nh7-01', pg_catalog.now(), 'test-v1')$$,
  'BE1-14 advisory refresh accepts validated active restrictions'
);
select ok(
  (
    select level = 'do_not_travel'
      and basis = 'official'
      and restriction_past_review
      and awaiting_clearance
    from public.segment_advisories
    where segment_id = 'nh7-01'
  ),
  'expired windows and pending clearance do not automatically lift an active closure'
);
select throws_ok(
  $$update public.official_updates
    set status = 'lifted'
    where supporting_reference = 'BE1-15/test'$$,
  '23514',
  'a restriction cannot be lifted while clearance remains pending'
);
select lives_ok(
  $$update public.official_updates
    set clearance = 'verified'
    where supporting_reference = 'BE1-15/test'$$,
  'pending clearance can be verified'
);
select lives_ok(
  $$update public.official_updates
    set status = 'lifted'
    where supporting_reference = 'BE1-15/test'$$,
  'an active restriction can be explicitly lifted after clearance is resolved'
);
select throws_ok(
  $$update public.official_updates
    set status = 'active'
    where supporting_reference = 'BE1-15/test'$$,
  '23514',
  'a lifted restriction cannot be reactivated'
);
select throws_ok(
  $$update public.official_updates
    set clearance = 'not_requested'
    where supporting_reference = 'BE1-15/test'$$,
  '23514',
  'verified clearance cannot be downgraded'
);
select throws_ok(
  $$update public.official_updates
    set clearance = 'pending'
    where supporting_reference = 'BE1-15/test'$$,
  '23514',
  'clearance cannot change after a restriction has been lifted'
);
select lives_ok(
  $$insert into public.official_updates (
      segment_id, restriction_type, title, issuing_authority, jurisdiction,
      supporting_reference, effective_from, review_by
    )
    values (
      'nh7-01', 'time_bound', 'Cancelled clearance', 'Test authority',
      'Chamoli', 'BE1-15/cancel', pg_catalog.now(), pg_catalog.now()
    )$$,
  'another active restriction can be created'
);
select lives_ok(
  $$update public.official_updates
    set clearance = 'pending'
    where supporting_reference = 'BE1-15/cancel'$$,
  'clearance can be requested for an active restriction'
);
select lives_ok(
  $$update public.official_updates
    set clearance = 'not_requested'
    where supporting_reference = 'BE1-15/cancel'$$,
  'a pending clearance request can be cancelled'
);

reset role;
select * from finish();
rollback;
