-- Refresh server-owned hazard clusters and advisory rows (BE1-14).

create or replace function public.refresh_hazard_clusters(
  p_segment_id text,
  p_as_of timestamptz default null
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_as_of timestamptz := coalesce(p_as_of, pg_catalog.now());
  v_group record;
  v_cluster_id uuid;
  v_open_groups integer := 0;
begin
  if p_segment_id is null or pg_catalog.btrim(p_segment_id) = '' then
    raise exception using
      errcode = '22023',
      message = 'segment id must not be null or empty';
  end if;

  if not exists (
    select 1
    from public.road_segments as segment
    where segment.id = p_segment_id
  ) then
    raise exception using
      errcode = '22023',
      message = 'segment id does not identify a road segment';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_segment_id, 0)
  );

  for v_group in
    select
      report.hazard_type,
      report.severity,
      pg_catalog.min(report.observed_at) as first_seen_at,
      pg_catalog.max(report.observed_at) as latest_seen_at
    from public.hazard_reports as report
    where report.segment_id = p_segment_id
      and report.kind = 'hazard'
      and report.status not in ('rejected', 'duplicate')
      and report.observed_at >= v_as_of - interval '24 hours'
    group by report.hazard_type, report.severity
    order by report.hazard_type, report.severity
  loop
    v_cluster_id := null;

    select cluster.id
      into v_cluster_id
    from public.hazard_clusters as cluster
    where cluster.segment_id = p_segment_id
      and cluster.hazard_type = v_group.hazard_type
      and cluster.severity = v_group.severity
      and cluster.status = 'open'
    order by cluster.first_seen_at, cluster.id
    limit 1
    for update;

    if v_cluster_id is null then
      insert into public.hazard_clusters (
        segment_id,
        hazard_type,
        severity,
        status,
        first_seen_at,
        latest_seen_at
      )
      values (
        p_segment_id,
        v_group.hazard_type,
        v_group.severity,
        'open',
        v_group.first_seen_at,
        v_group.latest_seen_at
      )
      returning id into v_cluster_id;
    else
      update public.hazard_clusters as cluster
      set
        first_seen_at = least(cluster.first_seen_at, v_group.first_seen_at),
        latest_seen_at = greatest(cluster.latest_seen_at, v_group.latest_seen_at)
      where cluster.id = v_cluster_id;
    end if;

    update public.hazard_clusters as cluster
    set status = 'closed'
    where cluster.segment_id = p_segment_id
      and cluster.hazard_type = v_group.hazard_type
      and cluster.severity = v_group.severity
      and cluster.status = 'open'
      and cluster.id <> v_cluster_id;

    v_open_groups := v_open_groups + 1;
  end loop;

  update public.hazard_clusters as cluster
  set status = 'closed'
  where cluster.segment_id = p_segment_id
    and cluster.status = 'open'
    and not exists (
      select 1
      from public.hazard_reports as report
      where report.segment_id = p_segment_id
        and report.kind = 'hazard'
        and report.status not in ('rejected', 'duplicate')
        and report.hazard_type = cluster.hazard_type
        and report.severity = cluster.severity
        and report.observed_at >= v_as_of - interval '24 hours'
    );

  return v_open_groups;
end;
$$;

create or replace function public.refresh_segment_advisory(
  p_segment_id text,
  p_as_of timestamptz default null,
  p_rule_version text default 'be1-14-v1'
)
returns public.segment_advisories
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_as_of timestamptz := coalesce(p_as_of, pg_catalog.now());
  v_rule_version text := nullif(pg_catalog.btrim(p_rule_version), '');
  v_report_count bigint;
  v_latest_observation_at timestamptz;
  v_reviewed_count integer;
  v_fresh_hazard_count bigint;
  v_fresh_clear_count bigint;
  v_high_hazard_count bigint;
  v_high_verified_count bigint;
  v_conflicting_hazard boolean;
  v_restriction public.official_updates%rowtype;
  v_level public.advisory_level := 'unknown';
  v_basis public.advisory_basis := 'no_evidence';
  v_restriction_past_review boolean := false;
  v_awaiting_clearance boolean := false;
  v_stale boolean := false;
  v_result public.segment_advisories%rowtype;
begin
  if p_segment_id is null or pg_catalog.btrim(p_segment_id) = '' then
    raise exception using
      errcode = '22023',
      message = 'segment id must not be null or empty';
  end if;

  if v_rule_version is null then
    raise exception using
      errcode = '22023',
      message = 'rule version must not be null or empty';
  end if;

  if not exists (
    select 1
    from public.road_segments as segment
    where segment.id = p_segment_id
  ) then
    raise exception using
      errcode = '22023',
      message = 'segment id does not identify a road segment';
  end if;

  select
    pg_catalog.count(*),
    pg_catalog.max(report.observed_at),
    pg_catalog.count(*) filter (where report.status = 'verified')::integer,
    pg_catalog.count(*) filter (
      where report.kind = 'hazard'
        and report.observed_at >= v_as_of - interval '24 hours'
    ),
    pg_catalog.count(*) filter (
      where report.kind = 'clear'
        and report.observed_at >= v_as_of - interval '12 hours'
    ),
    pg_catalog.count(*) filter (
      where report.kind = 'hazard'
        and report.severity = 'high'
        and report.observed_at >= v_as_of - interval '24 hours'
    ),
    pg_catalog.count(*) filter (
      where report.kind = 'hazard'
        and report.severity = 'high'
        and report.status = 'verified'
        and report.observed_at >= v_as_of - interval '24 hours'
    ),
    coalesce(
      pg_catalog.bool_or(
        report.kind = 'hazard'
          and report.status = 'conflicting'
          and report.observed_at >= v_as_of - interval '24 hours'
      ),
      false
    )
    into
      v_report_count,
      v_latest_observation_at,
      v_reviewed_count,
      v_fresh_hazard_count,
      v_fresh_clear_count,
      v_high_hazard_count,
      v_high_verified_count,
      v_conflicting_hazard
  from public.hazard_reports as report
  where report.segment_id = p_segment_id
    and report.status not in ('rejected', 'duplicate');

  select restriction_row.*
    into v_restriction
  from public.official_updates as restriction_row
  where restriction_row.segment_id = p_segment_id
    and restriction_row.status = 'active'
  order by
    case restriction_row.restriction_type
      when 'road_closed' then 4
      when 'partially_restricted' then 3
      else 2
    end desc,
    restriction_row.published_at desc,
    restriction_row.id
  limit 1;

  if v_restriction.id is not null then
    v_level := case v_restriction.restriction_type
      when 'road_closed' then 'do_not_travel'::public.advisory_level
      when 'partially_restricted' then 'avoid'::public.advisory_level
      else 'caution'::public.advisory_level
    end;
    v_basis := 'official';
    v_restriction_past_review := v_as_of > v_restriction.review_by;
    v_awaiting_clearance := v_restriction.clearance = 'pending';
  elsif v_fresh_hazard_count > 0 then
    if v_fresh_clear_count > 0 or v_conflicting_hazard then
      v_level := 'caution';
      v_basis := 'conflicting';
    elsif v_high_hazard_count >= 2 and v_high_verified_count > 0 then
      v_level := 'avoid';
      v_basis := 'corroborated';
    else
      v_level := 'caution';
      v_basis := 'single_report';
    end if;
  elsif v_fresh_clear_count > 0 then
    v_level := 'unknown';
    v_basis := 'community_clear';
  elsif v_report_count > 0 then
    v_level := 'unknown';
    v_basis := 'stale_only';
    v_stale := true;
  end if;

  insert into public.segment_advisories (
    segment_id,
    level,
    basis,
    latest_observation_at,
    reviewed_count,
    restriction_past_review,
    awaiting_clearance,
    stale,
    rule_version,
    computed_at
  )
  values (
    p_segment_id,
    v_level,
    v_basis,
    v_latest_observation_at,
    v_reviewed_count,
    v_restriction_past_review,
    v_awaiting_clearance,
    v_stale,
    v_rule_version,
    v_as_of
  )
  on conflict (segment_id) do update
  set
    level = excluded.level,
    basis = excluded.basis,
    latest_observation_at = excluded.latest_observation_at,
    reviewed_count = excluded.reviewed_count,
    restriction_past_review = excluded.restriction_past_review,
    awaiting_clearance = excluded.awaiting_clearance,
    stale = excluded.stale,
    rule_version = excluded.rule_version,
    computed_at = excluded.computed_at
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on function public.refresh_hazard_clusters(text, timestamptz)
  from public, anon, authenticated;
revoke all on function public.refresh_segment_advisory(text, timestamptz, text)
  from public, anon, authenticated;
grant execute on function public.refresh_hazard_clusters(text, timestamptz)
  to service_role;
grant execute on function public.refresh_segment_advisory(text, timestamptz, text)
  to service_role;

comment on function public.refresh_hazard_clusters(text, timestamptz) is
  'Reconciles open hazard clusters for one segment from recent, non-rejected, non-duplicate hazard reports; service_role only.';
comment on function public.refresh_segment_advisory(text, timestamptz, text) is
  'Recomputes one segment advisory using the application rule precedence and freshness windows; empty evidence remains unknown; service_role only.';
