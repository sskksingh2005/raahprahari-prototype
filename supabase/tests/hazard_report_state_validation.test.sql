begin;

select plan(13);

select ok(
  (
    select not routine.prosecdef
      and routine.proconfig @> array['search_path=""']
    from pg_catalog.pg_proc as routine
    where routine.oid = 'public.validate_hazard_report_state()'::regprocedure
  ),
  'report validation uses an empty search path without definer privileges'
);
select ok(
  not pg_catalog.has_function_privilege(
    'anon',
    'public.validate_hazard_report_state()',
    'EXECUTE'
  )
    and not pg_catalog.has_function_privilege(
      'authenticated',
      'public.validate_hazard_report_state()',
      'EXECUTE'
    ),
  'client roles cannot call the validation trigger function directly'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'public.hazard_reports'::regclass
      and tgname = 'hazard_reports_validate_state'
      and not tgisinternal
      and (tgtype::integer & 23) = 23
  ),
  'report inserts and updates run lifecycle validation before mutation'
);

select lives_ok(
  $$insert into public.hazard_reports (
      reference, segment_id, hazard_type, severity, description, landmark, observed_at
    )
    select 'BE1-13-report', segment.id, 'landslide', 'low',
      'Validation test report', 'Test location', pg_catalog.now()
    from public.road_segments as segment
    order by segment.id
    limit 1$$,
  'new reports can start under_review'
);
select throws_ok(
  $$insert into public.hazard_reports (
      reference, segment_id, hazard_type, severity, description, landmark,
      observed_at, status
    )
    select 'BE1-13-invalid-initial', segment.id, 'landslide', 'low',
      'Validation test report', 'Test location', pg_catalog.now(), 'verified'
    from public.road_segments as segment
    order by segment.id
    limit 1$$,
  '23514',
  'reports cannot be inserted in a settled state'
);
select lives_ok(
  $$update public.hazard_reports
    set status = 'needs_info'
    where reference = 'BE1-13-report'$$,
  'under_review reports can request more information'
);
select lives_ok(
  $$update public.hazard_reports
    set status = 'conflicting'
    where reference = 'BE1-13-report'$$,
  'pending reports can move to conflicting'
);
select lives_ok(
  $$update public.hazard_reports
    set status = 'verified'
    where reference = 'BE1-13-report'$$,
  'pending reports can be settled as verified'
);
select throws_ok(
  $$update public.hazard_reports
    set status = 'under_review'
    where reference = 'BE1-13-report'$$,
  '23514',
  'settled reports cannot be reopened by changing status'
);
select throws_ok(
  $$update public.hazard_reports
    set duplicate_of = reference
    where reference = 'BE1-13-report'$$,
  '23514',
  'reports cannot reference themselves as duplicates'
);
select throws_ok(
  $$update public.hazard_reports
    set conflicts_with = reference
    where reference = 'BE1-13-report'$$,
  '23514',
  'reports cannot reference themselves as conflicts'
);
select lives_ok(
  $$insert into public.hazard_reports (
      reference, segment_id, hazard_type, severity, description, landmark, observed_at
    )
    select 'BE1-13-target', segment.id, 'landslide', 'low',
      'Validation target report', 'Test location', pg_catalog.now()
    from public.road_segments as segment
    order by segment.id
    limit 1$$,
  'a distinct report can be used as a relation target'
);
select throws_ok(
  $$insert into public.hazard_reports (
      reference, segment_id, hazard_type, severity, description, landmark,
      observed_at, duplicate_of, conflicts_with
    )
    select 'BE1-13-contradictory-links', segment.id, 'landslide', 'low',
      'Validation test report', 'Test location', pg_catalog.now(),
      'BE1-13-target', 'BE1-13-target'
    from public.road_segments as segment
    order by segment.id
    limit 1$$,
  '23514',
  'a report cannot be linked as both duplicate and conflict'
);

select * from finish();
rollback;
