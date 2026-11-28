-- Validate report lifecycle transitions and linked-report references (BE1-13).

create or replace function public.validate_hazard_report_state()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.duplicate_of is not null and new.duplicate_of = new.reference then
    raise exception using
      errcode = '23514',
      constraint = 'hazard_reports_not_self_duplicate',
      message = 'duplicate_of must reference a different report';
  end if;

  if new.conflicts_with is not null and new.conflicts_with = new.reference then
    raise exception using
      errcode = '23514',
      constraint = 'hazard_reports_not_self_conflict',
      message = 'conflicts_with must reference a different report';
  end if;

  if new.duplicate_of is not null and new.conflicts_with is not null then
    raise exception using
      errcode = '23514',
      constraint = 'hazard_reports_single_report_relation',
      message = 'a report cannot be both a duplicate and a conflict';
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'under_review' then
      raise exception using
        errcode = '23514',
        constraint = 'hazard_reports_initial_status',
        message = 'new reports must start under_review';
    end if;
  elsif new.status is distinct from old.status
    and not (
      old.status in ('under_review', 'needs_info', 'conflicting')
      and new.status in (
        'under_review', 'needs_info', 'conflicting',
        'verified', 'duplicate', 'rejected'
      )
    )
  then
    raise exception using
      errcode = '23514',
      constraint = 'hazard_reports_valid_status_transition',
      message = 'report status cannot transition from a settled state';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_hazard_report_state()
  from public, anon, authenticated;

drop trigger if exists hazard_reports_validate_state on public.hazard_reports;
create trigger hazard_reports_validate_state
  before insert or update on public.hazard_reports
  for each row execute function public.validate_hazard_report_state();

comment on function public.validate_hazard_report_state() is
  'Requires new reports to start under_review, guards pending-to-settled status transitions, and rejects self or contradictory report links.';
