-- Lets a signed-in mentor find their own mentor profile (account links are otherwise hidden).
create function public.my_mentor_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select app.my_mentor_id()
$$;
revoke execute on function public.my_mentor_id() from public, anon;
grant execute on function public.my_mentor_id() to authenticated;
