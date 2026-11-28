-- Prune expired rate-limit counters without retaining request history (BE1-17).

create or replace function public.prune_expired_rate_limit_state()
returns table (
  ai_user_rows_deleted bigint,
  ai_guest_rows_deleted bigint,
  report_submission_rows_deleted bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cutoff timestamptz := pg_catalog.now() - interval '1 day';
  v_ai_user_rows_deleted bigint;
  v_ai_guest_rows_deleted bigint;
  v_report_submission_rows_deleted bigint;
begin
  delete from public.ai_usage
  where window_start < v_cutoff;
  get diagnostics v_ai_user_rows_deleted = row_count;

  delete from public.ai_guest_usage
  where window_start < v_cutoff;
  get diagnostics v_ai_guest_rows_deleted = row_count;

  delete from public.report_submission_usage
  where window_start < v_cutoff;
  get diagnostics v_report_submission_rows_deleted = row_count;

  ai_user_rows_deleted := v_ai_user_rows_deleted;
  ai_guest_rows_deleted := v_ai_guest_rows_deleted;
  report_submission_rows_deleted := v_report_submission_rows_deleted;
  return next;
end;
$$;

revoke all on function public.prune_expired_rate_limit_state()
  from public, anon, authenticated, service_role;
grant execute on function public.prune_expired_rate_limit_state()
  to service_role;

comment on function public.prune_expired_rate_limit_state() is
  'Deletes only rate-limit counter rows whose windows started more than one day ago; returns per-table deletion counts. service_role only.';
