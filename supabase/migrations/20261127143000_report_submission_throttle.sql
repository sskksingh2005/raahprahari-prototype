-- Limit successful new report submissions per authenticated account (BE1-16).

create table if not exists public.report_submission_usage (
  user_id uuid primary key references auth.users (id) on delete cascade,
  window_start timestamptz not null,
  request_count integer not null check (request_count >= 0)
);

comment on table public.report_submission_usage is
  'Current report-submission throttle window per authenticated user. Server trigger only; no client or service-role table access.';

alter table public.report_submission_usage enable row level security;
revoke all on table public.report_submission_usage
  from public, anon, authenticated, service_role;

create or replace function public.enforce_report_submission_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auth_user_id uuid := auth.uid();
  v_user_id uuid;
  v_now timestamptz := pg_catalog.now();
  v_limit integer := 5;
  v_window interval := pg_catalog.make_interval(secs => 600);
  v_usage public.report_submission_usage%rowtype;
  v_retry_after_seconds integer;
begin
  if auth.role() = 'service_role' then
    if new.reporter_id is null then
      raise exception using
        errcode = '42501',
        message = 'service-role report submissions require a reporter_id';
    end if;
    v_user_id := new.reporter_id;
  elsif v_auth_user_id is not null then
    if new.reporter_id is distinct from v_auth_user_id then
      raise exception using
        errcode = '42501',
        message = 'reporter_id must match the authenticated user';
    end if;
    v_user_id := v_auth_user_id;
  elsif session_user in ('postgres', 'supabase_admin') then
    return null;
  else
    raise exception using
      errcode = '42501',
      message = 'an authenticated report owner is required';
  end if;

  insert into public.report_submission_usage as usage (
    user_id,
    window_start,
    request_count
  )
  values (v_user_id, v_now, 1)
  on conflict (user_id) do update
  set
    window_start = case
      when usage.window_start + v_window <= v_now then v_now
      else usage.window_start
    end,
    request_count = case
      when usage.window_start + v_window <= v_now then 1
      else pg_catalog.least(usage.request_count + 1, v_limit + 1)
    end
  returning usage.* into v_usage;

  if v_usage.request_count > v_limit then
    v_retry_after_seconds := pg_catalog.greatest(
      1,
      pg_catalog.ceil(
        extract(epoch from (v_usage.window_start + v_window - v_now))
      )::integer
    );
    raise exception using
      errcode = 'P0001',
      message = 'report_submission_rate_limited',
      detail = pg_catalog.format(
        'retry_after_seconds=%s',
        v_retry_after_seconds
      );
  end if;

  return null;
end;
$$;

revoke all on function public.enforce_report_submission_rate_limit()
  from public, anon, authenticated, service_role;

drop trigger if exists hazard_reports_submission_rate_limit
  on public.hazard_reports;
create trigger hazard_reports_submission_rate_limit
  after insert on public.hazard_reports
  for each row execute function public.enforce_report_submission_rate_limit();

comment on function public.enforce_report_submission_rate_limit() is
  'Enforces five new reports per authenticated account per ten-minute window; idempotent updates do not consume quota.';
