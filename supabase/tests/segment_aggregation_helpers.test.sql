begin;

select plan(27);

select ok(
  (
    select not cluster_function.prosecdef
      and cluster_function.proconfig @> array['search_path=""']
      and not advisory_function.prosecdef
      and advisory_function.proconfig @> array['search_path=""']
    from pg_catalog.pg_proc as cluster_function
    join pg_catalog.pg_proc as advisory_function
      on advisory_function.oid =
        'public.refresh_segment_advisory(text,timestamptz,text)'::regprocedure
    where cluster_function.oid =
      'public.refresh_hazard_clusters(text,timestamptz)'::regprocedure
  ),
  'refresh functions are invoker-only and use an empty search path'
);
select ok(
  pg_catalog.has_function_privilege(
    'service_role',
    'public.refresh_hazard_clusters(text,timestamptz)',
    'EXECUTE'
  )
    and pg_catalog.has_function_privilege(
      'service_role',
      'public.refresh_segment_advisory(text,timestamptz,text)',
      'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'anon',
      'public.refresh_hazard_clusters(text,timestamptz)',
      'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'authenticated',
      'public.refresh_segment_advisory(text,timestamptz,text)',
      'EXECUTE'
    ),
  'only service_role can execute the refresh functions'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.hazard_clusters'::regclass)
    and (select relrowsecurity from pg_catalog.pg_class where oid = 'public.segment_advisories'::regclass)
    and not pg_catalog.has_table_privilege('anon', 'public.hazard_clusters', 'INSERT')
    and not pg_catalog.has_table_privilege('authenticated', 'public.hazard_clusters', 'UPDATE')
    and not pg_catalog.has_table_privilege('authenticated', 'public.segment_advisories', 'INSERT')
    and not pg_catalog.has_table_privilege('anon', 'public.segment_advisories', 'UPDATE'),
  'cluster and advisory tables remain RLS-protected and client read-only'
);

insert into public.road_segments (
  id, corridor_id, code, from_place_id, to_place_id,
  km_end, distance_km, typical_minutes, is_synthetic
)
values
  (
    'be1-14-test-segment', 'be1-14-test', 'BE1-14-TEST',
    'be1-14-from', 'be1-14-to', 1, 1, 1, true
  ),
  (
    'be1-14-empty-segment', 'be1-14-test', 'BE1-14-EMPTY',
    'be1-14-empty-from', 'be1-14-empty-to', 1, 1, 1, true
  );

select lives_ok(
  $$insert into public.hazard_reports (
      reference, segment_id, kind, hazard_type, severity, description,
      landmark, observed_at
    )
    values (
      'BE1-14-report-one', 'be1-14-test-segment', 'hazard', 'rockfall', 'high',
      'Aggregation test report', 'Test location', pg_catalog.now() - interval '2 hours'
    )$$,
  'test report can be inserted for aggregation'
);

set local role service_role;

select is(
  public.refresh_hazard_clusters('be1-14-test-segment'),
  1,
  'one active hazard group creates one open cluster'
);
select ok(
  (
    select count(*) = 1
      and pg_catalog.min(first_seen_at) <= pg_catalog.max(latest_seen_at)
    from public.hazard_clusters
    where segment_id = 'be1-14-test-segment'
      and status = 'open'
  ),
  'open clusters have an aggregated, valid observation range'
);
select is(
  public.refresh_hazard_clusters('be1-14-test-segment'),
  1,
  'repeated cluster refreshes remain idempotent'
);
select is(
  (
    select count(*)
    from public.hazard_clusters
    where segment_id = 'be1-14-test-segment'
      and status = 'open'
  ),
  1::bigint,
  'repeated refresh does not create duplicate open clusters'
);
select lives_ok(
  $$select public.refresh_segment_advisory(
      'be1-14-test-segment', pg_catalog.now(), 'test-v1'
    )$$,
  'segment advisory refresh succeeds with evidence'
);
select ok(
  (
    select level = 'caution'
      and basis = 'single_report'
      and reviewed_count = 0
      and not stale
    from public.segment_advisories
    where segment_id = 'be1-14-test-segment'
  ),
  'one fresh high report produces caution, not a green advisory'
);
select lives_ok(
  $$insert into public.hazard_reports (
      reference, segment_id, kind, hazard_type, severity, description,
      landmark, observed_at
    )
    values (
      'BE1-14-report-two', 'be1-14-test-segment', 'hazard', 'rockfall', 'high',
      'Second aggregation test report', 'Test location', pg_catalog.now() - interval '1 hour'
    )$$,
  'second report can be added'
);
select lives_ok(
  $$update public.hazard_reports
    set status = 'verified'
    where reference = 'BE1-14-report-two'$$,
  'second report can be verified by trusted server access'
);
select lives_ok(
  $$select public.refresh_segment_advisory(
      'be1-14-test-segment', pg_catalog.now(), 'test-v1'
    )$$,
  'advisory refresh succeeds with corroborating evidence'
);
select ok(
  (
    select level = 'avoid'
      and basis = 'corroborated'
      and reviewed_count = 1
    from public.segment_advisories
    where segment_id = 'be1-14-test-segment'
  ),
  'two fresh high reports with one verified produce corroborated avoid'
);
select lives_ok(
  $$insert into public.hazard_reports (
      reference, segment_id, kind, hazard_type, severity, description,
      landmark, observed_at
    )
    values (
      'BE1-14-clear-report', 'be1-14-test-segment', 'clear', 'other', 'low',
      'Conflicting clear report', 'Test location', pg_catalog.now() - interval '30 minutes'
    )$$,
  'fresh community-clear report can be added'
);
select lives_ok(
  $$select public.refresh_segment_advisory(
      'be1-14-test-segment', pg_catalog.now(), 'test-v1'
    )$$,
  'advisory refresh succeeds with conflicting evidence'
);
select ok(
  (
    select level = 'caution' and basis = 'conflicting'
    from public.segment_advisories
    where segment_id = 'be1-14-test-segment'
  ),
  'fresh clear reports take precedence over corroborated hazards'
);
select lives_ok(
  $$update public.hazard_reports
    set observed_at = pg_catalog.now() - interval '2 days'
    where segment_id = 'be1-14-test-segment'$$,
  'test reports can be aged beyond the freshness window'
);
select is(
  public.refresh_hazard_clusters('be1-14-test-segment'),
  0,
  'stale hazards no longer count as open cluster groups'
);
select ok(
  (
    select count(*) filter (where status = 'open') = 0
      and count(*) filter (where status = 'closed') = 1
    from public.hazard_clusters
    where segment_id = 'be1-14-test-segment'
  ),
  'expired open clusters are closed without deleting their history'
);
select lives_ok(
  $$select public.refresh_segment_advisory(
      'be1-14-test-segment', pg_catalog.now(), 'test-v1'
    )$$,
  'advisory refresh succeeds when all reports are stale'
);
select ok(
  (
    select level = 'unknown'
      and basis = 'stale_only'
      and stale
    from public.segment_advisories
    where segment_id = 'be1-14-test-segment'
  ),
  'stale reports never produce a positive advisory'
);
select is(
  public.refresh_hazard_clusters('be1-14-empty-segment'),
  0,
  'empty hazard evidence creates no clusters'
);
select lives_ok(
  $$select public.refresh_segment_advisory(
      'be1-14-empty-segment', pg_catalog.now(), 'test-v1'
    )$$,
  'empty report evidence refreshes successfully'
);
select ok(
  (
    select level = 'unknown'
      and basis = 'no_evidence'
      and reviewed_count = 0
      and not stale
      and latest_observation_at is null
    from public.segment_advisories
    where segment_id = 'be1-14-empty-segment'
  ),
  'empty report evidence remains unknown with null-safe aggregates'
);
select throws_ok(
  $$select public.refresh_hazard_clusters(' ')$$,
  '22023',
  'empty segment identifiers are rejected'
);
select throws_ok(
  $$select public.refresh_segment_advisory(
      'be1-14-test-segment', null, '  '
    )$$,
  '22023',
  'empty rule versions are rejected'
);

reset role;
select * from finish();
rollback;
