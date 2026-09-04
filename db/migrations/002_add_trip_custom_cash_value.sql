-- Run this once in the Supabase SQL editor against the existing
-- dvcalc_start project -- db/schema.sql already includes this column for
-- any future fresh install, this file is only for catching up a database
-- that ran schema.sql before this column existed (2026-09-04).

alter table trips add column if not exists custom_cash_value numeric(10,2);

comment on column trips.custom_cash_value is
  'User-entered override for this trip''s cash value. Null means the app should use its own estimate instead (computed client-side, never stored).';
