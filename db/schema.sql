-- DVC Companion accounts/contracts schema (Supabase Postgres)
-- See docs/accounts_plan.md for the full feature plan this implements.
--
-- Run this in the Supabase SQL editor for a fresh project. Idempotent-ish
-- (uses IF NOT EXISTS / CREATE OR REPLACE) so it's safe to re-run, but not
-- a real migration tool -- for schema changes later, add a new dated file
-- in this directory rather than editing this one in place once it's live.

-- ---------------------------------------------------------------------
-- profiles: one row per auth user, auto-created on signup.
-- ---------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  reminder_opt_in boolean not null default false,
  reminder_lead_days int not null default 14,
  -- Opaque token for the no-login unsubscribe link in reminder emails --
  -- see db/migrations/004_add_reminder_unsubscribe_token.sql for why this
  -- exists as its own column rather than deriving it from something else.
  reminder_unsubscribe_token uuid not null default gen_random_uuid(),
  -- Notification Settings modal (account.html) -- see
  -- db/migrations/011_add_notification_preferences.sql. push_subscription
  -- holds the browser's PushSubscription (via .toJSON()) once a real
  -- send-side Edge Function exists to deliver to it, or a { pending: true }
  -- placeholder recorded before that backend is deployed.
  in_app_notifications_enabled boolean not null default true,
  push_enabled boolean not null default false,
  push_subscription jsonb,
  -- "Model Assumptions & Sensitivity" panel (trips.html, House Money) --
  -- see db/migrations/018_add_house_money_model_settings.sql. Defaults
  -- match the flat constants the House Money projection used to hardcode.
  point_value_baseline numeric(6,2) not null default 26,
  dues_growth_rate numeric(5,4) not null default 0.04,
  value_growth_rate numeric(5,4) not null default 0.05,
  opportunity_cost_rate numeric(5,4) not null default 0.00,
  -- Opt-in use-year expiration and Holding reminder emails, separate from
  -- the banking reminder above -- see db/migrations/026.
  expiration_reminder_opt_in boolean not null default false,
  expiration_reminder_lead_days int not null default 45 check (expiration_reminder_lead_days between 1 and 240),
  holding_reminder_opt_in boolean not null default false,
  holding_reminder_lead_days int not null default 60 check (holding_reminder_lead_days between 1 and 240),
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_reminder_unsubscribe_token_idx on profiles(reminder_unsubscribe_token);

alter table profiles enable row level security;

create policy "profiles: select own" on profiles
  for select using (auth.uid() = id);
create policy "profiles: update own" on profiles
  for update using (auth.uid() = id);
-- No insert/delete policy for users -- profiles are created by the trigger
-- below (as the postgres role) and deleted via cascade from auth.users.

-- Auto-create a profile row the moment someone signs in for the first time.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------
-- contracts: a user can own several.
-- ---------------------------------------------------------------------
create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  home_resort_id text not null,
  use_year text not null check (use_year in ('Feb','Mar','Apr','Jun','Aug','Sep','Oct','Dec')),
  points_per_year integer not null check (points_per_year > 0),
  purchase_type text not null check (purchase_type in ('direct','resale')),
  purchase_price numeric(10,2),
  purchase_date date,
  -- Manual override for the auto-detected Blue Card status (Card Studio
  -- Step 3) -- see db/migrations/013_add_contract_blue_card_override.sql.
  -- Tri-state: null = auto-detect (the default), true/false force the
  -- result when the owner knows the automatic year-only determination is
  -- wrong (see purchase_date's own comment above).
  blue_card_override boolean,
  nickname text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contracts_user_id_idx on contracts(user_id);
create index if not exists contracts_user_active_idx on contracts(user_id, is_active);

alter table contracts enable row level security;

create policy "contracts: full access to own rows" on contracts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contracts_set_updated_at on contracts;
create trigger contracts_set_updated_at
  before update on contracts
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- contract_year_points: a contract's manually-maintained points balance,
-- one row per use-year cycle (use_year_label is the calendar year that
-- cycle's points DEPOSIT in -- DVC's own labeling convention, confirmed
-- against an official planDisney Q&A and community sources 2026-09-11).
-- A separate row per year (rather than 3 flat columns on `contracts`,
-- migration 006's now-superseded approach) lets an owner track/plan more
-- than just the currently-active cycle -- e.g. banking they intend to do
-- into next year, ahead of actually doing it.
-- ---------------------------------------------------------------------
create table if not exists contract_year_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  contract_id uuid not null references contracts(id) on delete cascade,
  use_year_label integer not null check (use_year_label between 2000 and 2100),
  points_remaining integer not null default 0 check (points_remaining >= 0),
  points_banked integer not null default 0 check (points_banked >= 0),
  points_borrowed integer not null default 0 check (points_borrowed >= 0),
  -- Points parked in DVC's real "Holding account": created when a confirmed
  -- reservation is modified/canceled 1-30 days before check-in. They can't
  -- be banked or borrowed further. They expire at use-year end; DVC Resort
  -- reservations must be made within 60 days of check-in. See
  -- db/migrations/015_add_holding_points.sql and dvc-ledger.js.
  points_holding integer not null default 0 check (points_holding >= 0),
  -- The date this row's points_holding balance entered holding (defaults to
  -- "today" in the UI when the owner first types a number in, editable for
  -- backdating) -- the 60-day rebook deadline is computed from this, not
  -- stored. Null means "unknown" (a pre-existing row, or points_holding is
  -- 0) -- see db/migrations/016_add_holding_entered_date.sql. One date per
  -- row (not one per cancellation) by design -- see that migration's
  -- comment for why.
  points_holding_entered_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contract_id, use_year_label)
);

create index if not exists contract_year_points_contract_idx on contract_year_points(contract_id);

alter table contract_year_points enable row level security;

create policy "contract_year_points: full access to own rows" on contract_year_points
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists contract_year_points_set_updated_at on contract_year_points;
create trigger contract_year_points_set_updated_at
  before update on contract_year_points
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- trips: logged trip history. contract_id is deliberately nullable --
-- DVC doesn't require attributing a booking to one specific contract's
-- points, so logging shouldn't force that attribution either.
-- ---------------------------------------------------------------------
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  contract_id uuid references contracts(id) on delete set null,
  resort_id text not null,
  room_type_id text not null,
  check_in date not null,
  check_out date not null,
  points_used integer not null check (points_used >= 0),
  -- User's own known/estimated cash value for this trip, if they'd rather
  -- enter it than trust the app's estimate. Null means "use our estimate",
  -- which is computed client-side on read (remapping the trip's dates onto
  -- the current data.js year and running the normal cash-rate lookup) --
  -- never stored, so it can't go stale as cash-rate data updates.
  custom_cash_value numeric(10,2),
  notes text,
  -- Optional point-source attribution ("+ Break down point sources" in the
  -- Log a Trip modal) -- see db/migrations/012_add_trip_points_source_breakdown.sql.
  -- Null means not broken down; points_used stays the source of truth for
  -- every calculation regardless.
  points_source_breakdown jsonb,
  -- Owner-entered Disney confirmation details (migration 027); entering them
  -- never marks a booking verified.
  disney_confirmation_number text check (char_length(disney_confirmation_number) <= 40),
  disney_checked_on date,
  created_at timestamptz not null default now(),
  constraint trips_checkout_after_checkin check (check_out > check_in)
);

create index if not exists trips_user_id_idx on trips(user_id);
create index if not exists trips_contract_id_idx on trips(contract_id);

alter table trips enable row level security;

create policy "trips: full access to own rows" on trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- itineraries: saved (future) stay plans a user can reload into the
-- calendar. segments is a jsonb array of {resort_id, room_type_id,
-- check_in, check_out} -- a single-element array is a normal stay, more
-- than one is a split stay across resorts. Kept as one jsonb column
-- rather than a child table since an itinerary is only ever read/written
-- as a whole unit (load it, or don't) -- there's no use case for
-- querying into individual segments server-side.
-- ---------------------------------------------------------------------
create table if not exists itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  year integer not null,
  segments jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists itineraries_user_id_idx on itineraries(user_id);

alter table itineraries enable row level security;

create policy "itineraries: full access to own rows" on itineraries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- user_badges: persisted Trophy Case badge progress (trips.html). Two
-- reasons this exists rather than purely recomputing from live data:
--  - "Sticky" badges are meant to be permanent once earned -- `tier` here
--    is a high-water mark the client only ever upserts UPWARD, never down.
--  - `event_count` is a plain running counter for click/action-based
--    badges (e.g. "clicked the Disney Food Blog link N times") that have
--    no other durable record anywhere in the schema.
-- "Live" badges (current-standing metrics like House Money's payback %)
-- are never written here -- they stay purely computed client-side so they
-- can't drift from other live numbers shown on the same page.
-- ---------------------------------------------------------------------
create table if not exists user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  badge_id text not null,
  tier integer not null default 0 check (tier >= 0),
  event_count integer not null default 0 check (event_count >= 0),
  unlocked_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create index if not exists user_badges_user_id_idx on user_badges(user_id);

alter table user_badges enable row level security;

create policy "user_badges: full access to own rows" on user_badges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists user_badges_set_updated_at on user_badges;
create trigger user_badges_set_updated_at
  before update on user_badges
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- increment_badge_event(): atomically bumps a click/action-driven
-- badge's event_count (Resourceful Explorer, Just One More Night, The
-- Re-Checker, Split-Stay Scientist, 11-Month Sniper, Night Owl -- see dvc-badges.js's
-- evaluateEventBadges()). security invoker, not definer -- it only ever
-- touches the calling user's own row, which RLS above already permits.
-- ---------------------------------------------------------------------
create or replace function public.increment_badge_event(p_badge_id text)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into user_badges (user_id, badge_id, event_count)
  values (auth.uid(), p_badge_id, 1)
  on conflict (user_id, badge_id)
  do update set event_count = user_badges.event_count + 1, updated_at = now();
end;
$$;

grant execute on function public.increment_badge_event(text) to authenticated;

-- ---------------------------------------------------------------------
-- badge_rarity_stats(): powers the Trophy Case's "X% of members have
-- this" rarity stat with a real number. RLS on user_badges normally
-- restricts every user to their own rows, so this SECURITY DEFINER
-- function is the narrow, safe exception -- it only ever returns
-- aggregate COUNTS per badge_id, never any individual user's row.
-- ---------------------------------------------------------------------
create or replace function public.badge_rarity_stats()
returns table(badge_id text, unlocked_count bigint, total_members bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    ub.badge_id,
    count(distinct ub.user_id) as unlocked_count,
    (select count(*) from profiles) as total_members
  from user_badges ub
  where ub.tier > 0
  group by ub.badge_id;
$$;

revoke all on function public.badge_rarity_stats() from public;
grant execute on function public.badge_rarity_stats() to authenticated;

-- ---------------------------------------------------------------------
-- reminder_log: double-send guard for banking/borrowing deadline emails.
-- Written only by the service-role Edge Function (Phase 5) -- users get
-- read-only visibility into their own send history.
-- ---------------------------------------------------------------------
create table if not exists reminder_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  contract_id uuid not null references contracts(id) on delete cascade,
  deadline_date date not null,
  reminder_type text not null default 'banking_borrowing_deadline',
  sent_at timestamptz not null default now(),
  unique (contract_id, deadline_date, reminder_type)
);

alter table reminder_log enable row level security;

create policy "reminder_log: select own" on reminder_log
  for select using (auth.uid() = user_id);
-- No insert/update/delete policy for regular users -- only the
-- service-role key (used by the scheduled Edge Function) can write here,
-- which bypasses RLS entirely by design.

-- ---------------------------------------------------------------------
-- reminder_run_log: one row per send-banking-reminders invocation
-- (success OR failure) -- a heartbeat + error summary, distinct from
-- reminder_log above (which only gets a row when an email actually
-- sends, so it can't tell "nothing was due" apart from "the cron job
-- silently stopped firing"). scripts/nightly_watchdog.py reads this via
-- the public anon key already embedded in auth.js to report
-- banking-reminder pipeline health in the nightly digest -- see
-- docs/nightly_pipeline_plan.md. Public-readable by design: only ever
-- holds aggregate counts and error strings keyed by profile/contract id,
-- never email addresses.
-- ---------------------------------------------------------------------
create table if not exists reminder_run_log (
  id uuid primary key default gen_random_uuid(),
  run_at timestamptz not null default now(),
  sent integer not null default 0,
  skipped integer not null default 0,
  error_count integer not null default 0,
  errors jsonb not null default '[]'::jsonb
);

create index if not exists reminder_run_log_run_at_idx on reminder_run_log (run_at desc);

alter table reminder_run_log enable row level security;

create policy "reminder_run_log: public read" on reminder_run_log
  for select using (true);
-- No insert/update/delete policy -- only the service-role key (used by
-- the scheduled Edge Function) can write here, same trust model as
-- reminder_log.

-- ---------------------------------------------------------------------
-- subscriptions: one row per user, written only by the stripe-webhook
-- Edge Function (service role) -- see docs/subscriptions_plan.md. Users
-- get read-only visibility into their own membership status, same trust
-- model as reminder_log. `unique (user_id)` (rather than just an index)
-- lets the checkout/webhook functions `upsert(..., { onConflict:
-- "user_id" })` instead of needing a separate select-then-insert-or-
-- update -- there's only ever one membership per user regardless of how
-- many times they've subscribed/canceled/resubscribed.
-- ---------------------------------------------------------------------
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  status text not null default 'incomplete', -- Stripe's own status strings: incomplete/trialing/active/past_due/canceled/unpaid/...
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create unique index if not exists subscriptions_stripe_customer_id_idx on subscriptions(stripe_customer_id);
create unique index if not exists subscriptions_stripe_subscription_id_idx on subscriptions(stripe_subscription_id) where stripe_subscription_id is not null;

alter table subscriptions enable row level security;

create policy "subscriptions: select own" on subscriptions
  for select using (auth.uid() = user_id);
-- No insert/update/delete policy for regular users -- only the
-- service-role key (used by the Checkout/webhook Edge Functions) can
-- write here, which bypasses RLS entirely by design.

-- ---------------------------------------------------------------------
-- Self-service account deletion. The `authenticated` role can't DELETE
-- from auth.users directly, so this SECURITY DEFINER function does it on
-- the caller's own behalf (auth.uid() only -- never a passed-in id).
-- Cascades through every table above via their `on delete cascade` FKs.
-- ---------------------------------------------------------------------
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


-- Confirmed trip funding is attribution, not a point-ledger transaction.
-- Legacy records remain readable and require confirmation in the app.
create or replace function public.validate_trip_funding()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  funding jsonb := new.points_source_breakdown;
  allocation jsonb;
  source_key text;
  source_points numeric;
  assigned numeric := 0;
  contract_ids uuid[] := array[]::uuid[];
  source_contract uuid;
begin
  if coalesce(funding->>'version', '') <> '2' then
    if TG_OP = 'UPDATE' then
      if old.points_source_breakdown->>'version' = '2' then
        raise exception 'Confirmed trip point sources cannot be removed. Review and save all sources.';
      end if;
    end if;
    return new;
  end if;
  if jsonb_typeof(funding->'version') is distinct from 'number'
     or jsonb_typeof(funding->'allocations') is distinct from 'array'
     or new.points_used is null or new.points_used <= 0 then
    raise exception 'Enter valid trip point sources and positive points used.';
  end if;
  for allocation in select value from jsonb_array_elements(funding->'allocations') loop
    if jsonb_typeof(allocation->'points') is distinct from 'number' then
      raise exception 'Contract points must be positive whole numbers.';
    end if;
    source_points := (allocation->>'points')::numeric;
    if source_points <= 0 or source_points <> trunc(source_points) then
      raise exception 'Contract points must be positive whole numbers.';
    end if;
    source_contract := (allocation->>'contract_id')::uuid;
    if source_contract is null or not exists (
      select 1 from public.contracts where id = source_contract and user_id = new.user_id
    ) then
      raise exception 'Each point allocation must belong to one of your contracts.';
    end if;
    if source_contract = any(contract_ids) then
      raise exception 'Each contract can appear only once.';
    end if;
    contract_ids := array_append(contract_ids, source_contract);
    assigned := assigned + source_points;
  end loop;
  foreach source_key in array array['one_time', 'transferred', 'other'] loop
    if jsonb_typeof(funding->source_key) is distinct from 'number' then
      raise exception 'Outside points must be zero or positive whole numbers.';
    end if;
    source_points := (funding->>source_key)::numeric;
    if source_points < 0 or source_points <> trunc(source_points) then
      raise exception 'Outside points must be zero or positive whole numbers.';
    end if;
    assigned := assigned + source_points;
  end loop;
  if assigned <> new.points_used then
    raise exception 'Point sources must total the points used for this trip.';
  end if;
  new.contract_id := case when cardinality(contract_ids) = 1 then contract_ids[1] else null end;
  return new;
end;
$$;

drop trigger if exists validate_trip_funding on public.trips;
create trigger validate_trip_funding
before insert or update of points_source_breakdown, points_used, user_id on public.trips
for each row execute function public.validate_trip_funding();


-- Preserve existing saved balances. New rows remain unknown until the owner
-- supplies a balance; this timestamp records entry, not a Disney verification.
-- Backfill runs only when the column is first introduced, making reruns safe.
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='contract_year_points' and column_name='balance_confirmed_at') then
    alter table public.contract_year_points add column balance_confirmed_at timestamptz;
    update public.contract_year_points set balance_confirmed_at = coalesce(updated_at, now());
  end if;
end;
$$;
comment on column public.contract_year_points.balance_confirmed_at is
  'When the owner supplied the available balance for this use year. Null means not added; it is not zero or the annual allotment.';


-- Requires 020. One transaction updates both years and records a retry key.
create table if not exists public.point_movements (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  kind text not null check (kind in ('bank','borrow')),
  from_year integer not null,
  to_year integer not null,
  points integer not null check (points > 0),
  result jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.point_movements enable row level security;
drop policy if exists "Read own point movements" on public.point_movements;
create policy "Read own point movements" on public.point_movements for select to authenticated using (user_id = auth.uid());
grant select on public.point_movements to authenticated;

create or replace function public.record_point_movement(
  p_id uuid, p_contract uuid, p_kind text, p_year integer, p_points integer,
  p_expected_from jsonb, p_expected_to jsonb
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  owner_id uuid := auth.uid();
  from_year integer;
  to_year integer;
  source public.contract_year_points%rowtype;
  destination public.contract_year_points%rowtype;
  previous public.point_movements%rowtype;
  result jsonb;
begin
  if owner_id is null then raise exception 'Sign in to record points.'; end if;
  if p_id is null or p_kind not in ('bank','borrow') or p_kind is null or p_points is null or p_points <= 0 or p_year is null or p_year not between 1900 and 9998 then
    raise exception 'Invalid point movement.';
  end if;
  -- Serialize retries before checking the durable receipt.
  perform pg_advisory_xact_lock(hashtextextended(p_id::text, 0));
  select * into previous from public.point_movements where id = p_id;
  if found then
    if previous.user_id <> owner_id or previous.contract_id <> p_contract or previous.kind <> p_kind or previous.points <> p_points or least(previous.from_year, previous.to_year) <> p_year then
      raise exception 'This save reference belongs to a different movement.';
    end if;
    return previous.result;
  end if;
  if not exists (select 1 from public.contracts where id = p_contract and user_id = owner_id) then
    raise exception 'Contract not found.';
  end if;
  from_year := case when p_kind = 'bank' then p_year else p_year + 1 end;
  to_year := case when p_kind = 'bank' then p_year + 1 else p_year end;
  -- Lock in year order, including against ordinary balance corrections.
  perform 1 from public.contract_year_points where contract_id = p_contract and user_id = owner_id and use_year_label in (from_year,to_year) order by use_year_label for update;
  select * into source from public.contract_year_points where contract_id = p_contract and user_id = owner_id and use_year_label = from_year;
  select * into destination from public.contract_year_points where contract_id = p_contract and user_id = owner_id and use_year_label = to_year;
  if source.balance_confirmed_at is null or destination.balance_confirmed_at is null then
    raise exception 'Add both year balances before recording a move.';
  end if;
  if (to_jsonb(source) -> 'updated_at') is distinct from (p_expected_from -> 'updated_at') or
     (to_jsonb(destination) -> 'updated_at') is distinct from (p_expected_to -> 'updated_at') or
     jsonb_build_array(source.points_remaining,source.points_banked,source.points_borrowed,source.points_holding,source.balance_confirmed_at) is distinct from
     jsonb_build_array(p_expected_from->'points_remaining',p_expected_from->'points_banked',p_expected_from->'points_borrowed',p_expected_from->'points_holding',p_expected_from->'balance_confirmed_at') or
     jsonb_build_array(destination.points_remaining,destination.points_banked,destination.points_borrowed,destination.points_holding,destination.balance_confirmed_at) is distinct from
     jsonb_build_array(p_expected_to->'points_remaining',p_expected_to->'points_banked',p_expected_to->'points_borrowed',p_expected_to->'points_holding',p_expected_to->'balance_confirmed_at') then
    raise exception 'Balances changed. Close this sheet and review the latest balances before trying again.';
  end if;
  if source.points_remaining < p_points then raise exception 'Not enough current points in the source year.'; end if;
  update public.contract_year_points set points_remaining = points_remaining - p_points, balance_confirmed_at = now() where id = source.id returning * into source;
  update public.contract_year_points set
    points_banked = points_banked + case when p_kind = 'bank' then p_points else 0 end,
    points_borrowed = points_borrowed + case when p_kind = 'borrow' then p_points else 0 end,
    balance_confirmed_at = now()
    where id = destination.id returning * into destination;
  result := jsonb_build_object('from',to_jsonb(source),'to',to_jsonb(destination));
  insert into public.point_movements(id,user_id,contract_id,kind,from_year,to_year,points,result)
    values(p_id,owner_id,p_contract,p_kind,from_year,to_year,p_points,result);
  return result;
end;
$$;
revoke all on function public.record_point_movement(uuid,uuid,text,integer,integer,jsonb,jsonb) from public;
grant execute on function public.record_point_movement(uuid,uuid,text,integer,integer,jsonb,jsonb) to authenticated;


-- Planning context only; this does not book a stay or allocate/deduct points.
alter table public.itineraries add column if not exists booking_contract_id uuid
  references public.contracts(id) on delete set null;

create or replace function public.validate_itinerary_booking_contract()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if new.booking_contract_id is not null and not exists (
    select 1 from public.contracts where id = new.booking_contract_id and user_id = new.user_id
  ) then
    raise exception 'Choose one of your own contracts for Booking As.';
  end if;
  return new;
end;
$$;
drop trigger if exists itinerary_booking_contract_owner on public.itineraries;
create trigger itinerary_booking_contract_owner before insert or update on public.itineraries
for each row execute function public.validate_itinerary_booking_contract();

-- ---- Booking saves + deduction receipts (migration 024) ----

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

-- save_trip_booking / delete_trip_booking: current definitions are in the
-- migration 027 section at the end of this file.

-- ---- Owner reconciliation with Disney (migration 025) ----
-- When the owner last compared this row with Disney. Separate from
-- balance_confirmed_at (when a balance was entered at all): existing rows
-- start null and read "Not checked against Disney yet" -- nothing inherits
-- an unproven verification.
alter table public.contract_year_points
  add column if not exists last_checked_against_disney_at timestamptz;

-- Immutable reconciliation events. Written only by reconcile_points().
create table if not exists public.point_reconciliations (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  use_year_label integer not null,
  matched boolean not null,
  reason text check (reason in ('booking', 'banking', 'borrowing', 'transfer', 'cancellation', 'other')),
  notes text check (char_length(notes) <= 500),
  before jsonb,           -- the recorded buckets the owner compared (null: no balance recorded)
  after jsonb not null,   -- the Disney amounts the owner entered
  created_at timestamptz not null default now(),
  constraint point_reconciliations_reason_when_changed check (matched or reason is not null)
);
create index if not exists point_reconciliations_contract_idx on public.point_reconciliations(contract_id, use_year_label);
alter table public.point_reconciliations enable row level security;
drop policy if exists "Read own point reconciliations" on public.point_reconciliations;
create policy "Read own point reconciliations" on public.point_reconciliations for select to authenticated using (user_id = auth.uid());
grant select on public.point_reconciliations to authenticated;
-- No insert/update/delete grants: events are immutable and written by the function below.

-- p_id        client-generated retry key (a repeated Save returns the first result)
-- p_expected  the row as the sheet read it ({updated_at, points_*, balance_confirmed_at}),
--             or null when no balance row existed. Any difference means a booking
--             deduction, point move or other edit landed since: nothing is written.
-- p_after     {points_remaining, points_banked, points_borrowed, points_holding}
--             as the owner reads them on Disney's site
-- p_reason    required unless p_after equals the recorded buckets
create or replace function public.reconcile_points(
  p_id uuid, p_contract uuid, p_year integer, p_expected jsonb, p_after jsonb, p_reason text, p_notes text
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  owner_id uuid := auth.uid();
  previous public.point_reconciliations%rowtype;
  current_row public.contract_year_points%rowtype;
  saved public.contract_year_points%rowtype;
  had_row boolean;
  a_remaining integer; a_banked integer; a_borrowed integer; a_holding integer;
  before_json jsonb;
  is_match boolean;
  today date := (now() at time zone 'America/New_York')::date;
begin
  if owner_id is null then raise exception 'Sign in to reconcile points.'; end if;
  if p_id is null or p_contract is null or p_year is null or p_year not between 2000 and 2100 or p_after is null then
    raise exception 'Invalid reconciliation.';
  end if;
  begin
    a_remaining := (p_after->>'points_remaining')::integer;
    a_banked := (p_after->>'points_banked')::integer;
    a_borrowed := (p_after->>'points_borrowed')::integer;
    a_holding := (p_after->>'points_holding')::integer;
  exception when others then
    raise exception 'Enter whole numbers of points.';
  end;
  if a_remaining is null or a_banked is null or a_borrowed is null or a_holding is null
     or least(a_remaining, a_banked, a_borrowed, a_holding) < 0 then
    raise exception 'Enter whole numbers of points, zero or more.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_id::text, 0));
  select * into previous from public.point_reconciliations where id = p_id;
  if found then
    if previous.user_id <> owner_id or previous.contract_id <> p_contract or previous.use_year_label <> p_year then
      raise exception 'This save reference belongs to a different reconciliation.';
    end if;
    select * into saved from public.contract_year_points where contract_id = p_contract and use_year_label = p_year;
    return jsonb_build_object('row', to_jsonb(saved), 'event', to_jsonb(previous), 'retried', true);
  end if;

  if not exists (select 1 from public.contracts where id = p_contract and user_id = owner_id) then
    raise exception 'Contract not found.';
  end if;

  select * into current_row from public.contract_year_points
    where contract_id = p_contract and user_id = owner_id and use_year_label = p_year for update;
  had_row := found;
  if (had_row and p_expected is null) or (not had_row and p_expected is not null) or (had_row and (
       (to_jsonb(current_row) -> 'updated_at') is distinct from (p_expected -> 'updated_at') or
       jsonb_build_array(current_row.points_remaining, current_row.points_banked, current_row.points_borrowed, current_row.points_holding, current_row.balance_confirmed_at)
         is distinct from
       jsonb_build_array(p_expected->'points_remaining', p_expected->'points_banked', p_expected->'points_borrowed', p_expected->'points_holding', p_expected->'balance_confirmed_at'))) then
    raise exception 'Balances changed. Review the latest balance before saving.';
  end if;

  before_json := case when had_row and current_row.balance_confirmed_at is not null then jsonb_build_object(
    'points_remaining', current_row.points_remaining, 'points_banked', current_row.points_banked,
    'points_borrowed', current_row.points_borrowed, 'points_holding', current_row.points_holding) end;
  is_match := before_json is not null and before_json = jsonb_build_object(
    'points_remaining', a_remaining, 'points_banked', a_banked, 'points_borrowed', a_borrowed, 'points_holding', a_holding);
  if not is_match and (p_reason is null or p_reason not in ('booking', 'banking', 'borrowing', 'transfer', 'cancellation', 'other')) then
    raise exception 'Choose why the balance changed.';
  end if;

  if had_row then
    update public.contract_year_points set
      points_remaining = a_remaining, points_banked = a_banked, points_borrowed = a_borrowed, points_holding = a_holding,
      points_holding_entered_at = case when a_holding > 0 then coalesce(points_holding_entered_at, today) else null end,
      balance_confirmed_at = case when is_match then balance_confirmed_at else now() end,
      last_checked_against_disney_at = now()
      where id = current_row.id returning * into saved;
  else
    insert into public.contract_year_points(user_id, contract_id, use_year_label, points_remaining, points_banked, points_borrowed, points_holding,
      points_holding_entered_at, balance_confirmed_at, last_checked_against_disney_at)
    values (owner_id, p_contract, p_year, a_remaining, a_banked, a_borrowed, a_holding,
      case when a_holding > 0 then today end, now(), now())
    returning * into saved;
  end if;

  insert into public.point_reconciliations(id, user_id, contract_id, use_year_label, matched, reason, notes, before, after)
  values (p_id, owner_id, p_contract, p_year, is_match, case when is_match then null else p_reason end,
    nullif(left(coalesce(p_notes, ''), 500), ''), before_json,
    jsonb_build_object('points_remaining', a_remaining, 'points_banked', a_banked, 'points_borrowed', a_borrowed, 'points_holding', a_holding))
  returning * into previous;

  return jsonb_build_object('row', to_jsonb(saved), 'event', to_jsonb(previous), 'retried', false);
end;
$$;
revoke all on function public.reconcile_points(uuid,uuid,integer,jsonb,jsonb,text,text) from public;
grant execute on function public.reconcile_points(uuid,uuid,integer,jsonb,jsonb,text,text) to authenticated;

-- Activity view reads: trip_deductions (024) include reversed receipts so the
-- timeline can show both the deduction and its reversal.

-- ---- Waitlists, cancellation history, booking saves (migration 027) ----
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

-- ---- Owner-entered actual ownership costs (migration 028) ----
create table if not exists public.ownership_costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  kind text not null check (kind in ('dues', 'closing', 'interest')),
  year integer,
  amount numeric(12,2) not null check (amount >= 0 and amount <= 10000000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ownership_costs_year_by_kind check (
    (kind = 'closing' and year is null) or (kind <> 'closing' and year between 1980 and 2100))
);
create unique index if not exists ownership_costs_one_per_year
  on public.ownership_costs(contract_id, kind, coalesce(year, 0));
alter table public.ownership_costs enable row level security;
drop policy if exists "Read own ownership costs" on public.ownership_costs;
create policy "Read own ownership costs" on public.ownership_costs for select to authenticated using (user_id = auth.uid());
grant select on public.ownership_costs to authenticated;
-- No insert/update/delete grants: writes go through save_ownership_costs().

-- Apply one contract's changed actuals in one transaction.
--   p_entries: [{kind, year, amount}] -- amount null removes that actual
--   (back to the estimate); 0 is kept as an actual zero.
-- Setting a value is idempotent, so a retry after a lost response lands on
-- the same figures. Any invalid entry rejects the whole save.
create or replace function public.save_ownership_costs(p_contract uuid, p_entries jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  owner_id uuid := auth.uid();
  e jsonb;
  k text;
  y integer;
  amt numeric;
begin
  if owner_id is null then raise exception 'Sign in to save costs.'; end if;
  if not exists (select 1 from public.contracts where id = p_contract and user_id = owner_id) then
    raise exception 'Contract not found.';
  end if;
  if jsonb_typeof(p_entries) <> 'array' then raise exception 'Invalid cost entries.'; end if;
  for e in select value from jsonb_array_elements(p_entries) loop
    k := e->>'kind';
    y := nullif(e->>'year', '')::integer;
    amt := nullif(e->>'amount', '')::numeric;
    if k not in ('dues', 'closing', 'interest') then raise exception 'Invalid cost kind.'; end if;
    if (k = 'closing') <> (y is null) or (y is not null and y not between 1980 and 2100) then raise exception 'Invalid cost year.'; end if;
    if amt is not null and (amt < 0 or amt > 10000000 or amt <> round(amt, 2)) then
      raise exception 'Enter an amount of zero or more, to the cent.';
    end if;
    if amt is null then
      delete from public.ownership_costs where contract_id = p_contract and kind = k and coalesce(year, 0) = coalesce(y, 0);
    else
      insert into public.ownership_costs(user_id, contract_id, kind, year, amount)
      values (owner_id, p_contract, k, y, amt)
      on conflict (contract_id, kind, (coalesce(year, 0))) do update set amount = excluded.amount, updated_at = now();
    end if;
  end loop;
  return coalesce((select jsonb_agg(to_jsonb(c)) from public.ownership_costs c where c.contract_id = p_contract), '[]'::jsonb);
end;
$$;
revoke all on function public.save_ownership_costs(uuid, jsonb) from public;
grant execute on function public.save_ownership_costs(uuid, jsonb) to authenticated;
