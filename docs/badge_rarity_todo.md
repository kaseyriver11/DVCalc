# To do: badge rarity for event-tracked badges

Status: known gap, deliberately deferred. Added September 22, 2026 during the Trophy Room review pass. **Blocked on having a real member base** — the fix is small, but there's nothing to verify it against until rarity percentages are computed from actual members rather than a handful of test accounts.

## The gap

`badge_rarity_stats()` (`db/migrations/009_add_badge_rarity_stats.sql`, also in `db/schema.sql`) aggregates with:

```sql
from user_badges ub
where ub.tier > 0
```

But `increment_badge_event()` (migration 010) only ever writes `event_count`:

```sql
insert into user_badges (user_id, badge_id, event_count)
values (auth.uid(), p_badge_id, 1)
on conflict (user_id, badge_id)
do update set event_count = user_badges.event_count + 1, updated_at = now();
```

`tier` is never set, so it keeps its column default of `0` (`user_badges.tier integer not null default 0`). Every event-tracked badge is therefore invisible to the rarity aggregate.

Affects all six badges in `dvc-badges.js`'s `evaluateEventBadges()`: Resourceful Explorer, Just One More Night, The Re-Checker, Split-Stay Scientist, 11-Month Sniper, Night Owl. The other ~45 badges are unaffected — they persist a real `tier` via `applyBadgePersistence()`.

## Why this is safe to leave

It fails closed, not wrong. `applyRarityStats()` only attaches `rarityText` when the badge has a row in the fetched map, so an event badge simply renders with no "N% of members have this" line — never a fabricated or misleading number. That matches the stated intent of `badge_rarity_stats()`'s own comment ("a REAL number instead of an invented one"), and of the existing `stat.totalMembers < 5` suppression in `applyRarityStats()`.

So the visible symptom today is an *absent* line on 6 of ~51 badges, not a wrong one.

## Two ways to fix it

Pick one; they are not complementary.

- [ ] **Relax the filter** — `where ub.tier > 0 or ub.event_count > 0`. One-line migration, no write-path change, no backfill. Slight semantic fudge: "unlocked" then means two different things depending on the badge kind.
- [ ] **Have the RPC also set tier** — `increment_badge_event()` sets `tier = 1` on insert (and leaves it alone on conflict, or recomputes it). Keeps `tier > 0` meaning exactly one thing everywhere, but needs a backfill for rows already written by the current RPC, and the tier it writes won't match the badge's real tier ladder (an event badge at count 15 is tier 3, not 1) unless the thresholds move into SQL — which would duplicate `dvc-badges.js` as the source of truth. **Not recommended for that last reason.**

The first option is almost certainly the right one. The second is documented here only so the tradeoff is on record rather than rediscovered.

## When picking this up

1. Confirm the member count is high enough for `applyRarityStats()`'s own `totalMembers < 5` guard to clear, or the fix won't be observable regardless.
2. Write the migration, run it in the Supabase SQL editor against `dvcalc_start`, and mirror the change into `db/schema.sql` so a fresh install matches.
3. Verify on `badges.html` that an event badge now shows a rarity line and that the percentage is plausible against a known member count.
4. Check the percentages aren't absurd for the two badges most likely to be near-universal (Resourceful Explorer fires on any external link click; Night Owl on any late-night action) — if nearly everyone has them, that's correct, not a bug.
