-- Lets a signed-in user permanently delete their own account.
--
-- The `authenticated` role can't DELETE from auth.users directly -- Supabase
-- reserves that table for the auth system itself. This SECURITY DEFINER
-- function runs with the privileges of whoever creates it (the role running
-- this migration, via the SQL editor), which does have that permission, but
-- it only ever deletes auth.uid() -- the currently-authenticated caller --
-- so it can't be used to delete anyone else's account.
--
-- Deleting the auth.users row cascades through profiles, contracts, trips,
-- itineraries, and reminder_log via the `on delete cascade` foreign keys
-- already in db/schema.sql -- nothing needs to be deleted manually here.
--
-- Run this once in the Supabase SQL editor, same as migrations 002-004.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
