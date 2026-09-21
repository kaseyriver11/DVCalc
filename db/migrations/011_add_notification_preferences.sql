-- Run this once in the Supabase SQL editor against the existing
-- dvcalc_start project -- db/schema.sql already includes these columns
-- for any future fresh install, this file is only for catching up a
-- database that ran schema.sql before they existed (2026-09-17).
--
-- Per-channel notification settings (Notification Settings modal,
-- account.html) -- extends the existing reminder_opt_in/reminder_lead_days
-- (email) with an in-app channel and a Web Push foundation.
--
-- push_subscription stores the browser's PushSubscription (via its own
-- .toJSON()) once a real send-side Edge Function exists to read it and
-- actually deliver pushes (would mirror send-banking-reminders/ using the
-- web-push library and a VAPID keypair -- not deployed yet). Until then it
-- may hold a { pending: true } placeholder recorded when someone opts in
-- before that backend exists, so the UI can still reflect "wants push."

alter table profiles
  add column if not exists in_app_notifications_enabled boolean not null default true,
  add column if not exists push_enabled boolean not null default false,
  add column if not exists push_subscription jsonb;
