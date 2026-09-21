-- Run this once in the Supabase SQL editor against the existing
-- dvcalc_start project -- db/schema.sql already includes this column for
-- any future fresh install, this file is only for catching up a database
-- that ran schema.sql before it existed (2026-09-19).
--
-- Adds the 4th real DVC points bucket -- Holding -- alongside the existing
-- Remaining/Banked/Borrowed columns on contract_year_points. Points enter
-- Holding when a confirmed reservation is modified or canceled 1-30 days
-- before check-in; they can't be banked or borrowed further and must be
-- rebooked within 60 days of entering holding (a Disney rule, independent
-- of the normal use-year banking deadline). See dvc-ledger.js for the pure
-- validation helpers and account.html/app.js for where this is surfaced.
alter table contract_year_points
  add column if not exists points_holding integer not null default 0 check (points_holding >= 0);

comment on column contract_year_points.points_holding is
  'Points parked in DVC''s Holding account (from a near-check-in cancel/modify). Cannot be banked or borrowed; must be rebooked within 60 days of entering holding.';
