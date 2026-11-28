begin;

select plan(11);

select ok(
  (
    select pg_catalog.format_type(attribute.atttypid, attribute.atttypmod)
      like '%LineString,4326%'
    from pg_catalog.pg_attribute as attribute
    where attribute.attrelid = 'public.road_segments'::pg_catalog.regclass
      and attribute.attname = 'centerline'
      and attribute.attnum > 0
      and not attribute.attisdropped
  )
    and (
      select pg_catalog.format_type(attribute.atttypid, attribute.atttypmod)
        like '%Point,4326%'
      from pg_catalog.pg_attribute as attribute
      where attribute.attrelid = 'public.hazard_reports'::pg_catalog.regclass
        and attribute.attname = 'location'
        and attribute.attnum > 0
        and not attribute.attisdropped
    )
    and (
      select pg_catalog.format_type(attribute.atttypid, attribute.atttypmod)
        like '%MultiPolygon,4326%'
      from pg_catalog.pg_attribute as attribute
      where attribute.attrelid = 'public.jurisdiction_boundaries'::pg_catalog.regclass
        and attribute.attname = 'boundary'
        and attribute.attnum > 0
        and not attribute.attisdropped
    ),
  'road, report, and jurisdiction geometry columns enforce SRID 4326'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_indexes
    where schemaname = 'public'
      and indexname = 'road_segments_centerline_gist_idx'
      and indexdef ilike '%using gist%'
  )
    and exists (
      select 1 from pg_catalog.pg_indexes
      where schemaname = 'public'
        and indexname = 'hazard_reports_location_gist_idx'
        and indexdef ilike '%using gist%'
    )
    and exists (
      select 1 from pg_catalog.pg_indexes
      where schemaname = 'public'
        and indexname = 'jurisdiction_boundaries_boundary_gist_idx'
        and indexdef ilike '%using gist%'
    ),
  'spatial columns have their expected GiST indexes'
);
select ok(
  (
    select not routine.prosecdef
      and routine.proconfig @> array['search_path=""']
    from pg_catalog.pg_proc as routine
    where routine.oid =
      'public.find_nearby_road_segments(double precision,double precision,double precision,integer)'::pg_catalog.regprocedure
  )
    and (
      select not routine.prosecdef
        and routine.proconfig @> array['search_path=""']
      from pg_catalog.pg_proc as routine
      where routine.oid =
        'public.find_nearest_road_segment(double precision,double precision,double precision)'::pg_catalog.regprocedure
    ),
  'spatial lookups are invoker functions with an empty search_path'
);
select ok(
  pg_catalog.has_function_privilege(
    'service_role',
    'public.find_nearby_road_segments(double precision,double precision,double precision,integer)',
    'EXECUTE'
  )
    and pg_catalog.has_function_privilege(
      'service_role',
      'public.find_nearest_road_segment(double precision,double precision,double precision)',
      'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'anon',
      'public.find_nearby_road_segments(double precision,double precision,double precision,integer)',
      'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'authenticated',
      'public.find_nearest_road_segment(double precision,double precision,double precision)',
      'EXECUTE'
    ),
  'only service_role can execute spatial lookups'
);
select is(
  (
    select pg_catalog.count(*)::integer
    from public.road_corridors
    where is_synthetic
  ),
  14,
  'all fixture corridors are present and synthetic'
);
select is(
  (
    select pg_catalog.count(*)::integer
    from public.road_segments
    where is_synthetic is true
  ),
  36,
  'all fixture road segments are marked synthetic'
);
select ok(
  not exists (
    select 1
    from public.road_segments
    where is_synthetic is true
      and centerline is not null
  ),
  'synthetic fixture segments do not receive surveyed centerlines'
);
select lives_ok(
  $$insert into public.road_segments (
      id, corridor_id, code, from_place_id, to_place_id,
      km_end, distance_km, typical_minutes
    )
    values (
      'be1-22-spatial-test', 'be1-22-test', 'BE1-22-TEST',
      'be1-22-from', 'be1-22-to', 1, 1, 1
    )$$,
  'a transactional test segment can be added'
);
select lives_ok(
  $sql$do $body$
    declare
      v_postgis_schema name;
    begin
      select namespace.nspname
        into v_postgis_schema
      from pg_catalog.pg_extension as extension
      join pg_catalog.pg_namespace as namespace
        on namespace.oid = extension.extnamespace
      where extension.extname = 'postgis';

      if v_postgis_schema is null then
        raise exception 'PostGIS extension is not installed';
      end if;

      execute pg_catalog.format(
        'update public.road_segments
         set centerline = %1$I.st_geomfromtext($1, 4326)
         where id = $2',
        v_postgis_schema
      )
      using 'LINESTRING(0 0, 0.1 0)', 'be1-22-spatial-test';
    end
  $body$;$sql$,
  'a temporary SRID 4326 line can be indexed for lookup verification'
);

set local role service_role;
select is(
  (
    select segment_id
    from public.find_nearby_road_segments(0.05, 0.001, 500, 10)
    limit 1
  ),
  'be1-22-spatial-test',
  'nearby lookups return the segment closest to the supplied point'
);
select ok(
  (
    select distance_m between 100 and 120
    from public.find_nearest_road_segment(0.05, 0.001, 500)
  ),
  'lookup distance is measured in meters'
);
reset role;

select * from finish();
rollback;
