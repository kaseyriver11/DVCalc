# Phase 5 Deployment — Banking/Borrowing Reminder Emails

This is the one piece of DVCalc's accounts feature that needs real deployment
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

## 1. Run the migration

Same as before — Supabase dashboard → SQL Editor → New query → paste the
contents of `db/migrations/004_add_reminder_unsubscribe_token.sql` → Run.

## 2. Set up Resend (the email-sending service)

1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month,
   100/day — plenty for a hobby-scale tool).
2. **Domain verification** — Resend's sandbox address
   (`onboarding@resend.dev`) only delivers to *your own* Resend account email,
   which is useless once other people sign up for reminders. To actually
   email real users, add a domain you control under Resend's **Domains**
   page and add the DNS records it gives you (a few TXT/CNAME records at
   your domain registrar). If you don't have a domain for this yet, this is
   the one hard blocker — everything else here works regardless, but sending
   to real users won't until a domain is verified.
3. Create an API key under **API Keys** → note it down, you'll set it as a
   secret in step 4.

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
supabase secrets set REMINDER_FROM_EMAIL="DVCalc <reminders@yourdomain.com>"
supabase secrets set APP_BASE_URL=<wherever DVCalc is actually hosted, e.g. https://yourusername.github.io/DVCalc>
```

Use the same domain you verified in Resend for `REMINDER_FROM_EMAIL`. Leave
it unset only if you're just testing against your own inbox with the
`onboarding@resend.dev` sandbox address.

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
