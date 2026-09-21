-- Run this once in the Supabase SQL editor against the existing
-- dvcalc_start project -- db/schema.sql already includes this table for
-- any future fresh install, this file is only for catching up a database
-- that ran schema.sql before this table existed (2026-09-17).
--
-- Persists Trophy Case badge progress (trips.html) server-side instead of
-- purely recomputing from live data on every load. Two reasons this
-- exists rather than just trusting the live computation:
--  - "Sticky" badges (see STICKY_BADGE_IDS in trips.html) are meant to be
--    permanent once earned, the way a real achievement works -- e.g.
--    deleting a logged trip shouldn't take back a "Point Architect"
--    tier already reached. `tier` here is a high-water mark: the client
--    only ever upserts it upward, never down.
--  - `event_count` is a plain running counter for future click/action-
--    based badges (e.g. "clicked the Disney Food Blog link N times")
--    that have no other durable record anywhere in the schema.
-- "Live" badges (House Money, Points Steward -- anything meant to track
-- current standing rather than history) are never written here at all;
-- they stay purely computed client-side so they can't drift from other
-- live numbers shown on the same page (like the House Money gauge).

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

drop policy if exists "user_badges: full access to own rows" on user_badges;
create policy "user_badges: full access to own rows" on user_badges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists user_badges_set_updated_at on user_badges;
create trigger user_badges_set_updated_at
  before update on user_badges
  for each row execute function set_updated_at();
