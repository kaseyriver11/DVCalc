-- Run this once in the Supabase SQL editor against the existing
-- dvcalc_start project -- db/schema.sql already includes this function
-- for any future fresh install, this file is only for catching up a
-- database that ran schema.sql before it existed (2026-09-17).
--
-- Atomically bumps a click/action-driven badge's event_count in
-- user_badges (Resourceful Explorer, Just One More Night, The Re-Checker,
-- Split-Stay Scientist, Night Owl -- see dvc-badges.js's
-- evaluateEventBadges()). A plain client-side read-then-upsert would lose
-- counts to a race if the same event fires from two tabs/devices close
-- together; this does the read-modify-write inside Postgres instead.
--
-- security invoker (not definer) -- it only ever inserts/updates the
-- CALLING user's own row (auth.uid()), which user_badges' existing RLS
-- policy already permits, so no elevated privilege is needed here.

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
