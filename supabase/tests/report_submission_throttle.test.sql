begin;

select plan(14);

select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.report_submission_usage'::regclass)
    and not pg_catalog.has_table_privilege('anon', 'public.report_submission_usage', 'SELECT')
    and not pg_catalog.has_table_privilege('authenticated', 'public.report_submission_usage', 'SELECT')
    and not pg_catalog.has_table_privilege('service_role', 'public.report_submission_usage', 'SELECT')
    and not pg_catalog.has_table_privilege('service_role', 'public.report_submission_usage', 'INSERT'),
  'submission counters are private, including from service-role table access'
);
select ok(
  (
    select routine.prosecdef
      and routine.proconfig @> array['search_path=""']
    from pg_catalog.pg_proc as routine
    where routine.oid =
      'public.enforce_report_submission_rate_limit()'::regprocedure
  )
    and not pg_catalog.has_function_privilege(
      'anon',
      'public.enforce_report_submission_rate_limit()',
      'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'authenticated',
      'public.enforce_report_submission_rate_limit()',
      'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'service_role',
      'public.enforce_report_submission_rate_limit()',
      'EXECUTE'
    ),
  'the trigger uses a safe definer context and cannot be called directly'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'public.hazard_reports'::regclass
      and tgname = 'hazard_reports_submission_rate_limit'
      and not tgisinternal
      and (tgtype::integer & 5) = 5
      and (tgtype::integer & 2) = 0
  )
    and exists (
      select 1 from pg_catalog.pg_trigger
      where tgrelid = 'public.hazard_reports'::regclass
        and tgname = 'audit_domain_hazard_reports'
        and not tgisinternal
        and (tgtype::integer & 28) = 28
    ),
  'new submissions are throttled without replacing the existing audit trigger'
);

select lives_ok(
  $$insert into auth.users (
      id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    values (
      '00000000-0000-4000-8000-000000000016',
      'authenticated',
      'authenticated',
      'be1-16-test@example.invalid',
      '',
      pg_catalog.now(),
      '{}'::jsonb,
      '{}'::jsonb,
      pg_catalog.now(),
      pg_catalog.now()
    )$$,
  'test account receives normal Auth profile provisioning'
);

set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000016';
set local request.jwt.claim.role = 'authenticated';
set local role authenticated;

select lives_ok(
  $$insert into public.hazard_reports (
      reference, segment_id, reporter_id, hazard_type, severity,
      description, landmark, observed_at
    )
    values
      ('BE1-16-report-1', 'nh7-01', '00000000-0000-4000-8000-000000000016', 'landslide', 'high', 'Throttle test report', 'Test location', pg_catalog.now()),
      ('BE1-16-report-2', 'nh7-01', '00000000-0000-4000-8000-000000000016', 'landslide', 'high', 'Throttle test report', 'Test location', pg_catalog.now()),
      ('BE1-16-report-3', 'nh7-01', '00000000-0000-4000-8000-000000000016', 'landslide', 'high', 'Throttle test report', 'Test location', pg_catalog.now()),
      ('BE1-16-report-4', 'nh7-01', '00000000-0000-4000-8000-000000000016', 'landslide', 'high', 'Throttle test report', 'Test location', pg_catalog.now()),
      ('BE1-16-report-5', 'nh7-01', '00000000-0000-4000-8000-000000000016', 'landslide', 'high', 'Throttle test report', 'Test location', pg_catalog.now())$$,
  'the first five new submissions fit in the ten-minute window'
);

set local role service_role;
select lives_ok(
  $$insert into public.hazard_reports (
      reference, segment_id, reporter_id, hazard_type, severity,
      description, landmark, observed_at
    )
    values (
      'BE1-16-report-1', 'nh7-01',
      '00000000-0000-4000-8000-000000000016',
      'landslide', 'high', 'Idempotent report retry', 'Test location',
      pg_catalog.now()
    )
    on conflict (reference) do update
      set description = excluded.description$$,
  'an idempotent report retry remains valid at the submission limit'
);
reset role;

select is(
  (
    select request_count
    from public.report_submission_usage
    where user_id = '00000000-0000-4000-8000-000000000016'
  ),
  5,
  'an idempotent update does not consume another submission slot'
);

set local role authenticated;
select throws_ok(
  $$insert into public.hazard_reports (
      reference, segment_id, reporter_id, hazard_type, severity,
      description, landmark, observed_at
    )
    values (
      'BE1-16-report-6', 'nh7-01',
      '00000000-0000-4000-8000-000000000016',
      'landslide', 'high', 'Throttle test report', 'Test location',
      pg_catalog.now()
    )$$,
  'P0001',
  'the sixth new submission is rate limited'
);

reset role;

select is(
  (
    select request_count
    from public.report_submission_usage
    where user_id = '00000000-0000-4000-8000-000000000016'
  ),
  5,
  'a rejected submission does not corrupt or increment the committed counter'
);
select lives_ok(
  $$update public.report_submission_usage
    set window_start = pg_catalog.now() - interval '11 minutes'
    where user_id = '00000000-0000-4000-8000-000000000016'$$,
  'test can age the fixed window'
);

set local role authenticated;
select lives_ok(
  $$insert into public.hazard_reports (
      reference, segment_id, reporter_id, hazard_type, severity,
      description, landmark, observed_at
    )
    values (
      'BE1-16-report-after-window', 'nh7-01',
      '00000000-0000-4000-8000-000000000016',
      'landslide', 'high', 'Throttle test report', 'Test location',
      pg_catalog.now()
    )$$,
  'a new window accepts submissions again'
);
reset role;

select is(
  (
    select request_count
    from public.report_submission_usage
    where user_id = '00000000-0000-4000-8000-000000000016'
  ),
  1,
  'the expired counter resets to one'
);
select lives_ok(
  $$delete from auth.users
    where id = '00000000-0000-4000-8000-000000000016'$$,
  'test account can be deleted'
);
select is(
  (
    select count(*)
    from public.report_submission_usage
    where user_id = '00000000-0000-4000-8000-000000000016'
  ),
  0::bigint,
  'user deletion cascades the private quota state'
);

select * from finish();
rollback;
