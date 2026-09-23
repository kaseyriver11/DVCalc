-- Booking saves that are safe to retry, with a durable receipt of what each
-- booking took out of the points ledger (UX2-01/02/03 in
-- docs/owner_ui_ux_review_2026-09-22.md). Same shape as 022's
-- record_point_movement: the client supplies the id, the server serializes
-- on it, and a retry returns the first result instead of writing twice.
-- Requires 015 (points_holding), 016, 019 (trip funding trigger), 020.

create table if not exists public.trip_deductions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  use_year_label integer not null,
  points_holding integer not null default 0 check (points_holding >= 0),
  points_banked integer not null default 0 check (points_banked >= 0),
  points_borrowed integer not null default 0 check (points_borrowed >= 0),
  points_remaining integer not null default 0 check (points_remaining >= 0),
  created_at timestamptz not null default now(),
  reversed_at timestamptz
);
create index if not exists trip_deductions_trip_idx on public.trip_deductions(trip_id);
alter table public.trip_deductions enable row level security;
drop policy if exists "Read own trip deductions" on public.trip_deductions;
create policy "Read own trip deductions" on public.trip_deductions for select to authenticated using (user_id = auth.uid());
grant select on public.trip_deductions to authenticated;
-- No insert/update/delete grants: receipts only change through the functions below.

-- Draw one (contract, use year) share from the ledger, least flexible bucket
-- first (holding, banked, borrowed, current) -- same order as
-- dvc-trip-deduct.js drawPoints() and the calendar's Suggested draw.
create or replace function public.trip_draw_points(p_owner uuid, p_trip uuid, p_contract uuid, p_label integer, p_points integer)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  r public.contract_year_points%rowtype;
  need integer := p_points;
  d_holding integer; d_banked integer; d_borrowed integer; d_remaining integer;
begin
  if p_points is null or p_points <= 0 then return null; end if;
  select * into r from public.contract_year_points
    where contract_id = p_contract and user_id = p_owner and use_year_label = p_label for update;
  if not found or r.balance_confirmed_at is null then
    raise exception 'Add the % balance for this contract before taking points out of it.', p_label;
  end if;
  d_holding := least(coalesce(r.points_holding, 0), need); need := need - d_holding;
  d_banked := least(coalesce(r.points_banked, 0), need); need := need - d_banked;
  d_borrowed := least(coalesce(r.points_borrowed, 0), need); need := need - d_borrowed;
  d_remaining := least(coalesce(r.points_remaining, 0), need); need := need - d_remaining;
  if need > 0 then
    raise exception 'Only % points are recorded for the % use year.', p_points - need, p_label;
  end if;
  update public.contract_year_points set
    points_holding = coalesce(points_holding, 0) - d_holding,
    points_banked = coalesce(points_banked, 0) - d_banked,
    points_borrowed = coalesce(points_borrowed, 0) - d_borrowed,
    points_remaining = coalesce(points_remaining, 0) - d_remaining,
    points_holding_entered_at = case when coalesce(points_holding, 0) - d_holding > 0 then points_holding_entered_at else null end,
    balance_confirmed_at = now()
    where id = r.id;
  insert into public.trip_deductions(user_id, trip_id, contract_id, use_year_label, points_holding, points_banked, points_borrowed, points_remaining)
    values (p_owner, p_trip, p_contract, p_label, d_holding, d_banked, d_borrowed, d_remaining);
  return jsonb_build_object('contract_id', p_contract, 'use_year_label', p_label,
    'holding', d_holding, 'banked', d_banked, 'borrowed', d_borrowed, 'remaining', d_remaining);
end;
$$;
revoke all on function public.trip_draw_points(uuid,uuid,uuid,integer,integer) from public, anon, authenticated;

-- Put a trip's live receipts back into the ledger. p_mode:
--   'restore'  -- back into the buckets they came from (record was wrong,
--                 or a Disney cancellation 31+ days before check-in)
--   'holding'  -- all into Holding (Disney cancellation 1-30 days out)
--   'forfeit'  -- nothing comes back (canceled on check-in day)
-- A receipt whose ledger row no longer exists can't be restored; it's
-- still marked reversed and reported so the owner can correct by hand.
create or replace function public.trip_reverse_deductions(p_owner uuid, p_trip uuid, p_mode text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  d public.trip_deductions%rowtype;
  total integer;
  touched integer;
  reversed jsonb := '[]'::jsonb;
  today date := (now() at time zone 'America/New_York')::date;
begin
  for d in select * from public.trip_deductions
      where trip_id = p_trip and user_id = p_owner and reversed_at is null
      order by contract_id, use_year_label for update loop
    total := d.points_holding + d.points_banked + d.points_borrowed + d.points_remaining;
    touched := 0;
    if p_mode = 'restore' then
      update public.contract_year_points set
        points_holding = coalesce(points_holding, 0) + d.points_holding,
        points_banked = coalesce(points_banked, 0) + d.points_banked,
        points_borrowed = coalesce(points_borrowed, 0) + d.points_borrowed,
        points_remaining = coalesce(points_remaining, 0) + d.points_remaining,
        points_holding_entered_at = case when d.points_holding > 0 then coalesce(points_holding_entered_at, today) else points_holding_entered_at end,
        balance_confirmed_at = now()
        where contract_id = d.contract_id and user_id = p_owner and use_year_label = d.use_year_label;
      get diagnostics touched = row_count;
    elsif p_mode = 'holding' then
      update public.contract_year_points set
        points_holding = coalesce(points_holding, 0) + total,
        points_holding_entered_at = coalesce(points_holding_entered_at, today),
        balance_confirmed_at = now()
        where contract_id = d.contract_id and user_id = p_owner and use_year_label = d.use_year_label;
      get diagnostics touched = row_count;
    end if;
    update public.trip_deductions set reversed_at = now() where id = d.id;
    reversed := reversed || jsonb_build_object('contract_id', d.contract_id, 'use_year_label', d.use_year_label,
      'points', total, 'mode', p_mode, 'restored', p_mode <> 'forfeit' and touched > 0);
  end loop;
  return reversed;
end;
$$;
revoke all on function public.trip_reverse_deductions(uuid,uuid,text) from public, anon, authenticated;

-- Create or edit a booking, optionally taking its points out of the ledger.
--   p_trip_id    client-generated id; the retry key for a create
--   p_mode       'create' | 'update'
--   p_trip       trips columns (resort_id, room_type_id, check_in, check_out,
--                points_used, custom_cash_value, notes, points_source_breakdown)
--   p_deductions [{contract_id, use_year_label, points}]
--   p_reconcile  create: take p_deductions out. update: put this trip's
--                current receipts back, then take p_deductions out -- so a
--                retried edit lands on the same balances, not twice.
-- A retried create returns the saved booking untouched.
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
    insert into public.trips(id, user_id, resort_id, room_type_id, check_in, check_out, points_used, custom_cash_value, notes, points_source_breakdown)
    values (p_trip_id, owner_id, p_trip->>'resort_id', p_trip->>'room_type_id', (p_trip->>'check_in')::date, (p_trip->>'check_out')::date,
      (p_trip->>'points_used')::integer, (p_trip->>'custom_cash_value')::numeric, nullif(p_trip->>'notes', ''), p_trip->'points_source_breakdown')
    returning * into saved;
  else
    update public.trips set
      resort_id = p_trip->>'resort_id', room_type_id = p_trip->>'room_type_id',
      check_in = (p_trip->>'check_in')::date, check_out = (p_trip->>'check_out')::date,
      points_used = (p_trip->>'points_used')::integer, custom_cash_value = (p_trip->>'custom_cash_value')::numeric,
      notes = nullif(p_trip->>'notes', ''), points_source_breakdown = p_trip->'points_source_breakdown'
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

-- Delete a booking and say what happens to its points.
--   p_mode 'canceled' -- canceled with Disney: DVC's cancellation rule by
--                        days before check-in (Eastern): 31+ restore,
--                        1-30 Holding, 0 or later forfeited
--          'mistake'  -- logged in error: restore exactly as drawn
--          'keep'     -- leave balances as they are
-- Deleting an already-deleted booking is a no-op, so retries are safe.
create or replace function public.delete_trip_booking(p_trip_id uuid, p_mode text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  owner_id uuid := auth.uid();
  t public.trips%rowtype;
  days_out integer;
  reverse_mode text;
  result jsonb := '[]'::jsonb;
begin
  if owner_id is null then raise exception 'Sign in to delete bookings.'; end if;
  if p_mode not in ('canceled', 'mistake', 'keep') or p_mode is null then raise exception 'Invalid delete.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_trip_id::text, 0));
  select * into t from public.trips where id = p_trip_id and user_id = owner_id;
  if not found then return jsonb_build_object('deleted', true, 'already', true, 'restored', '[]'::jsonb); end if;
  if p_mode = 'mistake' then
    reverse_mode := 'restore';
  elsif p_mode = 'canceled' then
    days_out := t.check_in - (now() at time zone 'America/New_York')::date;
    reverse_mode := case when days_out >= 31 then 'restore' when days_out >= 1 then 'holding' else 'forfeit' end;
  end if;
  if reverse_mode is not null then
    result := public.trip_reverse_deductions(owner_id, p_trip_id, reverse_mode);
  end if;
  delete from public.trips where id = p_trip_id;
  return jsonb_build_object('deleted', true, 'already', false, 'mode', coalesce(reverse_mode, 'keep'), 'restored', result);
end;
$$;
revoke all on function public.delete_trip_booking(uuid,text) from public;
grant execute on function public.delete_trip_booking(uuid,text) to authenticated;
