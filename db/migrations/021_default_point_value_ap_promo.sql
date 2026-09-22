-- Run this once in the Supabase SQL editor against the existing
-- dvcalc_start project -- db/schema.sql carries the new default for any
-- future fresh install, this file is only for catching up a database that
-- ran migration 018 (2026-09-20).
--
-- House Money's "Vacation Value Baseline" defaults to $26/pt (a discounted
-- AP/promo cash rate) instead of $35/pt (Disney's full rack rate).
-- Crediting every trip at undiscounted rack overstates what most owners
-- would really have paid in cash, which inflates the Value Extracted line
-- and makes ownership look like it paid off sooner than it did.
--
-- The UPDATE is the part that makes this visible at all: 018 declared the
-- column NOT NULL DEFAULT 35, so every profile row already stores 35
-- whether or not its owner ever opened the panel -- changing only the
-- column default would leave every existing user on the old value forever.
-- Rows are therefore reset only where the value is still exactly the old
-- default, which is indistinguishable from untouched. The tradeoff, stated
-- plainly: an owner who deliberately chose $35 in the one day between 018
-- shipping (2026-09-21) and this change is reset to $26 along with
-- everyone else. They can set it back on the slider; there is no column
-- recording whether a value was ever deliberately chosen.

alter table profiles
  alter column point_value_baseline set default 26;

update profiles
  set point_value_baseline = 26
  where point_value_baseline = 35;
