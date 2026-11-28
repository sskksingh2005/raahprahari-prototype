-- Validate official restriction windows and lifecycle changes (BE1-15).

create or replace function public.validate_official_update_lifecycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.effective_until is not null
    and new.effective_until <= new.effective_from
  then
    raise exception using
      errcode = '23514',
      constraint = 'official_updates_valid_effective_window',
      message = 'effective_until must be later than effective_from';
  end if;

  if new.review_by < new.effective_from then
    raise exception using
      errcode = '23514',
      constraint = 'official_updates_valid_review_time',
      message = 'review_by cannot precede effective_from';
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'active' then
      raise exception using
        errcode = '23514',
        constraint = 'official_updates_initial_status',
        message = 'new official restrictions must start active';
    end if;

    if new.clearance <> 'not_requested' then
      raise exception using
        errcode = '23514',
        constraint = 'official_updates_initial_clearance',
        message = 'new official restrictions must start with clearance not_requested';
    end if;
  else
    if old.status = 'lifted' and new.status <> 'lifted' then
      raise exception using
        errcode = '23514',
        constraint = 'official_updates_status_transition',
        message = 'a lifted official restriction cannot be reactivated';
    end if;

    if old.clearance = 'verified' and new.clearance <> 'verified' then
      raise exception using
        errcode = '23514',
        constraint = 'official_updates_clearance_transition',
        message = 'verified clearance cannot be downgraded';
    end if;

    if old.status = 'lifted' and new.clearance is distinct from old.clearance then
      raise exception using
        errcode = '23514',
        constraint = 'official_updates_clearance_after_lift',
        message = 'clearance cannot change after a restriction is lifted';
    end if;

    if new.status = 'lifted' and new.clearance = 'pending' then
      raise exception using
        errcode = '23514',
        constraint = 'official_updates_lift_requires_resolved_clearance',
        message = 'a restriction cannot be lifted while clearance is pending';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.validate_official_update_lifecycle()
  from public, anon, authenticated;

drop trigger if exists official_updates_validate_lifecycle
  on public.official_updates;
create trigger official_updates_validate_lifecycle
  before insert or update on public.official_updates
  for each row execute function public.validate_official_update_lifecycle();

comment on function public.validate_official_update_lifecycle() is
  'Validates official restriction windows, active-to-lifted lifecycle, and monotonic clearance verification; role authorization remains in RLS.';
