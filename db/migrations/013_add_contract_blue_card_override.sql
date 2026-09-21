-- Run this once in the Supabase SQL editor against the existing
-- dvcalc_start project -- db/schema.sql already includes this column
-- for any future fresh install, this file is only for catching up a
-- database that ran schema.sql before it existed (2026-09-17).
--
-- Manual Blue Card override (Card Studio Step 3, account.html) -- the
-- automatic determination (auth.js's evaluateContractPerks()) only knows a
-- contract's acquisition YEAR, not the exact purchase date, so a contract
-- bought in the same calendar year as a Blue Card points-minimum threshold
-- (2016, 2018, 2019, 2020, 2021) can land on the wrong side of it. This
-- lets an owner who knows their real status correct it.
--
-- Tri-state, not a plain boolean: null means "auto-detect" (the default,
-- and what nearly every contract should stay on), true forces eligible,
-- false forces not-eligible.
alter table contracts
  add column if not exists blue_card_override boolean;
