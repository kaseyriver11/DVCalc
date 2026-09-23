# Phase 5 Deployment — Banking/Borrowing Reminder Emails

This is the one piece of DVC Companion's accounts feature that needs real deployment
work outside the browser — an Edge Function running server-side on a daily
schedule, sending real email. None of this can be done by editing files alone;
each numbered step below is something you need to actually run.

## What's already built (no action needed)

- `db/migrations/004_add_reminder_unsubscribe_token.sql` — adds the
  unsubscribe token column (run this the same way you ran migrations 002/003,
  via the Supabase SQL editor)
- `supabase/functions/send-banking-reminders/index.ts` — the actual reminder
  logic: finds opted-in users, checks each active contract's deadline,
  double-send guard via `reminder_log`, sends via Resend
- `supabase/functions/unsubscribe-reminders/index.ts` — public one-click
  unsubscribe link used in the email footer
- `account.html` now shows each active contract's next banking/borrowing
  deadline date, computed client-side — this already works, no deployment
  needed for that part
- `db/migrations/017_add_reminder_run_log.sql` — a `reminder_run_log`
  heartbeat table the function now writes to on every invocation (success
  or failure), separate from `reminder_log`'s per-send double-guard.
  `scripts/nightly_watchdog.py` reads it (public-readable, no new secret
  needed) to report banking-reminder pipeline health in the nightly
  digest — see `docs/nightly_pipeline_plan.md`.

## 1. Run the migrations

Same as before — Supabase dashboard → SQL Editor → New query → paste the
contents of `db/migrations/004_add_reminder_unsubscribe_token.sql` → Run.
Then do the same for `db/migrations/017_add_reminder_run_log.sql` — without
it, the function's insert into `reminder_run_log` at the end of every
invocation fails (harmlessly — it's caught and folded into the response's
`errors` array rather than crashing the send), and the nightly digest's
banking-reminders check will report "no runs recorded."

## 2. Set up Resend (the email-sending service)

1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month,
   100/day — plenty for a hobby-scale tool).
2. **Domain verification** — under Resend's **Domains** page, verify
   `dvccompanion.com` (add its DNS records at Squarespace alongside the
   GitHub Pages A/AAAA records already there). Originally done against
   `dvcalc.app` before the app moved to `dvccompanion.com`; that
   verification can be removed from Resend once the new domain is sending
   cleanly.
3. Create an API key under **API Keys**, "Sending access" permission →
   note it down, you'll set it as a secret in step 4.

## 3. Install the Supabase CLI and link this project

If you don't already have it:

```
npm install -g supabase
supabase login
```

Then, from this repo's root:

```
supabase link --project-ref afqhmtqwjtjkjahepqxv
```

(That project ref is `dvcalc_start`'s, taken from the URL already in
`auth.js`.) It'll ask for your database password if you haven't linked
before.

## 4. Set the secrets the functions need

```
supabase secrets set RESEND_API_KEY=<your resend api key>
supabase secrets set REMINDER_FROM_EMAIL="DVC Companion <reminders@dvccompanion.com>"
supabase secrets set APP_BASE_URL=https://dvccompanion.com
```

`REMINDER_FROM_EMAIL` uses `dvccompanion.com` since that's the domain
verified in Resend — the address doesn't need to be a real inbox, just a
valid address at the verified domain. `APP_BASE_URL` is the live site (used
for any links back to the app in the reminder email itself). Re-run both
`secrets set` commands (no redeploy needed — Edge Functions read secrets at
request time) whenever the domain changes.

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are already available to every
Edge Function automatically — you don't need to set those yourself.

## 5. Deploy both functions

```
supabase functions deploy send-banking-reminders
supabase functions deploy unsubscribe-reminders --no-verify-jwt
```

The `--no-verify-jwt` flag on the unsubscribe function is required — it's a
plain link clicked from an email client, which can't attach an
Authorization header the way an authenticated app request can.

After deploying, note the unsubscribe function's URL from the CLI output
(looks like `https://afqhmtqwjtjkjahepqxv.supabase.co/functions/v1/unsubscribe-reminders`)
and set it as one more secret so the send function can build unsubscribe
links:

```
supabase secrets set UNSUBSCRIBE_FUNCTION_URL=https://afqhmtqwjtjkjahepqxv.supabase.co/functions/v1/unsubscribe-reminders
```

## 6. Test manually before trusting the schedule

Per the original plan, trigger the send function by hand first — don't wait
for the real cron to fire and hope:

```
curl -X POST https://afqhmtqwjtjkjahepqxv.supabase.co/functions/v1/send-banking-reminders \
  -H "Authorization: Bearer <your service role key, from Supabase dashboard Settings > API>"
```

**Dry run first (added 2026-09-23).** Add `?dry_run=1` to compute every
decision without sending mail, claiming `reminder_log` rows, or writing the
`reminder_run_log` heartbeat. It returns `planned: [{contract, action, deadline}]`,
where `action` is `bank` (a confirmed positive current balance), or `check`
(no confirmed balance for the current use year). A confirmed zero, and
banked/borrowed/Holding-only balances, plan nothing:

```
curl -X POST "https://afqhmtqwjtjkjahepqxv.supabase.co/functions/v1/send-banking-reminders?dry_run=1" \
  -H "Authorization: Bearer <your service role key>"
```

What each email says (rules and copy in `supabase/functions/_shared/banking-reminder.js`):
- **bank** — subject "Banking deadline in N days: X current points on {contract}".
  Names the recorded amount as "points you recorded as current", the banking
  deadline, that Disney confirms eligibility and does the banking, and that
  unbanked points are *not* lost then — they stay usable until the use year's
  last day (stated separately). Never "banking/borrowing", never "forfeited".
- **check** — subject "Check your {contract} points before the {date} banking
  deadline". No point amount or eligibility claim; asks the owner to check
  Disney's site and add the balance.

`reminder_type` is `banking_deadline` or `banking_balance_check` (each sent at
most once per contract per deadline). Rows under the old
`banking_borrowing_deadline` type still block a repeat for that deadline.

It returns `{"sent": N, "skipped": N, "errors": [...]}`. To actually see a
send happen, you'll need at least one opted-in profile with an active
contract whose use year's deadline falls within its `reminder_lead_days` —
easiest way to test is temporarily setting your own `reminder_lead_days` to
something like 400 in My Contracts, so today is guaranteed to be within the
window regardless of your real use year. Set it back afterward. Then run
the curl command again — running it twice in a row should show the first
call with `sent: 1` and the second with `skipped: 1` for that same contract
(the double-send guard working).

## 7. Schedule the daily cron

In the Supabase SQL editor, enable the two extensions this needs (usually
already available, safe to re-run) and schedule the job:

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'send-banking-reminders-daily',
  '0 13 * * *', -- 13:00 UTC = 9am Eastern (8am during EDT) -- adjust if you want a different local send time
  $$
  select net.http_post(
    url := 'https://afqhmtqwjtjkjahepqxv.supabase.co/functions/v1/send-banking-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <your service role key>',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

**Security note:** that inlines your service role key directly into a saved
cron job definition, visible to anyone with SQL editor access to this
project. For a solo-owner hobby project that's you anyway, but if this ever
has other admins, move the key into
[Supabase Vault](https://supabase.com/docs/guides/database/vault) instead
and reference it from the cron job rather than pasting it in plainly.

To confirm the schedule is registered: `select * from cron.job;`. To remove
it later: `select cron.unschedule('send-banking-reminders-daily');`.

## Once this is all done

Update the note in `account.html`'s Deadline Reminders section (currently:
*"Actual reminder emails depend on the site owner finishing deployment of
the reminder service"*) to something like *"Emails send automatically once
you're within your lead time of a deadline."* — that copy change is a
one-line edit, not something that needs redeployment of anything else.
