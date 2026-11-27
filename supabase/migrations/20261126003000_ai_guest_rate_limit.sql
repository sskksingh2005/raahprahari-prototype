-- Durable rate limit for unauthenticated extract-hazard requests.
-- guest_key is an HMAC of the client IP (or a browser ID for local callers),
-- so raw network addresses and browser identifiers are never stored.

create table if not exists public.ai_guest_usage (
  guest_key text primary key check (guest_key ~ '^[0-9a-f]{64}$'),
  window_start timestamptz not null,
  request_count integer not null check (request_count >= 0)
);

comment on table public.ai_guest_usage is
  'Current AI extraction rate-limit window per pseudonymous guest. Server-only (service_role).';

alter table public.ai_guest_usage enable row level security;
revoke all on table public.ai_guest_usage from public, anon, authenticated;
grant select, insert, update, delete on table public.ai_guest_usage to service_role;

create or replace function public.consume_ai_guest_quota(
  p_guest_key text,
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
  v_row public.ai_guest_usage%rowtype;
begin
  if p_guest_key is null or p_guest_key !~ '^[0-9a-f]{64}$' then
    raise exception 'p_guest_key must be a SHA-256 HMAC' using errcode = '22023';
  end if;
  if p_limit is null or p_limit < 1 or p_window_seconds is null or p_window_seconds < 1 then
    raise exception 'p_limit and p_window_seconds must be positive' using errcode = '22023';
  end if;
  v_window := pg_catalog.make_interval(secs => p_window_seconds);

  insert into public.ai_guest_usage as u (guest_key, window_start, request_count)
  values (p_guest_key, v_now, 1)
  on conflict (guest_key) do update
    set
      window_start = case
        when u.window_start + v_window <= v_now then v_now
        else u.window_start
      end,
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

comment on function public.consume_ai_guest_quota(text, integer, integer) is
  'Counts one guest AI extraction request; accepts only opaque HMAC keys. service_role only.';

revoke all on function public.consume_ai_guest_quota(text, integer, integer) from public;
revoke all on function public.consume_ai_guest_quota(text, integer, integer) from anon, authenticated;
grant execute on function public.consume_ai_guest_quota(text, integer, integer) to service_role;
