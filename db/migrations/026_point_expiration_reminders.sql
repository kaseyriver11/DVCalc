-- Run once in the Supabase SQL editor (2026-09-23). db/schema.sql already
-- includes these columns for a fresh install.
--
-- Prompt 3: two more opt-in reminder emails, separate from the banking
-- deadline reminder (reminder_opt_in / reminder_lead_days):
--   use-year expiration: points that can only be used now (banked,
--     borrowed, and current once the banking deadline has passed) before
--     the use year ends
--   Holding: Holding points before the use year ends (they can only book
--     stays no more than 60 days before check-in)
-- Each has its own setting and lead time, its own reminder_log type
-- (use_year_expiration / use_year_expiration_check / holding_expiration,
-- once per contract per use-year end) and its own unsubscribe link
-- (unsubscribe-reminders?type=expiration|holding). Both default off.

alter table profiles
  add column if not exists expiration_reminder_opt_in boolean not null default false,
  add column if not exists expiration_reminder_lead_days int not null default 45,
  add column if not exists holding_reminder_opt_in boolean not null default false,
  add column if not exists holding_reminder_lead_days int not null default 60;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_expiration_reminder_lead_days_check') then
    alter table profiles add constraint profiles_expiration_reminder_lead_days_check check (expiration_reminder_lead_days between 1 and 240);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_holding_reminder_lead_days_check') then
    alter table profiles add constraint profiles_holding_reminder_lead_days_check check (holding_reminder_lead_days between 1 and 240);
  end if;
end $$;

notify pgrst, 'reload schema';
