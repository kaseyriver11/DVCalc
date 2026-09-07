# Nightly Data Pipeline & Morning Digest

**Status:** Both phases live as of 2026-09-06. Phase 1 (watchdogs + email)
verified via a real manual run, then a real Cloudflare/User-Agent bug found
and fixed (see below), then scheduled on a real nightly cron (9am UTC).
Phase 2 (live cash pricing folded into the same nightly run, via a resort
rotation) built and integration-tested the same night — see "Phase 2" below
for what changed from the original plan.

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

## What's built (Phase 1)

- **`scripts/nightly_watchdog.py`** — implements every Tier 2 check above,
  reads/writes `data/.watchdog_state.json` (tracks last-seen PDF URLs, page
  hashes, which year's Undercover Tourist nudge has fired, and the live
  pricing rotation index), composes the digest, sends it via Resend.
  Runnable locally for testing: `RESEND_API_KEY=... DIGEST_TO_EMAIL=you@example.com
  python3 scripts/nightly_watchdog.py`.
- **`.github/workflows/nightly-digest.yml`** — runs the script, commits any
  changed state/pricing files back to `main`. Scheduled daily at 9am UTC
  (~4-5am Eastern), `workflow_dispatch` also available for on-demand runs.

**A real bug found on the first live run, worth recording:** the first
`workflow_dispatch` test failed with a bare HTTP 403 and no useful detail --
`send_email()` didn't catch the error at all, so the script crashed before
either the real failure reason or the watchdog state could be saved. Once
caught properly, the actual cause turned out to be Cloudflare (sitting in
front of api.resend.com) blocking the request over urllib's default
`Python-urllib/3.x` User-Agent -- a well-known scraper signature -- before
the request ever reached Resend's own auth logic. Fixed both: `send_email()`
now catches send failures and folds them into the report instead of
crashing, and the request carries a real User-Agent. Re-ran manually,
confirmed the digest arrived correctly, then flipped on the schedule.

## Phase 2 — live cash pricing, built and folded into the same run

`scripts/build_live_cash_rates.py` was untouched -- Phase 2 wraps it via
`subprocess`, doesn't reimplement or modify its internals. New in
`nightly_watchdog.py`:

- **`check_live_pricing()`** picks a **rotating batch of 3 resorts** per
  night (`PRICING_ROTATION_BATCH_SIZE`), tracked via `pricingRotationIndex`
  in the shared state file so it cycles through all 15 supported resorts
  over ~5 nights rather than hitting all of them every night -- lighter load,
  more polite scraping, and matches how often this data actually needs
  refreshing. Runs `build_live_cash_rates.py --resort <batch>` as a
  subprocess and folds its outcome into the same digest as the Tier 2
  watchdogs -- one email, not two.
- **A real false positive found and fixed here too:** the first classification
  attempt flagged *any* `FAILED` line in the script's output as worth
  reviewing. Testing against a real resort (`animalKingdomVillas`) showed
  this was wrong -- `FAILED (2027): HTTP Error 404` for far-future date
  ranges is expected, already-documented behavior (Disney's ~400-450 day
  booking horizon, see `docs/live_pricing_plan.md`'s own pilot findings), and
  the script's *own* year-fallback logic already recovers it, producing real
  pricing data right after the "failure." Fixed by only flagging failures
  whose error text is something *other* than `404` -- a genuinely different
  exception (timeout, JSON shape change, KeyError from an API change) is the
  real signal worth surfacing; a 404 on the preferred year alone is not.
- Verified with a full integration run covering all 6 checks together
  (5 watchdogs + the live-pricing rotation) before shipping -- came back
  clean, 3 resorts (`animalKingdomVillas`, `bayLakeTower`, `beachClubVillas`)
  refreshed successfully.
- `.github/workflows/nightly-digest.yml`'s commit step now also stages
  `data/cash_prices_live.json`, so each night's rotation batch gets pushed
  back to the repo alongside the watchdog state.

**Not done, deliberately deferred:** the fuller "sample by lead time" model
`docs/live_pricing_plan.md` originally sketched (multiple snapshots per
target date at varying lead times, not just "refresh whichever resorts are
due tonight"). The rotation approach gets real accumulating price history
going now; revisit the lead-time-bucket model once there's a few weeks of
rotation data to look at.

## Phase 3 — wired into the app's actual cash-rate lookups (2026-09-06)

Every cash price shown anywhere in the app goes through one function,
`getCashRateWithFallback()` in `data.js` -- so that's the one place this
needed to plug in, not a per-page change.

- **`build_live_pricing_summary()`** (new, in `nightly_watchdog.py`, called
  every night after the pricing rotation regardless of which resorts were
  just touched) reads the full `data/cash_prices_live.json` and writes a
  stripped-down `data/cash_prices_live_summary.js` -- same data, minus each
  bucket's raw sample-history array. This matters for growth: the full file
  accumulates history forever and will keep growing; the summary only grows
  with resort/period *coverage*, so it stays a bounded, fast-loading file
  regardless of how long the nightly job has been running. Loaded via a
  plain `<script src="data/cash_prices_live_summary.js">` tag on all 9
  pages, same idiom as every other data file -- no async fetch, no loading-
  order changes.
- **`getLiveCashRate()`** (new, in `data.js`) looks up a live sample by
  resort id, matching the exact chart year being viewed (`yearUsed ===
  resort.year`) so a 2027 sample is never shown against 2026 dates or vice
  versa, even though DVC's period calendar structure repeats year to year.
  Defensive against the summary script not being loaded at all
  (`typeof CASH_PRICES_LIVE === "undefined"`).
- **Decision: replace silently.** Asked directly rather than assumed --
  where a live sample exists, `getCashRateWithFallback()` returns it in
  place of the static MouseSavers-derived rate (tagging the result
  `isLive: true` so a future UI change could still surface it, even though
  nothing displays that tag today). No side-by-side display, no separate
  "live" badge in this pass.
- Room-type ID alignment turned out to already be solved: `build_live_cash_rates.py`'s
  `codes` mapping and `data.js`'s `roomTypes[].id` use the exact same short
  identifiers (`dsR`, `dsSV`, `oneR`, etc.) -- no adapter needed there.
- Verified end to end in a real browser against the live-accumulated data:
  a covered (resort, date, room type) correctly returns the live average
  with `isLive: true`; an uncovered one for a resort *with* static data
  falls through unchanged to the old behavior; a resort with *no* cash
  data at all (Grand Californian) still correctly returns `null`. All
  five existing call sites (`app.js`, `compare.html`, `trips.html`,
  `itineraries.html`, `itinerarycompare.html`) already destructure by
  field name (`.rate`, `.isPriorYear`), so the new `isLive`/`lastCheckedAt`/
  `sampleCount` fields are additive and don't risk breaking anything.

**Coverage today** is only whichever resorts the rotation has reached since
launch (grows by 3/night) -- and two resorts (Grand Californian, Aulani)
will never get live coverage at all (no confirmed API mapping, see
`docs/live_pricing_plan.md`), two more (Vero Beach, Hilton Head) have shown
zero bookable rooms on every sample so far. All four keep falling back to
static data by design -- see the "missing resorts" research this session
also did to give those four a better static estimate than today's.
