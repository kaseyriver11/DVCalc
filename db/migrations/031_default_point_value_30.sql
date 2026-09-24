-- Run once in the Supabase SQL editor (2026-09-24). db/schema.sql already
-- includes this for a fresh install.
--
-- One value per point across the app: $30, the default on every page that
-- turns points into a dollar estimate (dvc-point-value.js). Same approach as
-- migration 021: change the column default, and move rows still on the old
-- default to the new one. An owner who picked $26 on purpose is moved too;
-- there's no way to tell them apart from the default, and the value is one
-- slider tap to change back.
alter table public.profiles
  alter column point_value_baseline set default 30;

update public.profiles
  set point_value_baseline = 30
  where point_value_baseline = 26;

notify pgrst, 'reload schema';
