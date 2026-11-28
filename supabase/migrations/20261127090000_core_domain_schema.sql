-- Core RaahPrahari domain tables (BE1-05).
-- Spatial columns and PostGIS indexes are intentionally deferred to BE1-06.

do $$
begin
  create type public.profile_role as enum (
    'traveller', 'volunteer', 'reviewer', 'official', 'admin'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.uttarakhand_district as enum (
    'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun',
    'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh',
    'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.hazard_kind as enum ('hazard', 'clear');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.hazard_type as enum (
    'landslide', 'rockfall', 'flooding', 'road_block', 'fallen_tree',
    'damaged_bridge', 'road_damage', 'snow_ice', 'poor_visibility',
    'accident', 'other'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.hazard_severity as enum ('low', 'moderate', 'high');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.hazard_report_status as enum (
    'under_review', 'verified', 'needs_info', 'duplicate', 'rejected',
    'conflicting'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.report_source as enum ('traveller', 'volunteer');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.location_confidence as enum ('high', 'medium', 'low');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.official_restriction_type as enum (
    'road_closed', 'partially_restricted', 'vehicle_restricted', 'time_bound'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.official_update_status as enum ('active', 'lifted');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.clearance_status as enum (
    'not_requested', 'pending', 'verified'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.advisory_level as enum (
    'clear', 'caution', 'avoid', 'do_not_travel', 'unknown'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.advisory_basis as enum (
    'official', 'corroborated', 'single_report', 'conflicting',
    'community_clear', 'stale_only', 'no_evidence'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.hazard_cluster_status as enum ('open', 'closed');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.moderation_action_type as enum (
    'confirm', 'reject', 'merge', 'escalate', 'correction'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or length(display_name) <= 120),
  role public.profile_role not null default 'traveller',
  jurisdiction public.uttarakhand_district,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create table if not exists public.road_segments (
  id text primary key,
  corridor_id text not null,
  code text not null unique,
  from_place_id text not null,
  to_place_id text not null,
  km_start numeric(9, 3) not null default 0,
  km_end numeric(9, 3) not null,
  distance_km numeric(9, 3) not null,
  typical_minutes integer not null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint road_segments_distinct_places check (from_place_id <> to_place_id),
  constraint road_segments_valid_chainage check (km_start >= 0 and km_end > km_start),
  constraint road_segments_positive_distance check (distance_km > 0),
  constraint road_segments_positive_duration check (typical_minutes > 0)
);

create table if not exists public.hazard_reports (
  reference text primary key,
  segment_id text not null references public.road_segments (id) on delete restrict,
  reporter_id uuid references public.profiles (id) on delete set null,
  kind public.hazard_kind not null default 'hazard',
  hazard_type public.hazard_type not null,
  severity public.hazard_severity not null,
  description text not null check (length(description) <= 500),
  landmark text not null check (length(landmark) <= 240),
  observed_at timestamptz not null,
  received_at timestamptz not null default pg_catalog.now(),
  status public.hazard_report_status not null default 'under_review',
  source public.report_source not null default 'traveller',
  location_confidence public.location_confidence not null default 'high',
  duplicate_of text references public.hazard_reports (reference) on delete set null,
  conflicts_with text references public.hazard_reports (reference) on delete set null,
  independent boolean,
  independence_rationale text,
  latitude double precision,
  longitude double precision,
  location_accuracy_m double precision,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint hazard_reports_not_self_duplicate check (
    duplicate_of is null or duplicate_of <> reference
  ),
  constraint hazard_reports_not_self_conflict check (
    conflicts_with is null or conflicts_with <> reference
  ),
  constraint hazard_reports_coordinate_pair check (
    (latitude is null and longitude is null)
    or (
      latitude is not null
      and longitude is not null
      and latitude between -90 and 90
      and longitude between -180 and 180
    )
  ),
  constraint hazard_reports_nonnegative_accuracy check (
    location_accuracy_m is null or location_accuracy_m >= 0
  ),
  constraint hazard_reports_independence_rationale check (
    independent is not true or nullif(pg_catalog.btrim(independence_rationale), '') is not null
  )
);

create table if not exists public.report_attachments (
  id uuid primary key default gen_random_uuid(),
  report_reference text not null
    references public.hazard_reports (reference) on delete cascade,
  storage_path text unique,
  file_name text not null check (length(file_name) <= 255),
  media_type text not null check (media_type in ('image/jpeg', 'image/png')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  uploaded_at timestamptz,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create table if not exists public.hazard_clusters (
  id uuid primary key default gen_random_uuid(),
  segment_id text not null references public.road_segments (id) on delete restrict,
  hazard_type public.hazard_type not null,
  severity public.hazard_severity not null,
  status public.hazard_cluster_status not null default 'open',
  first_seen_at timestamptz not null,
  latest_seen_at timestamptz not null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint hazard_clusters_valid_time_range check (latest_seen_at >= first_seen_at)
);

create table if not exists public.segment_advisories (
  segment_id text primary key
    references public.road_segments (id) on delete cascade,
  level public.advisory_level not null default 'unknown',
  basis public.advisory_basis not null default 'no_evidence',
  latest_observation_at timestamptz,
  reviewed_count integer not null default 0 check (reviewed_count >= 0),
  restriction_past_review boolean not null default false,
  awaiting_clearance boolean not null default false,
  stale boolean not null default false,
  rule_version text not null,
  computed_at timestamptz not null default pg_catalog.now(),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create table if not exists public.official_updates (
  id uuid primary key default gen_random_uuid(),
  segment_id text not null references public.road_segments (id) on delete restrict,
  restriction_type public.official_restriction_type not null,
  title text not null check (length(title) between 1 and 240),
  issuing_authority text not null check (length(issuing_authority) between 1 and 160),
  jurisdiction public.uttarakhand_district not null,
  supporting_reference text not null check (length(supporting_reference) between 1 and 500),
  published_at timestamptz not null default pg_catalog.now(),
  effective_from timestamptz not null,
  effective_until timestamptz,
  review_by timestamptz not null,
  status public.official_update_status not null default 'active',
  clearance public.clearance_status not null default 'not_requested',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint official_updates_valid_effective_window check (
    effective_until is null or effective_until > effective_from
  ),
  constraint official_updates_valid_review_time check (review_by >= effective_from)
);

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  report_reference text not null
    references public.hazard_reports (reference) on delete restrict,
  actor_id uuid references public.profiles (id) on delete set null,
  action public.moderation_action_type not null,
  rationale text not null check (length(rationale) between 1 and 2000),
  target_reference text
    references public.hazard_reports (reference) on delete restrict,
  created_at timestamptz not null default pg_catalog.now(),
  constraint moderation_actions_valid_target check (
    (action = 'merge' and target_reference is not null and target_reference <> report_reference)
    or (action <> 'merge' and target_reference is null)
  )
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  entity_type text not null check (
    entity_type in (
      'profiles', 'road_segments', 'hazard_reports', 'report_attachments',
      'hazard_clusters', 'segment_advisories', 'official_updates',
      'moderation_actions'
    )
  ),
  entity_id text not null,
  event_type text not null check (length(event_type) between 1 and 120),
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default pg_catalog.now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'road_segments',
    'hazard_reports',
    'report_attachments',
    'hazard_clusters',
    'segment_advisories',
    'official_updates'
  ]
  loop
    execute pg_catalog.format(
      'drop trigger if exists set_updated_at on public.%I',
      table_name
    );
    execute pg_catalog.format(
      'create trigger set_updated_at before update on public.%I '
      'for each row execute function public.set_updated_at()',
      table_name
    );
  end loop;
end
$$;

alter table public.profiles enable row level security;
alter table public.road_segments enable row level security;
alter table public.hazard_reports enable row level security;
alter table public.report_attachments enable row level security;
alter table public.hazard_clusters enable row level security;
alter table public.segment_advisories enable row level security;
alter table public.official_updates enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.audit_events enable row level security;

revoke all on table
  public.profiles,
  public.road_segments,
  public.hazard_reports,
  public.report_attachments,
  public.hazard_clusters,
  public.segment_advisories,
  public.official_updates,
  public.moderation_actions,
  public.audit_events
from public, anon, authenticated;

grant select, insert, update, delete on table
  public.profiles,
  public.road_segments,
  public.hazard_reports,
  public.report_attachments,
  public.hazard_clusters,
  public.segment_advisories,
  public.official_updates,
  public.moderation_actions
to service_role;

revoke all on table public.audit_events from service_role;
grant select, insert on table public.audit_events to service_role;

comment on table public.road_segments is
  'Canonical route segments. Spatial geometry and spatial indexes are deferred to BE1-06.';
comment on table public.segment_advisories is
  'Cached segment-level advisory state; rules and public access are defined separately.';
comment on table public.audit_events is
  'Append-only audit records; writes are intended for trusted server-side code.';
