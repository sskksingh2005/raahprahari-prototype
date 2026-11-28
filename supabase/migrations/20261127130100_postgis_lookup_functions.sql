-- Server-only spatial lookup helpers for road segments (BE1-07).
-- Queries use surveyed centerlines and return only segment identifiers,
-- public route labels, and distance; they never read report evidence.

do $$
declare
  postgis_schema name;
begin
  select n.nspname
  into postgis_schema
  from pg_catalog.pg_extension as e
  join pg_catalog.pg_namespace as n
    on n.oid = e.extnamespace
  where e.extname = 'postgis';

  if postgis_schema is null then
    raise exception 'PostGIS must be installed before creating spatial lookups';
  end if;

  execute pg_catalog.format(
    'create index if not exists road_segments_centerline_geography_gist_idx
     on public.road_segments using gist ((centerline::%I.geography))',
    postgis_schema
  );
end
$$;

create or replace function public.find_nearby_road_segments(
  p_longitude double precision,
  p_latitude double precision,
  p_radius_m double precision default 12000,
  p_limit integer default 10
)
returns table (
  segment_id text,
  code text,
  from_place_id text,
  to_place_id text,
  distance_m double precision
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  postgis_schema name;
begin
  if p_longitude is null
    or p_latitude is null
    or p_longitude < -180 or p_longitude > 180
    or p_latitude < -90 or p_latitude > 90
    or p_radius_m is null or p_radius_m < 0 or p_radius_m > 50000
    or p_limit is null or p_limit < 1
  then
    return;
  end if;

  select n.nspname
  into postgis_schema
  from pg_catalog.pg_extension as e
  join pg_catalog.pg_namespace as n
    on n.oid = e.extnamespace
  where e.extname = 'postgis';

  if postgis_schema is null then
    raise exception 'PostGIS extension is not installed';
  end if;

  return query execute pg_catalog.format(
    'select
       s.id,
       s.code,
       s.from_place_id,
       s.to_place_id,
       %1$I.st_distance(
         s.centerline::%1$I.geography,
         %1$I.st_setsrid(%1$I.st_makepoint($1, $2), 4326)::%1$I.geography
       ) as distance_m
     from public.road_segments as s
     where s.centerline is not null
       and %1$I.st_dwithin(
         s.centerline::%1$I.geography,
         %1$I.st_setsrid(%1$I.st_makepoint($1, $2), 4326)::%1$I.geography,
         $3
       )
     order by distance_m, s.id
     limit $4',
    postgis_schema
  )
  using p_longitude, p_latitude, p_radius_m, pg_catalog.least(p_limit, 100);
end
$$;

create or replace function public.find_nearest_road_segment(
  p_longitude double precision,
  p_latitude double precision,
  p_max_distance_m double precision default 15000
)
returns table (
  segment_id text,
  code text,
  from_place_id text,
  to_place_id text,
  distance_m double precision
)
language sql
stable
security invoker
set search_path = ''
as $$
  select *
  from public.find_nearby_road_segments(
    p_longitude,
    p_latitude,
    p_max_distance_m,
    1
  )
$$;

revoke all on function public.find_nearby_road_segments(
  double precision, double precision, double precision, integer
) from public, anon, authenticated;
revoke all on function public.find_nearest_road_segment(
  double precision, double precision, double precision
) from public, anon, authenticated;
grant execute on function public.find_nearby_road_segments(
  double precision, double precision, double precision, integer
) to service_role;
grant execute on function public.find_nearest_road_segment(
  double precision, double precision, double precision
) to service_role;

comment on function public.find_nearby_road_segments(
  double precision, double precision, double precision, integer
) is
  'Returns nearby surveyed road segments ordered by geography distance in meters; service_role only.';
comment on function public.find_nearest_road_segment(
  double precision, double precision, double precision
) is
  'Returns the nearest surveyed road segment within the supplied meter radius; service_role only.';
