begin;

select plan(12);

select ok(
  (
    select routine.prosecdef
      and routine.proconfig @> array['search_path=""']
    from pg_catalog.pg_proc as routine
    where routine.oid =
      'public.prune_expired_rate_limit_state()'::regprocedure
  ),
  'maintenance function is security-definer with an empty search path'
);
select ok(
  pg_catalog.has_function_privilege(
    'service_role',
    'public.prune_expired_rate_limit_state()',
    'EXECUTE'
  )
    and not pg_catalog.has_function_privilege(
      'anon',
      'public.prune_expired_rate_limit_state()',
      'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'authenticated',
      'public.prune_expired_rate_limit_state()',
      'EXECUTE'
    ),
  'only service_role and the function owner can invoke rate-limit maintenance'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.ai_usage'::regclass)
    and (select relrowsecurity from pg_catalog.pg_class where oid = 'public.ai_guest_usage'::regclass)
    and (select relrowsecurity from pg_catalog.pg_class where oid = 'public.report_submission_usage'::regclass)
    and not pg_catalog.has_table_privilege('authenticated', 'public.ai_usage', 'SELECT')
    and not pg_catalog.has_table_privilege('authenticated', 'public.ai_guest_usage', 'SELECT')
    and not pg_catalog.has_table_privilege('authenticated', 'public.report_submission_usage', 'SELECT'),
  'rate-limit state remains private and RLS-protected'
);

select lives_ok(
  $$insert into auth.users (
      id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    values
      (
        '00000000-0000-4000-8000-000000000017',
        'authenticated', 'authenticated', 'be1-17-old@example.invalid', '',
        pg_catalog.now(), '{}'::jsonb, '{}'::jsonb, pg_catalog.now(), pg_catalog.now()
      ),
      (
        '00000000-0000-4000-8000-000000000018',
        'authenticated', 'authenticated', 'be1-17-recent@example.invalid', '',
        pg_catalog.now(), '{}'::jsonb, '{}'::jsonb, pg_catalog.now(), pg_catalog.now()
      )$$,
  'test accounts are provisioned through the existing Auth profile trigger'
);
select lives_ok(
  $$insert into public.ai_usage (user_id, window_start, request_count)
      values
        ('00000000-0000-4000-8000-000000000017', pg_catalog.now() - interval '2 days', 1),
        ('00000000-0000-4000-8000-000000000018', pg_catalog.now() - interval '1 hour', 1)$$,
  'test AI user quota rows include expired and recent state'
);
select lives_ok(
  $$insert into public.ai_guest_usage (guest_key, window_start, request_count)
      values
        (pg_catalog.repeat('a', 64), pg_catalog.now() - interval '2 days', 1),
        (pg_catalog.repeat('b', 64), pg_catalog.now() - interval '1 hour', 1)$$,
  'test guest quota rows include expired and recent state'
);
select lives_ok(
  $$insert into public.report_submission_usage (user_id, window_start, request_count)
      values
        ('00000000-0000-4000-8000-000000000017', pg_catalog.now() - interval '2 days', 1),
        ('00000000-0000-4000-8000-000000000018', pg_catalog.now() - interval '1 hour', 1)$$,
  'test report quota rows include expired and recent state'
);

set local role service_role;
select ok(
  (
    select ai_user_rows_deleted = 1
      and ai_guest_rows_deleted = 1
      and report_submission_rows_deleted = 1
    from public.prune_expired_rate_limit_state()
  ),
  'maintenance deletes expired rows and reports per-table counts'
);
reset role;

select ok(
  not exists (
    select 1 from public.ai_usage
    where user_id = '00000000-0000-4000-8000-000000000017'
  )
    and exists (
      select 1 from public.ai_usage
      where user_id = '00000000-0000-4000-8000-000000000018'
    )
    and not exists (
      select 1 from public.ai_guest_usage
      where guest_key = pg_catalog.repeat('a', 64)
    )
    and exists (
      select 1 from public.ai_guest_usage
      where guest_key = pg_catalog.repeat('b', 64)
    )
    and not exists (
      select 1 from public.report_submission_usage
      where user_id = '00000000-0000-4000-8000-000000000017'
    )
    and exists (
      select 1 from public.report_submission_usage
      where user_id = '00000000-0000-4000-8000-000000000018'
    ),
  'the one-day cutoff preserves recent quota state'
);
set local role service_role;
select ok(
  (
    select ai_user_rows_deleted = 0
      and ai_guest_rows_deleted = 0
      and report_submission_rows_deleted = 0
    from public.prune_expired_rate_limit_state()
  ),
  'repeated maintenance is idempotent'
);
reset role;
select lives_ok(
  $$delete from auth.users
    where id in (
      '00000000-0000-4000-8000-000000000017',
      '00000000-0000-4000-8000-000000000018'
    )$$,
  'test accounts can be deleted'
);
select ok(
  not exists (
    select 1 from public.ai_usage
    where user_id = '00000000-0000-4000-8000-000000000018'
  )
    and not exists (
      select 1 from public.report_submission_usage
      where user_id = '00000000-0000-4000-8000-000000000018'
    ),
  'Auth deletion still cascades per-user quota state'
);

select * from finish();
rollback;
