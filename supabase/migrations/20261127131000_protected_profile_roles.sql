-- Authenticated profile provisioning and protected role assignment (BE1-08).
-- User metadata is intentionally not copied into profiles or used for roles.

alter type public.profile_role add value if not exists 'moderator';

alter table public.profiles
  alter column role set default 'traveller'::public.profile_role;

insert into public.profiles (id)
select id
from auth.users
on conflict (id) do nothing;

create or replace function public.create_traveller_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'traveller')
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.create_traveller_profile()
  from public, anon, authenticated;

drop trigger if exists raahprahari_create_profile_after_signup on auth.users;
create trigger raahprahari_create_profile_after_signup
  after insert on auth.users
  for each row execute function public.create_traveller_profile();

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

drop policy if exists profiles_update_own_display_name on public.profiles;
create policy profiles_update_own_display_name
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke all on table public.profiles from public, anon, authenticated;
revoke update (id, role, jurisdiction, created_at, updated_at)
  on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (display_name) on table public.profiles to authenticated;
grant usage on type public.profile_role, public.uttarakhand_district
  to authenticated, service_role;

create or replace function public.assign_profile_role(
  p_user_id uuid,
  p_role public.profile_role,
  p_jurisdiction public.uttarakhand_district default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  previous_role public.profile_role;
  previous_jurisdiction public.uttarakhand_district;
  assigned_jurisdiction public.uttarakhand_district;
  assignment_source text;
begin
  if p_user_id is null or p_role is null then
    raise exception 'user id and role are required' using errcode = '22023';
  end if;

  if auth.role() is distinct from 'service_role'
    and session_user not in ('postgres', 'supabase_admin')
    and not exists (
      select 1
      from public.profiles as actor_profile
      where actor_profile.id = actor_id
        and actor_profile.role = 'admin'
    )
  then
    raise exception 'administrator role required' using errcode = '42501';
  end if;

  select profile.role, profile.jurisdiction
  into previous_role, previous_jurisdiction
  from public.profiles as profile
  where profile.id = p_user_id
  for update;

  if not found then
    raise exception 'target profile does not exist' using errcode = 'P0002';
  end if;

  assigned_jurisdiction := coalesce(p_jurisdiction, previous_jurisdiction);
  update public.profiles
  set role = p_role,
      jurisdiction = assigned_jurisdiction
  where id = p_user_id;

  assignment_source := case
    when auth.role() = 'service_role' then 'service_role'
    when session_user in ('postgres', 'supabase_admin') then 'database_admin'
    else 'admin_profile'
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
    'profiles',
    p_user_id::text,
    'profile_role_assigned',
    pg_catalog.jsonb_build_object(
      'role', previous_role,
      'jurisdiction', previous_jurisdiction
    ),
    pg_catalog.jsonb_build_object(
      'role', p_role,
      'jurisdiction', assigned_jurisdiction,
      'assignment_source', assignment_source
    )
  );
end;
$$;

revoke all on function public.assign_profile_role(
  uuid, public.profile_role, public.uttarakhand_district
) from public, anon, authenticated;
grant execute on function public.assign_profile_role(
  uuid, public.profile_role, public.uttarakhand_district
) to authenticated, service_role;

comment on function public.create_traveller_profile() is
  'Creates a traveller profile on auth.users insert; ignores all user metadata.';
comment on function public.assign_profile_role(
  uuid, public.profile_role, public.uttarakhand_district
) is
  'Assigns a profile role only for an admin profile, service_role, or database administrator; records an audit event.';
