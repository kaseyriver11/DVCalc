-- Run this once in the Supabase SQL editor against the existing
-- dvcalc_start project -- db/schema.sql already includes this function
-- for any future fresh install, this file is only for catching up a
-- database that ran schema.sql before it existed (2026-09-17).
--
-- Powers the Trophy Case's "X% of members have this" rarity stat
-- (badges.html) with a REAL number instead of an invented one. Row-level
-- security on user_badges normally restricts every user to their own
-- rows, so a plain client-side query can't compute a cross-user
-- percentage -- this SECURITY DEFINER function is the narrow exception:
-- it only ever returns aggregate COUNTS per badge_id, never any
-- individual user's row or identity, so it's safe to grant to every
-- signed-in member.

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
