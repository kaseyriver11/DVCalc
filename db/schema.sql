-- DVCalc accounts/contracts schema (Supabase Postgres)
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
  created_at timestamptz not null default now()
);

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
