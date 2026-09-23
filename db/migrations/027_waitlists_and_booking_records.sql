-- Run once in the Supabase SQL editor (2026-09-23), after 024. db/schema.sql
-- already includes all of this for a fresh install.
--
-- Prompt 5: complete the owner-entered reservation record. DVC Companion
-- never makes, changes or watches a Disney reservation or waitlist; every
-- field here is what the owner entered.
--   1. trips: optional Disney confirmation number and the date the owner
--      last checked the booking in Disney. Entering a number doesn't make a
--      booking "verified".
--   2. booking_cancellations: an immutable record written when the owner
--      says a booking was canceled with Disney -- the trip row is still
--      deleted (so Membership Value, stay counts and badges are unchanged),
--      but what was booked, its confirmation number and what happened to
--      its points are kept. Deleting a record logged by mistake writes
--      nothing here.
--   3. waitlists: owner-entered waitlist requests, separate from trips and
--      itineraries. A waitlist never takes points or counts toward
--      Membership Value. It becomes fulfilled only inside save_trip_booking,
--      in the same transaction that records the confirmed booking.

-- ---- 1. Confirmation details on a booking ----
alter table public.trips
  add column if not exists disney_confirmation_number text,
  add column if not exists disney_checked_on date;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'trips_disney_confirmation_number_length') then
    alter table public.trips add constraint trips_disney_confirmation_number_length check (char_length(disney_confirmation_number) <= 40);
  end if;
end $$;

-- ---- 3. Waitlist requests (before save_trip_booking, which references it) ----
create table if not exists public.waitlists (
  id uuid primary key default gen_random_uuid(),     -- client-generated: the retry key for an add
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  resort_id text not null,
  room_type_id text not null,
  check_in date not null,
  check_out date not null,
  requested_on date not null,
  backup_trip_id uuid references public.trips(id) on delete set null,
  notes text check (char_length(notes) <= 500),
  status text not null default 'pending' check (status in ('pending', 'fulfilled', 'canceled')),
  fulfilled_trip_id uuid references public.trips(id) on delete set null,
  canceled_at timestamptz,
  -- Optional owner-set review reminder: email this many days before
  -- check-in while still pending (send-banking-reminders' waitlist loop).
  remind_days_before integer check (remind_days_before between 1 and 120),
  review_reminded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- No "fulfilled needs a trip" constraint: deleting that booking later
  -- sets fulfilled_trip_id to null, and must not be blocked by it.
  constraint waitlists_checkout_after_checkin check (check_out > check_in)
);
create index if not exists waitlists_user_idx on public.waitlists(user_id);
alter table public.waitlists enable row level security;
drop policy if exists "Read own waitlists" on public.waitlists;
create policy "Read own waitlists" on public.waitlists for select to authenticated using (user_id = auth.uid());
drop policy if exists "Add own pending waitlists" on public.waitlists;
create policy "Add own pending waitlists" on public.waitlists for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and fulfilled_trip_id is null);
-- Owners edit, cancel or reopen their own requests; only save_trip_booking
-- (security definer) marks one fulfilled, and a fulfilled one is final.
drop policy if exists "Edit own open waitlists" on public.waitlists;
create policy "Edit own open waitlists" on public.waitlists for update to authenticated
  using (user_id = auth.uid() and status <> 'fulfilled')
  with check (user_id = auth.uid() and status in ('pending', 'canceled') and fulfilled_trip_id is null);
grant select, insert, update on public.waitlists to authenticated;

-- ---- 2. Cancellation history ----
create table if not exists public.booking_cancellations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid not null,                  -- the deleted trip's id; no FK on purpose
  resort_id text not null,
  room_type_id text not null,
  check_in date not null,
  check_out date not null,
  points_used integer not null,
  disney_confirmation_number text,
  canceled_on date not null,              -- Eastern date the owner recorded it
  days_before_check_in integer not null,
  outcome text not null check (outcome in ('restore', 'holding', 'forfeit', 'none')),
  points jsonb not null default '[]'::jsonb,  -- trip_reverse_deductions() result
  created_at timestamptz not null default now()
);
create index if not exists booking_cancellations_user_idx on public.booking_cancellations(user_id);
alter table public.booking_cancellations enable row level security;
drop policy if exists "Read own booking cancellations" on public.booking_cancellations;
create policy "Read own booking cancellations" on public.booking_cancellations for select to authenticated using (user_id = auth.uid());
grant select on public.booking_cancellations to authenticated;
-- No insert/update/delete grants: only delete_trip_booking writes here.

-- ---- save_trip_booking: same contract as 024, plus the confirmation
-- fields and an optional p_trip.waitlist_id. With waitlist_id on a create,
-- the request is marked fulfilled in the same transaction -- if it's no
-- longer pending, nothing is saved. A retried create returns the saved
-- booking untouched, as before.
create or replace function public.save_trip_booking(
  p_trip_id uuid, p_mode text, p_trip jsonb, p_deductions jsonb, p_reconcile boolean
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  owner_id uuid := auth.uid();
  existing public.trips%rowtype;
  saved public.trips%rowtype;
  d jsonb;
  draws jsonb := '[]'::jsonb;
  restored jsonb := '[]'::jsonb;
  waitlist uuid := nullif(p_trip->>'waitlist_id', '')::uuid;
  confirmation text := nullif(btrim(coalesce(p_trip->>'disney_confirmation_number', '')), '');
  checked date := nullif(p_trip->>'disney_checked_on', '')::date;
begin
  if owner_id is null then raise exception 'Sign in to save bookings.'; end if;
  if p_trip_id is null or p_mode not in ('create', 'update') or p_mode is null then
    raise exception 'Invalid booking save.';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_trip_id::text, 0));
  select * into existing from public.trips where id = p_trip_id;
  if found and existing.user_id <> owner_id then raise exception 'Booking not found.'; end if;

  if p_mode = 'create' and found then
    return jsonb_build_object('trip', to_jsonb(existing), 'retried', true,
      'deductions', coalesce((select jsonb_agg(to_jsonb(t)) from public.trip_deductions t where t.trip_id = p_trip_id and t.reversed_at is null), '[]'::jsonb));
  end if;
  if p_mode = 'update' and not found then raise exception 'Booking not found.'; end if;

  if p_mode = 'create' then
    insert into public.trips(id, user_id, resort_id, room_type_id, check_in, check_out, points_used, custom_cash_value, notes, points_source_breakdown, disney_confirmation_number, disney_checked_on)
    values (p_trip_id, owner_id, p_trip->>'resort_id', p_trip->>'room_type_id', (p_trip->>'check_in')::date, (p_trip->>'check_out')::date,
      (p_trip->>'points_used')::integer, (p_trip->>'custom_cash_value')::numeric, nullif(p_trip->>'notes', ''), p_trip->'points_source_breakdown', confirmation, checked)
    returning * into saved;
    if waitlist is not null then
      update public.waitlists set status = 'fulfilled', fulfilled_trip_id = p_trip_id, updated_at = now()
        where id = waitlist and user_id = owner_id and status = 'pending';
      if not found then raise exception 'This waitlist request is no longer pending. Reload Bookings & Stays.'; end if;
    end if;
  else
    update public.trips set
      resort_id = p_trip->>'resort_id', room_type_id = p_trip->>'room_type_id',
      check_in = (p_trip->>'check_in')::date, check_out = (p_trip->>'check_out')::date,
      points_used = (p_trip->>'points_used')::integer, custom_cash_value = (p_trip->>'custom_cash_value')::numeric,
      notes = nullif(p_trip->>'notes', ''), points_source_breakdown = p_trip->'points_source_breakdown',
      disney_confirmation_number = confirmation, disney_checked_on = checked
      where id = p_trip_id returning * into saved;
  end if;

  if coalesce(p_reconcile, false) then
    if p_mode = 'update' then
      restored := public.trip_reverse_deductions(owner_id, p_trip_id, 'restore');
    end if;
    for d in select value from jsonb_array_elements(coalesce(p_deductions, '[]'::jsonb))
        order by value->>'contract_id', (value->>'use_year_label')::integer loop
      if not exists (select 1 from public.contracts where id = (d->>'contract_id')::uuid and user_id = owner_id) then
        raise exception 'Contract not found.';
      end if;
      draws := draws || coalesce(public.trip_draw_points(owner_id, p_trip_id, (d->>'contract_id')::uuid,
        (d->>'use_year_label')::integer, (d->>'points')::integer), '[]'::jsonb);
    end loop;
  end if;

  return jsonb_build_object('trip', to_jsonb(saved), 'retried', false, 'restored', restored,
    'deductions', coalesce((select jsonb_agg(to_jsonb(t)) from public.trip_deductions t where t.trip_id = p_trip_id and t.reversed_at is null), '[]'::jsonb));
end;
$$;
revoke all on function public.save_trip_booking(uuid,text,jsonb,jsonb,boolean) from public;
grant execute on function public.save_trip_booking(uuid,text,jsonb,jsonb,boolean) to authenticated;

-- ---- delete_trip_booking: same modes and point outcomes as 024. 'canceled'
-- now also writes a booking_cancellations record (even when the booking
-- never took points in the app: outcome 'none').
create or replace function public.delete_trip_booking(p_trip_id uuid, p_mode text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  owner_id uuid := auth.uid();
  t public.trips%rowtype;
  days_out integer;
  reverse_mode text;
  result jsonb := '[]'::jsonb;
  today date := (now() at time zone 'America/New_York')::date;
begin
  if owner_id is null then raise exception 'Sign in to delete bookings.'; end if;
  if p_mode not in ('canceled', 'mistake', 'keep') or p_mode is null then raise exception 'Invalid delete.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_trip_id::text, 0));
  select * into t from public.trips where id = p_trip_id and user_id = owner_id;
  if not found then return jsonb_build_object('deleted', true, 'already', true, 'restored', '[]'::jsonb); end if;
  days_out := t.check_in - today;
  if p_mode = 'mistake' then
    reverse_mode := 'restore';
  elsif p_mode = 'canceled' then
    reverse_mode := case when days_out >= 31 then 'restore' when days_out >= 1 then 'holding' else 'forfeit' end;
  end if;
  if reverse_mode is not null then
    result := public.trip_reverse_deductions(owner_id, p_trip_id, reverse_mode);
  end if;
  if p_mode = 'canceled' then
    insert into public.booking_cancellations(user_id, trip_id, resort_id, room_type_id, check_in, check_out, points_used,
      disney_confirmation_number, canceled_on, days_before_check_in, outcome, points)
    values (owner_id, t.id, t.resort_id, t.room_type_id, t.check_in, t.check_out, t.points_used,
      t.disney_confirmation_number, today, days_out, case when jsonb_array_length(result) = 0 then 'none' else reverse_mode end, result);
  end if;
  delete from public.trips where id = p_trip_id;
  return jsonb_build_object('deleted', true, 'already', false, 'mode', coalesce(reverse_mode, 'keep'), 'restored', result);
end;
$$;
revoke all on function public.delete_trip_booking(uuid,text) from public;
grant execute on function public.delete_trip_booking(uuid,text) to authenticated;

notify pgrst, 'reload schema';
