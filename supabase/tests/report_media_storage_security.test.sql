begin;

select plan(11);

select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'storage.objects'::regclass),
  'storage objects has row-level security enabled'
);
select ok(
  exists (
    select 1
    from storage.buckets
    where id = 'report-media'
      and name = 'report-media'
      and public is false
      and file_size_limit = 10485760
      and allowed_mime_types = array['image/jpeg', 'image/png']::text[]
  ),
  'report media bucket is private and limited to supported types and size'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_policy
    where polrelid = 'storage.objects'::regclass
      and polname = 'report_media_owner_read'
      and polcmd = 'r'
      and pg_catalog.pg_get_expr(polqual, polrelid) like '%reporter_id%'
      and pg_catalog.pg_get_expr(polqual, polrelid) like '%storage_path%'
  ),
  'owners can read only objects linked to their attachment metadata'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_policy
    where polrelid = 'storage.objects'::regclass
      and polname = 'report_media_staff_read'
      and polcmd = 'r'
      and pg_catalog.pg_get_expr(polqual, polrelid) like '%has_profile_role%'
  ),
  'verified reviewers, moderators, and admins can read report media'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_policy
    where polrelid = 'storage.objects'::regclass
      and polname = 'report_media_owner_upload'
      and polcmd = 'a'
      and pg_catalog.pg_get_expr(polwithcheck, polrelid) like '%needs_info%'
      and pg_catalog.pg_get_expr(polwithcheck, polrelid) like '%storage_path%'
  ),
  'uploads require owned metadata for reports in an allowed status'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_policy
    where polrelid = 'storage.objects'::regclass
      and polname = 'report_media_anon_block'
      and not polpermissive
      and polcmd = '*'
      and pg_catalog.pg_get_expr(polqual, polrelid) like '%report-media%'
  ),
  'anonymous access to report media is restricted even by broader policies'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_policy
    where polrelid = 'storage.objects'::regclass
      and polname = 'report_media_authenticated_read_scope'
      and not polpermissive
      and polcmd = 'r'
  ),
  'authenticated object reads are constrained to owners and staff'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_policy
    where polrelid = 'storage.objects'::regclass
      and polname = 'report_media_authenticated_insert_scope'
      and not polpermissive
      and polcmd = 'a'
  ),
  'authenticated object inserts are constrained to eligible owners'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_policy
    where polrelid = 'storage.objects'::regclass
      and polname = 'report_media_authenticated_update_block'
      and not polpermissive
      and polcmd = 'w'
  )
    and exists (
      select 1 from pg_catalog.pg_policy
      where polrelid = 'storage.objects'::regclass
        and polname = 'report_media_authenticated_delete_block'
        and not polpermissive
        and polcmd = 'd'
    ),
  'authenticated users cannot overwrite or delete report media'
);
select ok(
  pg_catalog.pg_get_expr(
    (
      select polwithcheck
      from pg_catalog.pg_policy
      where polrelid = 'storage.objects'::regclass
        and polname = 'report_media_owner_upload'
    ),
    'storage.objects'::regclass
  ) like '%image/jpeg%'
    and pg_catalog.pg_get_expr(
      (
        select polwithcheck
        from pg_catalog.pg_policy
        where polrelid = 'storage.objects'::regclass
          and polname = 'report_media_owner_upload'
      ),
      'storage.objects'::regclass
    ) like '%image/png%',
  'upload policy matches image extensions to declared MIME types'
);
select ok(
  exists (
    select 1
    from storage.buckets
    where id = 'report-media'
      and public = false
  ),
  'report media is not available through a public bucket URL'
);

select * from finish();
rollback;
