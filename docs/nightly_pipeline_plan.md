# Nightly Data Pipeline & Morning Digest

**Status:** Designed 2026-09-06. Phase 1 (watchdogs + email) scaffolded and
ready to review — `.github/workflows/nightly-digest.yml` +
`scripts/nightly_watchdog.py`. **Not yet scheduled to run automatically** —
wired to a manual trigger only until you've reviewed it and added the one
required secret. Phase 2 (live cash pricing folded into the same nightly run)
is designed below but not yet built.

## The ask

A single nightly job, and one email each morning summarizing: what succeeded,
what failed, what needs a look. This doc covers what that job actually does,
why it's split the way it is, and what "production" means for a project with
no server of its own.

## Where this runs

**GitHub Actions**, scheduled via cron — not a Supabase Edge Function. Two
reasons: this job needs to write data files back into the repo (git commit +
push), which Edge Functions can't do; and DVCalc is a public repo, so Actions
minutes are free and unlimited. This matches the architecture
`docs/live_pricing_plan.md` already proposed for the live-pricing piece
specifically — this doc generalizes that into the shared nightly mechanism
the email report also rides on.

## The core design decision: "nightly cadence" ≠ "nightly noise"

Of the six recurring tasks from the launch checklist, only one — live Disney
cash pricing — actually has new data to fetch every single night. The other
five (annual dues, new-year points charts, MouseSavers rack rates,
Contract Value purchase prices, Undercover Tourist's crowd calendar) change a
handful of times a year, if that. Running the *scheduler* nightly for all six
is right — cheap, and catches things the moment they change — but treating
all six as "fetch and overwrite" every night is wrong twice over: it's
wasteful, and worse, a parsing hiccup on a rarely-changing source could
silently corrupt real pricing data users make purchase decisions on.

So the pipeline has two tiers, both running every night, that behave very
differently:

**Tier 1 — real fetch-and-append.** Only live cash pricing. This is
inherently time-series data (the whole point is a price-by-lead-time curve
over months), so nightly writes are the actual feature, not a side effect.

**Tier 2 — freshness watchdogs.** Everything else. These check "has anything
changed since I last looked," and only ever write to their own small internal
state file — never to `data.js`, `resort_investment.js`,
`dues_historical.js`, or any other file real users' numbers come from. When a
watchdog fires, the email says "worth a look," and an actual data update
stays a deliberate, reviewed step afterward (you, or a future Claude session
working from the flagged report) — not something the job does unattended.

On a quiet night — which is most nights, by design — the email is one line.
On a night something changed, the email says exactly what and where to look.
It should never become something you start skimming past.

## Tier 2 in detail — what each watchdog actually checks

| Watchdog | Signal | Why this approach |
|---|---|---|
| **New DVC points chart PDFs** | Hits Disney's own content API (`disneyvacationclub.disney.go.com/api/v1/content?...`) — the same one `scripts/fetch_pdf_urls.sh` already uses — and diffs the returned PDF URL list against what was seen last time. A URL containing a new year (e.g. `2028_AKV.pdf` appearing) is a real, precise signal that Disney just published next year's charts. | Far better than a calendar guess — this is the actual event, not an estimate of when it might happen. |
| **Annual dues page** (dvcresalemarket.com) | Content hash of the dues page. Hash changed → flag. | No structured API exists; a hash diff is the cheapest reliable "did this page change" signal without trying to parse and risk misreading a number. |
| **MouseSavers rack rates hub** | Same hash-diff approach against the current year's hub page. | Same reasoning — MouseSavers has no API either. |
| **Contract Value purchase prices** (Fidelity Real Estate + DVCNews pricing page) | Hash-diff both sources. | This is the one you flagged yourself as needing regular attention. Deliberately *not* auto-parsed and written into `resort_investment.js` — a scraping error here puts a wrong number in front of someone deciding whether to spend $20-30k on a contract. Flag-only, always. |
| **Undercover Tourist crowd calendar** | **Not a real-time check at all** — the site blocks plain HTTP requests outright (confirmed 403 earlier this project), so there's no signal a nightly script could observe even if it tried every night. Instead: a one-time seasonal nudge that fires starting mid-November each year ("next year's calendar has likely published, worth a browser session"), remembered in the state file so it only fires once per year, not every night for six weeks. | Being honest about what can't be automated matters as much as automating what can. Hammering a blocking site nightly for no signal would also be impolite scraping for zero benefit. |

## The report

One JSON object per run, three possible states: `ok`, `review`, `error`.
Composed into an email via Resend (already verified and working for
`dvcalc.app` from Phase 5) — reusing that infrastructure rather than adding a
second email provider.

- **Sender:** `digest@dvcalc.app` (a distinct address from `reminders@`, so
  this internal ops email doesn't visually blend with user-facing reminder
  emails — no extra domain verification needed, same verified domain).
- **Recipient:** you only. This is an operations report, not a user feature.
- **Subject line reflects severity at a glance:**
  - `✅ DVCalc nightly check — all clear` (quiet night, the common case)
  - `⚠️ DVCalc nightly check — N item(s) need review`
  - `🔴 DVCalc nightly check — pipeline error`
- **Body**, ordered worst-to-best: hard errors first (a script crashed,
  needs debugging), then review items (something changed, go look), then a
  one-line routine-success summary at the bottom (once Tier 1 is built:
  "Live pricing: 3/3 resorts refreshed").

A hard failure in the digest-sending step itself (e.g. Resend is down) isn't
a silent dead end — GitHub Actions has its own built-in failure notification
(emails the repo's watchers when a scheduled workflow run fails), so a truly
broken pipeline still surfaces somewhere even if the nice digest never went
out.

## A real problem found and fixed while building this

Naive whole-page hashing looked correct at first but failed the actual test:
running the script twice in a row flagged all four watched pages as
"changed" even though nothing meaningful did. Diffing consecutive fetches by
hand found four distinct, unrelated sources of noise, each fixed with a
targeted regex in `stabilize_content()` rather than a blanket approach:

1. **Rotating ad banners** (dvcnews.com) — a Joomla banner module swaps
   images/links on every load. First fix attempt used `\bbanner\b` as a word
   boundary and still missed it, because the real class names are compound
   tokens (`mod-banners__item`, `banneritem`) where "banner" is a substring,
   not a standalone word — `\b` never matches there. Fixed by dropping the
   word-boundary requirement.
2. **Cloudflare Rocket Loader** (dvcresalemarket.com) — rewrites a
   `data-cf-modified-<hash>-` attribute with a random hash on every request.
3. **Cloudflare email obfuscation** (fidelityrealestate.com) — deliberately
   re-encodes protected email addresses with a different cipher every
   request, by design, specifically to defeat this kind of scraping.
4. **A Gravity Forms newsletter widget's anti-spam honeypot** (also
   fidelityrealestate.com) — a hidden field's label and a timing token both
   change per request as spam countermeasures.

Verified via 4 consecutive live fetches of all four pages after each fix,
confirming byte-identical stabilized content before trusting the mechanism.
Noted here because a future maintainer hitting a new false-positive on some
other page should expect this same pattern (some anti-bot/anti-spam
mechanism, not a real content change) rather than assuming the hashing
approach itself is broken.

## What's built right now (Phase 1)

- **`scripts/nightly_watchdog.py`** — implements every Tier 2 check above,
  reads/writes `data/.watchdog_state.json` (new, tracks last-seen PDF URLs,
  page hashes, and which year's Undercover Tourist nudge has already fired),
  composes the digest, sends it via Resend. Runnable locally right now for
  testing: `RESEND_API_KEY=... DIGEST_TO_EMAIL=you@example.com python3
  scripts/nightly_watchdog.py`.
- **`.github/workflows/nightly-digest.yml`** — runs the script, commits any
  changed state file back to `main`. **Trigger is `workflow_dispatch`
  only right now** (a manual "Run workflow" button in GitHub's Actions tab) —
  deliberately not on a `schedule:` yet.

## What's still needed before this runs on its own

1. **Add a GitHub Actions secret**: repo → Settings → Secrets and variables →
   Actions → New repository secret, name `RESEND_API_KEY`, value your Resend
   API key. (GitHub Actions secrets and Supabase secrets are two entirely
   separate stores — the key has to be added here too, even though it
   already exists as a Supabase secret for the reminder emails.) Also add
   `DIGEST_TO_EMAIL` with your own email address.
2. **Run it once manually** (the "Run workflow" button, or
   `gh workflow run nightly-digest.yml` if you have the `gh` CLI) and confirm
   the email arrives and looks right.
3. **Flip the trigger to `schedule:`** — once step 2 looks good, change
   `workflow_dispatch` to a cron expression in the workflow file (e.g.
   `0 9 * * *`, which is 9am UTC — about 4-5am Eastern depending on DST, so
   it's sitting in your inbox well before morning). I'll make this change the
   moment you confirm the manual run looked right — didn't want to turn on
   an unattended nightly job touching the live repo and sending real email
   without you seeing it work at least once first.

## Phase 2 (not built yet) — folding in live cash pricing

`scripts/build_live_cash_rates.py` already exists, already hits Disney's real
booking API, and already appends to history correctly on repeated runs (see
its own docstring) — it just isn't on any schedule yet, and running all 15
supported resorts every single night is unnecessarily heavy (and mildly
impolite scraping-wise) for data that doesn't need refreshing that often.

Planned approach: add a resort **rotation** to the nightly workflow — e.g. 3
resorts per night, cycling through all 15 over roughly a 5-night window —
rather than redesigning the script's own sampling logic. This is a smaller
lift than the full "sample by lead time" model `docs/live_pricing_plan.md`
originally sketched, and gets real accumulating price history going sooner;
the fuller lead-time-bucket model is still worth revisiting once there's a
few weeks of rotation data to look at.

Once that's added, the nightly email's routine-success line becomes real
(e.g. "Live pricing: 3/3 resorts refreshed, 0 sold out completely, 1 date
range out of booking horizon") and any resort that comes back with an
unexpected response shape (a real risk `docs/live_pricing_plan.md` already
flagged — Disney's API isn't a documented public contract) shows up as a
Tier 1 error in the digest rather than silently writing bad data.

This is intentionally a separate follow-up rather than something rushed into
tonight's build — it touches real user-facing pricing data, so it deserves
its own focused pass rather than being bolted onto the watchdog scaffold at
the last minute.
