-- Least-privilege client access for RaahPrahari domain tables (BE1-09).

create or replace function public.has_profile_role(
  p_roles public.profile_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    where profile.id = auth.uid()
      and profile.role = any(p_roles)
  )
$$;

revoke all on function public.has_profile_role(public.profile_role[])
  from public, anon, authenticated;
grant execute on function public.has_profile_role(public.profile_role[])
  to authenticated;

create or replace function public.list_official_updates_for_staff()
returns table (
  id uuid,
  segment_id text,
  restriction_type public.official_restriction_type,
  title text,
  issuing_authority text,
  supporting_reference text,
  jurisdiction public.uttarakhand_district,
  published_at timestamptz,
  effective_from timestamptz,
  effective_until timestamptz,
  review_by timestamptz,
  status public.official_update_status,
  clearance public.clearance_status,
  created_by uuid
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    update_row.id,
    update_row.segment_id,
    update_row.restriction_type,
    update_row.title,
    update_row.issuing_authority,
    update_row.supporting_reference,
    update_row.jurisdiction,
    update_row.published_at,
    update_row.effective_from,
    update_row.effective_until,
    update_row.review_by,
    update_row.status,
    update_row.clearance,
    update_row.created_by
  from public.official_updates as update_row
  where public.has_profile_role(
    array['official', 'admin']::public.profile_role[]
  )
  order by update_row.published_at desc, update_row.id
$$;

revoke all on function public.list_official_updates_for_staff()
  from public, anon, authenticated;
grant execute on function public.list_official_updates_for_staff()
  to authenticated;

do $$
declare
  relation_name text;
  relation_oid oid;
  column_name text;
begin
  foreach relation_name in array array[
    'road_segments',
    'hazard_reports',
    'report_attachments',
    'hazard_clusters',
    'segment_advisories',
    'official_updates',
    'moderation_actions',
    'audit_events',
    'jurisdiction_boundaries'
  ]
  loop
    relation_oid := pg_catalog.to_regclass(
      pg_catalog.format('public.%I', relation_name)
    );
    execute pg_catalog.format(
      'revoke all on table public.%I from public, anon, authenticated',
      relation_name
    );

    for column_name in
      select attribute.attname
      from pg_catalog.pg_attribute as attribute
      where attribute.attrelid = relation_oid
        and attribute.attnum > 0
        and not attribute.attisdropped
    loop
      execute pg_catalog.format(
        'revoke all privileges (%I) on table public.%I from public, anon, authenticated',
        column_name,
        relation_name
      );
    end loop;
  end loop;
end
$$;

alter table public.road_segments enable row level security;
alter table public.hazard_reports enable row level security;
alter table public.report_attachments enable row level security;
alter table public.hazard_clusters enable row level security;
alter table public.segment_advisories enable row level security;
alter table public.official_updates enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.audit_events enable row level security;
alter table public.jurisdiction_boundaries enable row level security;

drop policy if exists road_segments_public_read on public.road_segments;
create policy road_segments_public_read
  on public.road_segments
  for select
  to anon, authenticated
  using (true);

drop policy if exists segment_advisories_public_read on public.segment_advisories;
create policy segment_advisories_public_read
  on public.segment_advisories
  for select
  to anon, authenticated
  using (true);

drop policy if exists hazard_clusters_public_read on public.hazard_clusters;
create policy hazard_clusters_public_read
  on public.hazard_clusters
  for select
  to anon, authenticated
  using (status = 'open');

drop policy if exists official_updates_public_read on public.official_updates;
create policy official_updates_public_read
  on public.official_updates
  for select
  to anon, authenticated
  using (status = 'active');

drop policy if exists hazard_reports_owner_or_moderator_read on public.hazard_reports;
create policy hazard_reports_owner_or_moderator_read
  on public.hazard_reports
  for select
  to authenticated
  using (
    reporter_id = (select auth.uid())
    or public.has_profile_role(
      array['reviewer', 'moderator', 'admin']::public.profile_role[]
    )
  );

drop policy if exists hazard_reports_owner_create on public.hazard_reports;
create policy hazard_reports_owner_create
  on public.hazard_reports
  for insert
  to authenticated
  with check (
    reporter_id = (select auth.uid())
    and status = 'under_review'
    and source = 'traveller'
  );

drop policy if exists report_attachments_owner_or_moderator_read
  on public.report_attachments;
create policy report_attachments_owner_or_moderator_read
  on public.report_attachments
  for select
  to authenticated
  using (
    public.has_profile_role(
      array['reviewer', 'moderator', 'admin']::public.profile_role[]
    )
    or exists (
      select 1
      from public.hazard_reports as report
      where report.reference = report_attachments.report_reference
        and report.reporter_id = (select auth.uid())
    )
  );

drop policy if exists report_attachments_owner_create
  on public.report_attachments;
create policy report_attachments_owner_create
  on public.report_attachments
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.hazard_reports as report
      where report.reference = report_attachments.report_reference
        and report.reporter_id = (select auth.uid())
        and report.status in ('under_review', 'needs_info')
    )
  );

drop policy if exists moderation_actions_staff_read
  on public.moderation_actions;
create policy moderation_actions_staff_read
  on public.moderation_actions
  for select
  to authenticated
  using (
    public.has_profile_role(
      array['reviewer', 'moderator', 'admin']::public.profile_role[]
    )
  );

drop policy if exists moderation_actions_staff_create
  on public.moderation_actions;
create policy moderation_actions_staff_create
  on public.moderation_actions
  for insert
  to authenticated
  with check (
    actor_id = (select auth.uid())
    and public.has_profile_role(
      array['reviewer', 'moderator', 'admin']::public.profile_role[]
    )
  );

drop policy if exists official_updates_staff_read on public.official_updates;
create policy official_updates_staff_read
  on public.official_updates
  for select
  to authenticated
  using (
    public.has_profile_role(
      array['official', 'admin']::public.profile_role[]
    )
  );

drop policy if exists official_updates_staff_create on public.official_updates;
create policy official_updates_staff_create
  on public.official_updates
  for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and status = 'active'
    and clearance = 'not_requested'
    and public.has_profile_role(
      array['official', 'admin']::public.profile_role[]
    )
  );

drop policy if exists official_updates_staff_update on public.official_updates;
create policy official_updates_staff_update
  on public.official_updates
  for update
  to authenticated
  using (
    public.has_profile_role(
      array['official', 'admin']::public.profile_role[]
    )
  )
  with check (
    public.has_profile_role(
      array['official', 'admin']::public.profile_role[]
    )
  );

grant select (
  id, corridor_id, code, from_place_id, to_place_id,
  km_start, km_end, distance_km, typical_minutes
) on public.road_segments to anon, authenticated;
grant select (
  segment_id, level, basis, latest_observation_at, computed_at
) on public.segment_advisories to anon, authenticated;
grant select (
  segment_id, hazard_type, severity, status, first_seen_at, latest_seen_at
) on public.hazard_clusters to anon, authenticated;
grant select (
  id, segment_id, restriction_type, title, issuing_authority, jurisdiction,
  published_at, effective_from, effective_until, status
) on public.official_updates to anon, authenticated;

grant select (
  reference, segment_id, reporter_id, kind, hazard_type, severity, description,
  landmark, observed_at, received_at, status, source, location_confidence,
  duplicate_of, conflicts_with, independent, independence_rationale, latitude,
  longitude, location_accuracy_m, created_at, updated_at
) on public.hazard_reports to authenticated;
grant insert (
  reference, segment_id, reporter_id, kind, hazard_type, severity,
  description, landmark, observed_at, latitude, longitude, location_accuracy_m
) on public.hazard_reports to authenticated;

grant select on public.report_attachments to authenticated;
grant insert (
  report_reference, storage_path, file_name, media_type, size_bytes
) on public.report_attachments to authenticated;

grant select, insert on public.moderation_actions to authenticated;

grant insert (
  segment_id, restriction_type, title, issuing_authority, supporting_reference,
  jurisdiction, effective_from, effective_until, review_by, created_by
) on public.official_updates to authenticated;
grant update (status, effective_until, review_by, clearance)
  on public.official_updates to authenticated;

grant usage on type
  public.hazard_type,
  public.hazard_severity,
  public.hazard_cluster_status,
  public.advisory_level,
  public.advisory_basis,
  public.official_restriction_type,
  public.uttarakhand_district,
  public.official_update_status
to anon, authenticated;
grant usage on type
  public.hazard_kind,
  public.hazard_report_status,
  public.report_source,
  public.location_confidence,
  public.moderation_action_type,
  public.clearance_status
to authenticated;

comment on function public.has_profile_role(public.profile_role[]) is
  'Checks only the current authenticated user role from public.profiles.';
comment on function public.list_official_updates_for_staff() is
  'Returns full restriction details only to authenticated officials and admins.';
