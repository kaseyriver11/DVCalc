-- Run this once in the Supabase SQL editor against the existing
-- dvcalc_start project -- db/schema.sql already includes this column for
-- any future fresh install, this file is only for catching up a database
-- that ran schema.sql before this column existed (2026-09-04).
--
-- One-click unsubscribe token for reminder emails (CAN-SPAM/GDPR
-- expectation: unsubscribing shouldn't require being logged in). Each
-- profile gets a random token at creation; the reminder email's
-- unsubscribe link hits a public Edge Function with this token, which
-- flips reminder_opt_in off without any auth.

alter table profiles add column if not exists reminder_unsubscribe_token uuid not null default gen_random_uuid();

create unique index if not exists profiles_reminder_unsubscribe_token_idx on profiles(reminder_unsubscribe_token);

comment on column profiles.reminder_unsubscribe_token is
  'Opaque token for the no-login unsubscribe link in reminder emails. Never expose alongside the user''s other profile fields in any authenticated API response beyond what the owning user themselves can already see.';
