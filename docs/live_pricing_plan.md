# Live Disney Cash Pricing — Research & Plan

**Status:** Research complete, not yet built. Written 2026-08-30 after live exploration of
`disneyworld.disney.go.com`.

## Goal

Replace/supplement the static MouseSavers-derived cash rates (`data.js`) with real, current
prices pulled directly from Disney's own booking site — for all 17 resorts, including the 5
non-WDW resorts (Aulani, Vero Beach, Hilton Head, Disneyland Hotel, Grand Californian) that
have **no cash data today** since MouseSavers is WDW-only.

The ask isn't just "today's price" — it's "what does this room typically cost N months out,"
since Disney's real prices move with promos and demand. That means this is a **time-series
data collection project**, not a one-time scrape.

## What we found

### The page

`https://disneyworld.disney.go.com/resorts/{resort-slug}/rates-rooms/` — e.g.
`.../resorts/bay-lake-tower-at-contemporary/rates-rooms/`. Public, no login required.

Every DVC resort likely has one of these (confirmed for Bay Lake Tower; the resort list page
at `/resorts/` links to each resort's own rates page).

### How pricing works

- There's a "Check Availability" modal: pick check-in/check-out dates (calendar-picker UI,
  no URL query params — the search state is client-side/in an API call, **not deep-linkable**),
  adults/children count, and which resort.
- Submitting it reloads the page with **every room type at that resort priced at once** —
  e.g. searching Bay Lake Tower for 3/30/2027–4/5/2027 returned Deluxe Studio (Resort/
  Preferred/Theme Park View) *and* every other room category on the property in one page load.
  This is a big efficiency win: one search per (resort, date range) gets the whole room lineup,
  not one request per room type.
- Each room shows **"Standard Rate $X.XX Avg/Night Excl Tax"** — already averaged per night
  and pre-tax, matching the exact convention this app already uses for MouseSavers rates
  (multiply by 1.125 for FL tax to match `data.js`'s existing methodology).
- This is the **unauthenticated baseline rate**. The page also noted "2 Offers Match... Sign
  in to check for additional offers" (Florida Resident, Passholder, DVC Member, Disney+,
  military) — logged-in discounts exist but aren't part of what we'd scrape; the public rate
  is the right comparison baseline anyway (matches what a random person checking cash prices
  would see, and matches MouseSavers' own "rack rate" framing).
- Bonus: real operational info surfaces too, e.g. a live "this resort is undergoing
  construction and refurbishment" banner — not something a static source would ever show.

### The catch: no clean JSON API found (yet)

I didn't find a query-string-based or otherwise easily-replayable API endpoint in the time
spent — the search is driven through the rendered page. **Plan assumes we'll need real browser
automation** (Playwright or Puppeteer driving an actual page), not lightweight HTTP requests.
It's worth a short follow-up spike to check DevTools' Network tab by hand for an internal
`/api/...` JSON call the page makes when you submit a search — if one exists, it would let the
scraper skip full browser rendering and hit the API directly. Treat that as a fast, high-value
first step before building the Playwright version.

## Why this can't be "free" like the crowd/availability scrapes

Those were **one-time** browser reads I did manually in this session. This is different: it
needs to run **repeatedly, on a schedule, indefinitely** to build a price-over-time picture.
DVCalc is a static site on GitHub Pages with no server, so the scraper has to live somewhere
else and hand its output to the static site as a data file.

**Proposed architecture:** a scheduled **GitHub Actions workflow** (cron) that:
1. Runs a Node.js + Playwright script on GitHub's runners (free minutes on a public repo)
2. Drives the real booking page for whichever (resort, date) samples are due that day
3. Writes/updates a JSON file (e.g. `data/cash_prices_live.json`)
4. Commits and pushes it back to the repo — same pattern as every other data file, no new
   hosting, no server to maintain, no credentials to store beyond a repo-scoped commit token
   GitHub Actions already provides.

## Data model: sampling by lead time, not by day

Scraping every date for every resort every day is both wasteful and rude to Disney's servers
(17 resorts x 100+ room types x 365 days is not a reasonable request volume). Instead:

1. **Track a rolling set of target check-in dates** — e.g. the 1st and 15th of each of the
   next 12 months (~24 dates), each with a fixed stay length (3-4 nights, matching how Stay
   Insights already compares "same-length stays").
2. **Snapshot each target date at a handful of lead times** as it approaches: ~7 months out,
   ~5 months, ~3 months, ~1 month, ~2 weeks, ~3 days. This directly answers "what does this
   cost 7 months out" — and since each date gets multiple snapshots at different lead times,
   we get a real **price-by-lead-time curve** per resort/room, not a single guess.
3. **Store every snapshot** (resort, room type, check-in date, nights, price, capture
   timestamp, lead-time-in-days) rather than overwriting — this is what lets the app compute
   an average/median/range instead of showing one possibly-promo-skewed number, directly
   addressing "prices change and they do promos."

### Volume math

24 target dates x 17 resorts = 408 total searches to fully refresh all lead-time buckets once
— but since each date only needs a *new* snapshot when it crosses into its next lead-time
bucket, the actual daily volume is small: a rolling scheduler that scrapes only "dates whose
next snapshot is due today" spreads that load thin across the year instead of hitting
everything at once.

## Recommended phasing

1. **Spike (small, fast):** manually check DevTools for a JSON API before committing to full
   Playwright rendering — could simplify everything downstream.
2. **Phase 1 — prove the pipeline:** one resort (recommend Aulani — it's non-WDW and has zero
   cash data today, so it's the highest-value test case), a handful of target dates, running
   end-to-end through GitHub Actions into a committed JSON file. Confirms the automation,
   scheduling, and git-commit-back flow all work reliably before scaling up.
3. **Phase 2 — close the real gap:** expand to all 5 non-WDW resorts. This is the resorts that
   currently show "no cash rate data" at all — biggest coverage win for the least volume.
4. **Phase 3 (stretch) — go live everywhere:** extend to the 12 WDW resorts too, eventually
   letting live data supersede the static MouseSavers snapshot entirely.

## Open risks to keep in mind

- **Page structure will change.** Disney redesigns periodically; the scraper needs resilient
  selectors and should log/alert on "extracted 0 rooms" rather than silently writing bad data.
- **Room-type cross-contamination:** Bay Lake Tower's results page included room categories
  that don't look like Bay Lake Tower DVC rooms (e.g. "Garden Wing," "Water View Suite - Club
  Level" — likely spillover from the adjacent Contemporary Resort hotel sharing the booking
  widget). Matching scraped room names to this app's existing `roomTypes[]` IDs will need
  careful filtering, not a blind "grab everything on the page."
- **Be a polite scraper:** rate-limit requests, spread them out, run during off-peak hours,
  and keep the daily request budget small (per the sampling model above).
- **Storage growth:** time-series data accumulates. Will eventually need a retention policy —
  e.g. keep raw snapshots for a rolling window, then collapse older data into monthly
  averages.

## What this doc is not

This is not a build-ready spec — it's the research and shape of the plan. Before writing the
Playwright script and GitHub Actions workflow, we should confirm: which resort to pilot with,
the exact target-date/lead-time schedule, and the JSON schema for `cash_prices_live.json`.
