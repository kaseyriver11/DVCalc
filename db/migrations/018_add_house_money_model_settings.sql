-- Run this once in the Supabase SQL editor against the existing
-- dvcalc_start project -- db/schema.sql already includes these columns
-- for any future fresh install, this file is only for catching up a
-- database that ran schema.sql before they existed (2026-09-20).
--
-- "Model Assumptions & Sensitivity" panel (trips.html, House Money) --
-- lets an owner override the flat STANDARD_DELUXE_VALUE_PER_POINT/
-- STANDARD_VALUE_GROWTH/STANDARD_DUES_GROWTH constants the House Money
-- projection used to hardcode, plus a new opportunity-cost-of-capital rate
-- for the "alternative vacation fund" simulation. Persisted per-user (not
-- per-device localStorage) so the same assumptions follow a signed-in
-- owner across browsers, same as every other profile-scoped preference.
-- Defaults match the values those retired constants held.

alter table profiles
  add column if not exists point_value_baseline numeric(6,2) not null default 35,
  add column if not exists dues_growth_rate numeric(5,4) not null default 0.04,
  add column if not exists value_growth_rate numeric(5,4) not null default 0.05,
  add column if not exists opportunity_cost_rate numeric(5,4) not null default 0.00;
