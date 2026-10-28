-- Storage buckets, a Postgres-backed rate limiter, and demo-user cleanup.

-- ---------------------------------------------------------------------------
-- Storage: private buckets; each user owns the folder named after their id
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('task-outputs', 'task-outputs', false, 10485760, array[
    'application/pdf', 'image/png', 'image/jpeg', 'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]),
  ('avatars', 'avatars', false, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "read own task outputs" on storage.objects for select to authenticated using (
  bucket_id = 'task-outputs'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app.is_staff()))
);
create policy "upload own task outputs" on storage.objects for insert to authenticated with check (
  bucket_id = 'task-outputs' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "replace own task outputs" on storage.objects for update to authenticated using (
  bucket_id = 'task-outputs' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "delete own task outputs" on storage.objects for delete to authenticated using (
  bucket_id = 'task-outputs' and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "read avatars" on storage.objects for select to authenticated using (bucket_id = 'avatars');
create policy "upload own avatar" on storage.objects for insert to authenticated with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "replace own avatar" on storage.objects for update to authenticated using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "delete own avatar" on storage.objects for delete to authenticated using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- ---------------------------------------------------------------------------
-- Rate limiting: fixed windows, one row per key per window
-- ---------------------------------------------------------------------------
create table app.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits int not null default 0,
  primary key (key, window_start)
);

-- Returns true when the call is allowed, false when the key is over its limit.
create function app.rate_limit(p_key text, p_max int, p_window_seconds int)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits int;
begin
  insert into app.rate_limits as r (key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning hits into v_hits;
  return v_hits <= p_max;
end;
$$;

-- Server code reaches it through this public wrapper (the app schema isn't exposed).
-- Only the server's secret-key role may call it, so users can't burn someone else's limit.
create function public.check_rate_limit(p_key text, p_max int, p_window_seconds int)
returns boolean
language sql security definer set search_path = '' as $$
  select app.rate_limit(p_key, p_max, p_window_seconds)
$$;
revoke execute on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, int, int) to service_role;

-- ---------------------------------------------------------------------------
-- Demo users: anonymous sessions created by "Explore as Veronica" are purged after 24 h.
-- Deleting the auth user cascades to their profile, plan, completions and demo cohort.
-- Their storage objects are removed by the /api/cron/cleanup route (Storage API only).
-- ---------------------------------------------------------------------------
create function app.purge_demo_users() returns int
language plpgsql security definer set search_path = '' as $$
declare
  v_count int;
begin
  delete from auth.users
  where is_anonymous = true and created_at < now() - interval '24 hours';
  get diagnostics v_count = row_count;
  delete from app.rate_limits where window_start < now() - interval '2 days';
  return v_count;
end;
$$;

create extension if not exists pg_cron;

select cron.schedule('purge-demo-users', '17 * * * *', $$select app.purge_demo_users()$$);
