-- Run this once in the Supabase SQL editor against the existing
-- dvcalc_start project -- db/schema.sql already includes this column
-- for any future fresh install, this file is only for catching up a
-- database that ran schema.sql before it existed (2026-09-17).
--
-- Optional point-source attribution for a logged trip (Log a Trip modal,
-- trips.html "+ Break down point sources" accordion) -- lets an owner
-- record how many of a stay's points came from their own contracts vs.
-- Disney one-time points vs. a transfer/borrow, for anyone who wants that
-- level of detail in their financial tracking. Null (the default) means
-- "not broken down" -- points_used alone is still the source of truth for
-- every existing calculation; this is purely additive metadata.
alter table trips
  add column if not exists points_source_breakdown jsonb;
