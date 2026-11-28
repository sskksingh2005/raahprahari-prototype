-- Append allowlisted audit snapshots for successful domain mutations (BE1-12).

create or replace function public.audit_domain_snapshot(
  p_entity_type text,
  p_row jsonb
)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case p_entity_type
    when 'hazard_reports' then (
      select coalesce(pg_catalog.jsonb_object_agg(field_name, p_row -> field_name), '{}'::jsonb)
      from pg_catalog.unnest(array[
        'reference', 'segment_id', 'kind', 'hazard_type', 'severity',
        'status', 'source', 'duplicate_of', 'conflicts_with', 'updated_at'
      ]) as field(field_name)
      where p_row ? field_name
    )
    when 'report_attachments' then (
      select coalesce(pg_catalog.jsonb_object_agg(field_name, p_row -> field_name), '{}'::jsonb)
      from pg_catalog.unnest(array[
        'id', 'report_reference', 'media_type', 'size_bytes', 'uploaded_at',
        'updated_at'
      ]) as field(field_name)
      where p_row ? field_name
    )
    when 'moderation_actions' then (
      select coalesce(pg_catalog.jsonb_object_agg(field_name, p_row -> field_name), '{}'::jsonb)
      from pg_catalog.unnest(array[
        'id', 'report_reference', 'actor_id', 'action', 'target_reference',
        'created_at'
      ]) as field(field_name)
      where p_row ? field_name
    )
    when 'official_updates' then (
      select coalesce(pg_catalog.jsonb_object_agg(field_name, p_row -> field_name), '{}'::jsonb)
      from pg_catalog.unnest(array[
        'id', 'segment_id', 'restriction_type', 'title', 'issuing_authority',
        'jurisdiction', 'effective_from', 'effective_until', 'review_by',
        'status', 'clearance', 'created_by', 'updated_at'
      ]) as field(field_name)
      where p_row ? field_name
    )
    else '{}'::jsonb
  end
$$;

revoke all on function public.audit_domain_snapshot(text, jsonb)
  from public, anon, authenticated;

create or replace function public.audit_domain_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  before_row jsonb;
  after_row jsonb;
  row_data jsonb;
  entity_type text;
  event_prefix text;
  event_type text;
  entity_id text;
  actor_id uuid := auth.uid();
begin
  if tg_op = 'DELETE' then
    before_row := pg_catalog.to_jsonb(old);
    row_data := before_row;
  else
    after_row := pg_catalog.to_jsonb(new);
    row_data := after_row;
    if tg_op = 'UPDATE' then
      before_row := pg_catalog.to_jsonb(old);
    end if;
  end if;

  case tg_table_name
    when 'hazard_reports' then
      entity_type := 'hazard_reports';
      event_prefix := 'hazard_report';
      entity_id := row_data ->> 'reference';
    when 'report_attachments' then
      entity_type := 'report_attachments';
      event_prefix := 'report_attachment';
      entity_id := row_data ->> 'id';
    when 'moderation_actions' then
      entity_type := 'moderation_actions';
      event_prefix := 'moderation_action';
      entity_id := row_data ->> 'id';
      if actor_id is null and tg_op = 'INSERT' then
        actor_id := nullif(row_data ->> 'actor_id', '')::uuid;
      end if;
    when 'official_updates' then
      entity_type := 'official_updates';
      event_prefix := 'official_update';
      entity_id := row_data ->> 'id';
      if actor_id is null and tg_op = 'INSERT' then
        actor_id := nullif(row_data ->> 'created_by', '')::uuid;
      end if;
    else
      raise exception 'unsupported audit trigger table: %', tg_table_name;
  end case;

  if entity_id is null or pg_catalog.btrim(entity_id) = '' then
    raise exception 'audited domain row has no entity identifier';
  end if;

  if actor_id is not null and not exists (
    select 1
    from public.profiles as profile
    where profile.id = actor_id
  ) then
    actor_id := null;
  end if;

  event_type := event_prefix || case tg_op
    when 'INSERT' then '_created'
    when 'UPDATE' then '_updated'
    when 'DELETE' then '_deleted'
  end;

  insert into public.audit_events (
    actor_id,
    entity_type,
    entity_id,
    event_type,
    before_state,
    after_state
  )
  values (
    actor_id,
    entity_type,
    entity_id,
    event_type,
    case
      when before_row is null then null
      else public.audit_domain_snapshot(entity_type, before_row)
    end,
    case
      when after_row is null then null
      else public.audit_domain_snapshot(entity_type, after_row)
    end
  );

  return null;
end;
$$;

revoke all on function public.audit_domain_change()
  from public, anon, authenticated;

drop trigger if exists audit_domain_hazard_reports on public.hazard_reports;
create trigger audit_domain_hazard_reports
  after insert or update or delete on public.hazard_reports
  for each row execute function public.audit_domain_change();

drop trigger if exists audit_domain_report_attachments
  on public.report_attachments;
create trigger audit_domain_report_attachments
  after insert or update or delete on public.report_attachments
  for each row execute function public.audit_domain_change();

drop trigger if exists audit_domain_moderation_actions
  on public.moderation_actions;
create trigger audit_domain_moderation_actions
  after insert or update or delete on public.moderation_actions
  for each row execute function public.audit_domain_change();

drop trigger if exists audit_domain_official_updates
  on public.official_updates;
create trigger audit_domain_official_updates
  after insert or update or delete on public.official_updates
  for each row execute function public.audit_domain_change();

comment on function public.audit_domain_change() is
  'Writes allowlisted snapshots for successful report, attachment, moderation, and official-update mutations; direct client execution is revoked.';
comment on function public.audit_domain_snapshot(text, jsonb) is
  'Builds allowlisted audit snapshots without report prose, coordinates, storage paths, or moderation rationale.';
