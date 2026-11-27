-- PostGIS spatial columns and indexes (BE1-06).
-- Existing synthetic segment paths are not surveyed road geometry and are
-- intentionally not copied into the canonical centerline column.

create schema if not exists extensions;
create extension if not exists postgis with schema extensions;

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
    raise exception 'PostGIS extension is not available after installation';
  end if;

  execute pg_catalog.format(
    'grant usage on schema %I to service_role',
    postgis_schema
  );

  execute pg_catalog.format(
    'alter table public.road_segments add column if not exists centerline %I.geometry(LineString, 4326)',
    postgis_schema
  );
  execute pg_catalog.format(
    'alter table public.hazard_reports add column if not exists location %I.geometry(Point, 4326)',
    postgis_schema
  );
  execute pg_catalog.format(
    'create table if not exists public.jurisdiction_boundaries (
      district public.uttarakhand_district primary key,
      boundary %I.geometry(MultiPolygon, 4326) not null,
      created_at timestamptz not null default pg_catalog.now(),
      updated_at timestamptz not null default pg_catalog.now()
    )',
    postgis_schema
  );

  execute pg_catalog.format(
    'update public.hazard_reports
     set location = %1$I.st_setsrid(%1$I.st_makepoint(longitude, latitude), 4326)
     where location is null and latitude is not null and longitude is not null',
    postgis_schema
  );
end
$$;

create index if not exists road_segments_centerline_gist_idx
  on public.road_segments using gist (centerline);
create index if not exists hazard_reports_location_gist_idx
  on public.hazard_reports using gist (location);
create index if not exists jurisdiction_boundaries_boundary_gist_idx
  on public.jurisdiction_boundaries using gist (boundary);

drop trigger if exists set_updated_at on public.jurisdiction_boundaries;
create trigger set_updated_at
  before update on public.jurisdiction_boundaries
  for each row execute function public.set_updated_at();

alter table public.jurisdiction_boundaries enable row level security;
revoke all on table public.jurisdiction_boundaries from public, anon, authenticated;
grant select, insert, update, delete on table public.jurisdiction_boundaries to service_role;

comment on table public.jurisdiction_boundaries is
  'SRID 4326 district boundaries; populate only from authoritative boundary data.';
comment on column public.road_segments.centerline is
  'SRID 4326 surveyed road alignment; synthetic prototype paths are not copied here.';
comment on column public.hazard_reports.location is
  'SRID 4326 report point; existing latitude/longitude values are retained and backfilled here.';
