-- Run this once in the Supabase SQL editor against the existing
-- dvcalc_start project -- db/schema.sql already includes this column for
-- any future fresh install, this file is only for catching up a database
-- that ran schema.sql before it existed (2026-09-19).
--
-- Without a date, points_holding (migration 015) is just a number with no
-- way to compute the real 60-day rebook deadline DVC enforces on it -- this
-- closes that gap.
--
-- One date per row, not one per cancellation: an owner could in theory have
-- two overlapping holding lots (two separate cancellations with two
-- different deadlines), but that's modeled here as a single running total
-- with a single entered-date, same flat-number style as points_banked/
-- points_borrowed already use rather than itemized per-transaction rows.
-- The UI guidance for the rare overlapping case is to enter the EARLIER of
-- the two dates, so the deadline shown is always the more urgent one.
alter table contract_year_points
  add column if not exists points_holding_entered_at date;

comment on column contract_year_points.points_holding_entered_at is
  'Date this row''s points_holding balance entered DVC''s Holding account. Null = unknown/not set. The 60-day rebook deadline is computed from this, not stored.';
