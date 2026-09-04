-- Run this once in the Supabase SQL editor against the existing
-- dvcalc_start project -- db/schema.sql already includes this table for
-- any future fresh install, this file is only for catching up a database
-- that ran schema.sql before this table existed (2026-09-04).

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
