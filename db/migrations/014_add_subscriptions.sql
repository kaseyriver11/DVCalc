-- Run this once in the Supabase SQL editor against the existing
-- dvcalc_start project -- db/schema.sql already includes this table for
-- any future fresh install, this file is only for catching up a database
-- that ran schema.sql before it existed (2026-09-18).
--
-- Backs the "Active Member" paid tier (docs/subscriptions_plan.md).
-- Written only by the stripe-webhook Edge Function (service role) --
-- users get read-only visibility into their own row, same trust model as
-- reminder_log. `unique (user_id)` lets the checkout/webhook functions
-- upsert on user_id instead of select-then-insert-or-update.

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  status text not null default 'incomplete',
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create unique index if not exists subscriptions_stripe_customer_id_idx on subscriptions(stripe_customer_id);
create unique index if not exists subscriptions_stripe_subscription_id_idx on subscriptions(stripe_subscription_id) where stripe_subscription_id is not null;

alter table subscriptions enable row level security;

drop policy if exists "subscriptions: select own" on subscriptions;
create policy "subscriptions: select own" on subscriptions
  for select using (auth.uid() = user_id);
