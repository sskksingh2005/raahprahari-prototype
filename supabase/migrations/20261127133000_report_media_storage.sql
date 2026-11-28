-- Private report-media storage with owner- and staff-scoped object access (BE1-10).

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'report-media',
  'report-media',
  false,
  10485760,
  array['image/jpeg', 'image/png']::text[]
)
on conflict (id) do update
set name = excluded.name,
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists report_media_owner_read on storage.objects;
create policy report_media_owner_read
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'report-media'
    and exists (
      select 1
      from public.report_attachments as attachment
      join public.hazard_reports as report
        on report.reference = attachment.report_reference
      where attachment.storage_path = name
        and split_part(name, '/', 1) = report.reference
        and name ~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/[a-z0-9_-]{1,120}\.(jpg|jpeg|png)$'
        and (
          (attachment.media_type = 'image/jpeg' and name ~* '\.(jpg|jpeg)$')
          or (attachment.media_type = 'image/png' and name ~* '\.png$')
        )
        and report.reporter_id = (select auth.uid())
    )
  );

drop policy if exists report_media_staff_read on storage.objects;
create policy report_media_staff_read
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'report-media'
    and exists (
      select 1
      from public.report_attachments as attachment
      join public.hazard_reports as report
        on report.reference = attachment.report_reference
      where attachment.storage_path = name
        and split_part(name, '/', 1) = report.reference
        and name ~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/[a-z0-9_-]{1,120}\.(jpg|jpeg|png)$'
        and (
          (attachment.media_type = 'image/jpeg' and name ~* '\.(jpg|jpeg)$')
          or (attachment.media_type = 'image/png' and name ~* '\.png$')
        )
        and public.has_profile_role(
          array['reviewer', 'moderator', 'admin']::public.profile_role[]
        )
    )
  );

drop policy if exists report_media_owner_upload on storage.objects;
create policy report_media_owner_upload
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'report-media'
    and exists (
      select 1
      from public.report_attachments as attachment
      join public.hazard_reports as report
        on report.reference = attachment.report_reference
      where attachment.storage_path = name
        and split_part(name, '/', 1) = report.reference
        and name ~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/[a-z0-9_-]{1,120}\.(jpg|jpeg|png)$'
        and (
          (attachment.media_type = 'image/jpeg' and name ~* '\.(jpg|jpeg)$')
          or (attachment.media_type = 'image/png' and name ~* '\.png$')
        )
        and report.reporter_id = (select auth.uid())
        and report.status in ('under_review', 'needs_info')
    )
  );

-- These restrictive policies prevent older or future broad policies from
-- widening access to this bucket while leaving other buckets unaffected.
drop policy if exists report_media_anon_block on storage.objects;
create policy report_media_anon_block
  on storage.objects
  as restrictive
  for all
  to anon
  using (bucket_id <> 'report-media')
  with check (bucket_id <> 'report-media');

drop policy if exists report_media_authenticated_read_scope on storage.objects;
create policy report_media_authenticated_read_scope
  on storage.objects
  as restrictive
  for select
  to authenticated
  using (
    bucket_id <> 'report-media'
    or (
      bucket_id = 'report-media'
      and (
        exists (
          select 1
          from public.report_attachments as attachment
          join public.hazard_reports as report
            on report.reference = attachment.report_reference
          where attachment.storage_path = name
            and split_part(name, '/', 1) = report.reference
            and name ~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/[a-z0-9_-]{1,120}\.(jpg|jpeg|png)$'
            and (
              (attachment.media_type = 'image/jpeg' and name ~* '\.(jpg|jpeg)$')
              or (attachment.media_type = 'image/png' and name ~* '\.png$')
            )
            and report.reporter_id = (select auth.uid())
        )
        or exists (
          select 1
          from public.report_attachments as attachment
          join public.hazard_reports as report
            on report.reference = attachment.report_reference
          where attachment.storage_path = name
            and split_part(name, '/', 1) = report.reference
            and name ~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/[a-z0-9_-]{1,120}\.(jpg|jpeg|png)$'
            and (
              (attachment.media_type = 'image/jpeg' and name ~* '\.(jpg|jpeg)$')
              or (attachment.media_type = 'image/png' and name ~* '\.png$')
            )
            and public.has_profile_role(
              array['reviewer', 'moderator', 'admin']::public.profile_role[]
            )
        )
      )
    )
  );

drop policy if exists report_media_authenticated_insert_scope on storage.objects;
create policy report_media_authenticated_insert_scope
  on storage.objects
  as restrictive
  for insert
  to authenticated
  with check (
    bucket_id <> 'report-media'
    or (
      bucket_id = 'report-media'
      and exists (
        select 1
        from public.report_attachments as attachment
        join public.hazard_reports as report
          on report.reference = attachment.report_reference
        where attachment.storage_path = name
          and split_part(name, '/', 1) = report.reference
          and name ~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/[a-z0-9_-]{1,120}\.(jpg|jpeg|png)$'
          and (
            (attachment.media_type = 'image/jpeg' and name ~* '\.(jpg|jpeg)$')
            or (attachment.media_type = 'image/png' and name ~* '\.png$')
          )
          and report.reporter_id = (select auth.uid())
          and report.status in ('under_review', 'needs_info')
      )
    )
  );

drop policy if exists report_media_authenticated_update_block on storage.objects;
create policy report_media_authenticated_update_block
  on storage.objects
  as restrictive
  for update
  to authenticated
  using (bucket_id <> 'report-media')
  with check (bucket_id <> 'report-media');

drop policy if exists report_media_authenticated_delete_block on storage.objects;
create policy report_media_authenticated_delete_block
  on storage.objects
  as restrictive
  for delete
  to authenticated
  using (bucket_id <> 'report-media');

comment on column public.report_attachments.storage_path is
  'Private report-media path: <report UUID>/<opaque attachment key>.<jpg|jpeg|png>; set by the trusted upload-target workflow.';
