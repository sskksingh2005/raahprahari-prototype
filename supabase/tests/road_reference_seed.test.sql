begin;

select plan(6);

select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.road_corridors'::regclass),
  'road corridor reference rows have row-level security enabled'
);
select ok(
  not pg_catalog.has_table_privilege('authenticated', 'public.road_corridors', 'SELECT')
    and pg_catalog.has_table_privilege('service_role', 'public.road_corridors', 'SELECT'),
  'corridor reference rows remain service-role-only'
);
select is(
  (select count(*)::integer from public.road_corridors where is_synthetic),
  14,
  'all 14 fixture corridors are present and marked synthetic'
);
select is(
  (select count(*)::integer from public.road_segments where is_synthetic is true),
  36,
  'all 36 fixture segments are present and marked synthetic'
);
select ok(
  pg_catalog.has_column_privilege('anon', 'public.road_segments', 'is_synthetic', 'SELECT'),
  'public route readers can distinguish explicitly synthetic segments'
);
select ok(
  not exists (
    select 1
    from public.road_segments as segment
    left join public.road_corridors as corridor
      on corridor.id = segment.corridor_id
    where segment.is_synthetic is true
      and (
        corridor.id is null
        or segment.centerline is not null
        or segment.distance_km <> segment.km_end - segment.km_start
      )
  ),
  'seeded segments reference a corridor, match chainage distance, and have no surveyed geometry'
);

select * from finish();
rollback;
