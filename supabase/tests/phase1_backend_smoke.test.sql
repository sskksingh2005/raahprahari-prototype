begin;

select plan(4);

select ok(
  not exists (
    select 1
    from pg_catalog.unnest(array[
      'public.profiles',
      'public.road_corridors',
      'public.road_segments',
      'public.hazard_reports',
      'public.report_attachments',
      'public.hazard_clusters',
      'public.segment_advisories',
      'public.official_updates',
      'public.moderation_actions',
      'public.audit_events',
      'public.jurisdiction_boundaries',
      'public.ai_usage',
      'public.ai_guest_usage',
      'public.report_submission_usage',
      'storage.objects'
    ]) as expected(relation_name)
    where pg_catalog.to_regclass(expected.relation_name) is null
  ),
  'Phase 1 domain, quota, and media relations are present'
);
select ok(
  not exists (
    select 1
    from pg_catalog.unnest(array[
      'public.profiles',
      'public.road_corridors',
      'public.road_segments',
      'public.hazard_reports',
      'public.report_attachments',
      'public.hazard_clusters',
      'public.segment_advisories',
      'public.official_updates',
      'public.moderation_actions',
      'public.audit_events',
      'public.jurisdiction_boundaries',
      'public.ai_usage',
      'public.ai_guest_usage',
      'public.report_submission_usage',
      'storage.objects'
    ]) as expected(relation_name)
    left join pg_catalog.pg_class as relation
      on relation.oid = pg_catalog.to_regclass(expected.relation_name)
    where relation.oid is null
      or not relation.relrowsecurity
  ),
  'Phase 1 domain, quota, and media relations retain RLS'
);
select ok(
  not exists (
    select 1
    from (
      values
        ('public.create_traveller_profile()'),
        ('public.assign_profile_role(uuid,public.profile_role,public.uttarakhand_district)'),
        ('public.has_profile_role(public.profile_role[])'),
        ('public.list_official_updates_for_staff()'),
        ('public.audit_domain_change()'),
        ('public.enforce_report_submission_rate_limit()'),
        ('public.prune_expired_rate_limit_state()')
    ) as expected(signature)
    left join pg_catalog.pg_proc as routine
      on routine.oid = pg_catalog.to_regprocedure(expected.signature)
    where routine.oid is null
      or not routine.prosecdef
      or not coalesce(
        routine.proconfig @> array['search_path=""'],
        false
      )
  ),
  'all Phase 1 SECURITY DEFINER helpers pin an empty search_path'
);
select ok(
  not pg_catalog.has_table_privilege('anon', 'public.audit_events', 'SELECT')
    and not pg_catalog.has_table_privilege('authenticated', 'public.audit_events', 'SELECT')
    and not pg_catalog.has_table_privilege('anon', 'public.audit_events', 'INSERT')
    and not pg_catalog.has_table_privilege('authenticated', 'public.audit_events', 'INSERT')
    and not pg_catalog.has_table_privilege('service_role', 'public.report_submission_usage', 'SELECT')
    and not pg_catalog.has_table_privilege('authenticated', 'public.report_submission_usage', 'SELECT')
    and not pg_catalog.has_table_privilege('authenticated', 'public.hazard_clusters', 'UPDATE')
    and not pg_catalog.has_table_privilege('authenticated', 'public.segment_advisories', 'INSERT'),
  'audit, submission counters, clusters, and advisories remain server-controlled'
);

select * from finish();
rollback;
