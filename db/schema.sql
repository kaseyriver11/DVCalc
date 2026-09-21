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
  point_value_baseline numeric(6,2) not null default 35,
  dues_growth_rate numeric(5,4) not null default 0.04,
  value_growth_rate numeric(5,4) not null default 0.05,
  opportunity_cost_rate numeric(5,4) not null default 0.00,
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
  -- be banked or borrowed further and must be rebooked within 60 days of
  -- entering holding (Disney's rule, not a use-year rule) -- see
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
-- Re-Checker, Split-Stay Scientist, Night Owl -- see dvc-badges.js's
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
