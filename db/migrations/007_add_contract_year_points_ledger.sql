-- Run this once in the Supabase SQL editor against the existing
-- dvcalc_start project -- db/schema.sql already includes this table (and
-- no longer includes the columns being dropped below) for any future
-- fresh install.
--
-- Supersedes migration 006: a contract's points balance moves from 3 flat
-- columns on `contracts` (a single snapshot) to one row per use-year cycle
-- here, so an owner can track/plan more than just the currently-active
-- cycle -- e.g. banking they intend to do into next year, ahead of
-- actually doing it. use_year_label is the calendar year a cycle's points
-- DEPOSIT in (DVC's own labeling convention, confirmed against an official
-- planDisney Q&A and community sources 2026-09-11) -- for a Dec use year,
-- that's the year printed on the "Dec 1" deposit, not the Nov 30 it later
-- expires in.

create table if not exists contract_year_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  contract_id uuid not null references contracts(id) on delete cascade,
  use_year_label integer not null check (use_year_label between 2000 and 2100),
  points_remaining integer not null default 0 check (points_remaining >= 0),
  points_banked integer not null default 0 check (points_banked >= 0),
  points_borrowed integer not null default 0 check (points_borrowed >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contract_id, use_year_label)
);

create index if not exists contract_year_points_contract_idx on contract_year_points(contract_id);

alter table contract_year_points enable row level security;

drop policy if exists "contract_year_points: full access to own rows" on contract_year_points;
create policy "contract_year_points: full access to own rows" on contract_year_points
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists contract_year_points_set_updated_at on contract_year_points;
create trigger contract_year_points_set_updated_at
  before update on contract_year_points
  for each row execute function set_updated_at();

-- One-time backfill: carry each contract's existing flat balance (from
-- migration 006, if it was run -- coalesced to defaults if not) forward as
-- its current use-year's row, so nobody's already-entered numbers get lost
-- in the move to the ledger table. Mirrors account.html's currentUYYear().
insert into contract_year_points (user_id, contract_id, use_year_label, points_remaining, points_banked, points_borrowed)
select
  c.user_id,
  c.id,
  case
    when extract(month from (now() at time zone 'America/New_York'))::int >= start_month.m
      then extract(year from (now() at time zone 'America/New_York'))::int
    else extract(year from (now() at time zone 'America/New_York'))::int - 1
  end,
  coalesce(c.points_remaining, c.points_per_year),
  coalesce(c.points_banked, 0),
  coalesce(c.points_borrowed, 0)
from contracts c
cross join lateral (
  select (case c.use_year
    when 'Feb' then 2 when 'Mar' then 3 when 'Apr' then 4 when 'Jun' then 6
    when 'Aug' then 8 when 'Sep' then 9 when 'Oct' then 10 when 'Dec' then 12
  end) as m
) as start_month
where not exists (
  select 1 from contract_year_points cyp where cyp.contract_id = c.id
);

alter table contracts drop column if exists points_remaining;
alter table contracts drop column if exists points_banked;
alter table contracts drop column if exists points_borrowed;
