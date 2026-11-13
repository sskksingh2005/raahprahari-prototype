-- Durable per-user rate limit for the extract-hazard Edge Function.
--
-- One row per user holds only the current fixed window: when a window ends,
-- the next request resets that same row. Rows never accumulate per window.
-- No descriptions, tokens or model output are stored. Rows are removed with
-- the user (ON DELETE CASCADE). Rows for users who stopped using AI stay at
-- one small row each; an optional cleanup is noted at the end of this file.

create table if not exists public.ai_usage (
  user_id uuid primary key references auth.users (id) on delete cascade,
  window_start timestamptz not null,
  request_count integer not null check (request_count >= 0)
);

comment on table public.ai_usage is
  'Current AI extraction rate-limit window per user. Server-only (service_role).';

-- No browser access: RLS on with no policies, and no table privileges for
-- client roles. service_role bypasses RLS and is the only role granted access.
alter table public.ai_usage enable row level security;
revoke all on table public.ai_usage from public, anon, authenticated;
grant select, insert, update, delete on table public.ai_usage to service_role;

-- Atomically counts one request for p_user_id and reports whether it fits in
-- the current window. Uses database time (now()).
--
-- Concurrency: INSERT ... ON CONFLICT DO UPDATE takes a row lock on the user's
-- row, so concurrent calls for the same user run one after another and each
-- sees the previous call's count. A first-ever concurrent insert is resolved
-- by the unique key: the loser falls into the DO UPDATE branch.
--
-- SECURITY INVOKER is enough: the only caller is service_role, which has the
-- table grants above. search_path is pinned and objects are schema-qualified.
create or replace function public.consume_ai_quota(
  p_user_id uuid,
  p_limit integer default 5,
  p_window_seconds integer default 60
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := pg_catalog.now();
  v_window interval;
  v_row public.ai_usage%rowtype;
begin
  if p_user_id is null then
    raise exception 'p_user_id is required' using errcode = '22004';
  end if;
  if p_limit is null or p_limit < 1 or p_window_seconds is null or p_window_seconds < 1 then
    raise exception 'p_limit and p_window_seconds must be positive' using errcode = '22023';
  end if;
  v_window := pg_catalog.make_interval(secs => p_window_seconds);

  insert into public.ai_usage as u (user_id, window_start, request_count)
  values (p_user_id, v_now, 1)
  on conflict (user_id) do update
    set
      window_start = case
        when u.window_start + v_window <= v_now then v_now
        else u.window_start
      end,
      -- Denied attempts still count, capped at limit + 1 so the value stays small.
      request_count = case
        when u.window_start + v_window <= v_now then 1
        else pg_catalog.least(u.request_count + 1, p_limit + 1)
      end
  returning u.* into v_row;

  allowed := v_row.request_count <= p_limit;
  retry_after_seconds := case
    when allowed then 0
    else pg_catalog.greatest(
      1,
      pg_catalog.ceil(
        extract(epoch from (v_row.window_start + v_window - v_now))
      )::integer
    )
  end;
  return next;
end;
$$;

comment on function public.consume_ai_quota(uuid, integer, integer) is
  'Counts one AI extraction request for a user; returns allowed and retry_after_seconds. service_role only.';

-- Functions are executable by PUBLIC by default; Supabase also grants new
-- public functions to anon/authenticated. Remove all of that explicitly.
revoke all on function public.consume_ai_quota(uuid, integer, integer) from public;
revoke all on function public.consume_ai_quota(uuid, integer, integer) from anon, authenticated;
grant execute on function public.consume_ai_quota(uuid, integer, integer) to service_role;

-- Optional cleanup (not scheduled here): rows whose window ended long ago carry
-- no state. If pg_cron is enabled, a daily job could run:
--   delete from public.ai_usage where window_start < now() - interval '1 day';
