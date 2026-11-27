begin;

select plan(17);

select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.profiles'::regclass),
  'profiles has row-level security enabled'
);
select ok(
  pg_catalog.has_table_privilege('authenticated', 'public.profiles', 'SELECT'),
  'authenticated users can read their own profile through RLS'
);
select ok(
  not pg_catalog.has_table_privilege('authenticated', 'public.profiles', 'INSERT'),
  'authenticated users cannot insert profiles'
);
select ok(
  pg_catalog.has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE'),
  'authenticated users can update the allowed display name column'
);
select ok(
  not pg_catalog.has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE'),
  'authenticated users cannot update profile roles'
);
select ok(
  not pg_catalog.has_column_privilege('authenticated', 'public.profiles', 'jurisdiction', 'UPDATE'),
  'authenticated users cannot update protected jurisdiction values'
);
select ok(
  (
    select pg_catalog.pg_get_expr(default_value.adbin, default_value.adrelid)
      like '%traveller%'
    from pg_catalog.pg_attrdef as default_value
    join pg_catalog.pg_attribute as column_value
      on column_value.attrelid = default_value.adrelid
      and column_value.attnum = default_value.adnum
    where default_value.adrelid = 'public.profiles'::regclass
      and column_value.attname = 'role'
  ),
  'the profile role default is traveller'
);
select ok(
  exists (
    select 1
    from pg_catalog.pg_trigger
    where tgrelid = 'auth.users'::regclass
      and tgname = 'raahprahari_create_profile_after_signup'
      and not tgisinternal
  ),
  'new Auth users receive a profile from the signup trigger'
);
select ok(
  (
    select pg_catalog.pg_get_functiondef(
      'public.create_traveller_profile()'::regprocedure
    ) like '%traveller%'
      and pg_catalog.pg_get_functiondef(
        'public.create_traveller_profile()'::regprocedure
      ) not like '%raw_user_meta_data%'
  ),
  'signup provisioning assigns traveller and ignores user metadata'
);
select ok(
  (
    select prosecdef
    from pg_catalog.pg_proc
    where oid = 'public.assign_profile_role(uuid,public.profile_role,public.uttarakhand_district)'::regprocedure
  ),
  'role assignment uses a protected server-side function'
);
select ok(
  pg_catalog.has_function_privilege(
    'authenticated',
    'public.assign_profile_role(uuid,public.profile_role,public.uttarakhand_district)'::regprocedure,
    'EXECUTE'
  ),
  'authenticated callers reach the admin-checked role assignment path'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_policy
    where polrelid = 'public.profiles'::regclass
      and polname = 'profiles_select_own'
  ),
  'profile reads are scoped to the authenticated user'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_policy
    where polrelid = 'public.profiles'::regclass
      and polname = 'profiles_update_own_display_name'
  ),
  'profile updates are scoped to the authenticated user'
);

set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
set local request.jwt.claim.role = 'authenticated';
set local role authenticated;

select throws_ok(
  $$select public.assign_profile_role(
      '00000000-0000-4000-8000-000000000001',
      'official',
      null
    )$$,
  '42501',
  'ordinary users cannot assign official roles'
);
select throws_ok(
  $$select public.assign_profile_role(
      '00000000-0000-4000-8000-000000000001',
      'moderator',
      null
    )$$,
  '42501',
  'ordinary users cannot assign moderator roles'
);
select throws_ok(
  $$update public.profiles
    set role = 'official'
    where id = '00000000-0000-4000-8000-000000000001'$$,
  '42501',
  'ordinary users cannot update their own role'
);
select throws_ok(
  $$insert into public.profiles (id, role)
    values ('00000000-0000-4000-8000-000000000001', 'official')$$,
  '42501',
  'ordinary users cannot insert a privileged profile'
);

reset role;
select * from finish();
rollback;
