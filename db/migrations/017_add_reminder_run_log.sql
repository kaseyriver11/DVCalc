-- Run this once against the existing dvcalc_start project -- db/schema.sql
-- already includes this table for any future fresh install.
--
-- reminder_run_log: one row per send-banking-reminders invocation
-- (success OR failure), independent of reminder_log's per-contract
-- double-send guard. reminder_log only gets a row when an email actually
-- sends, so it can't answer "did last night's cron even run" or "did it
-- run but fail for everyone" -- a quiet night with nothing due to send
-- looks identical to a cron job that silently stopped firing weeks ago.
-- This is the heartbeat + error summary scripts/nightly_watchdog.py reads
-- (via the public anon key already embedded in auth.js -- see the policy
-- below) to report banking-reminder pipeline health alongside its other
-- freshness checks, since pg_cron -> pg_net invokes the Edge Function
-- fire-and-forget with nothing else ever reading its JSON response.
--
-- Deliberately public-readable: only ever holds aggregate counts and
-- short error strings that reference profile/contract ids, never email
-- addresses (see send-banking-reminders/index.ts, which logs by id
-- rather than email specifically so this table stays safe to expose).

create table if not exists reminder_run_log (
  id uuid primary key default gen_random_uuid(),
  run_at timestamptz not null default now(),
  sent integer not null default 0,
  skipped integer not null default 0,
  error_count integer not null default 0,
  errors jsonb not null default '[]'::jsonb
);

create index if not exists reminder_run_log_run_at_idx on reminder_run_log (run_at desc);

alter table reminder_run_log enable row level security;

create policy "reminder_run_log: public read" on reminder_run_log
  for select using (true);
-- No insert/update/delete policy -- only the service-role key (used by
-- the scheduled Edge Function) can write here, bypassing RLS by design,
-- same trust model as reminder_log.
