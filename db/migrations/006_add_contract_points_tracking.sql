-- Run this once in the Supabase SQL editor against the existing
-- dvcalc_start project -- db/schema.sql already includes these columns for
-- any future fresh install, this file is only for catching up a database
-- that ran schema.sql before they existed (2026-09-11).
--
-- Lets a contract's points balance actually reflect banking/borrowing:
-- points_remaining is the user-maintained "what's left to spend this use
-- year" figure (null means "not customized yet" -- callers fall back to
-- the contract's full points_per_year allotment), points_banked is points
-- carried forward into this year from last year's banking, points_borrowed
-- is points pulled forward from next year. All three are manually
-- maintained by the account owner, same as points_per_year already is --
-- DVCalc has no way to see a member's real-time points ledger.

alter table contracts add column if not exists points_remaining integer check (points_remaining is null or points_remaining >= 0);
alter table contracts add column if not exists points_banked integer not null default 0 check (points_banked >= 0);
alter table contracts add column if not exists points_borrowed integer not null default 0 check (points_borrowed >= 0);

comment on column contracts.points_remaining is
  'User-maintained points left to spend this use year. Null means not customized yet -- treat as points_per_year.';
comment on column contracts.points_banked is
  'Points banked forward from last use year, manually entered by the owner.';
comment on column contracts.points_borrowed is
  'Points borrowed forward from next use year, manually entered by the owner.';
