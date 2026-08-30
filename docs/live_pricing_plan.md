# Live Disney Cash Pricing — Research & Plan

**Status:** Research complete, not yet built. Written 2026-08-30 after live exploration of
`disneyworld.disney.go.com`, updated same day after finding the real pricing API.

## Goal

Replace/supplement the static MouseSavers-derived cash rates (`data.js`) with real, current
prices pulled directly from Disney's own booking site — for all 17 resorts, including the 5
non-WDW resorts (Aulani, Vero Beach, Hilton Head, Disneyland Hotel, Grand Californian) that
have **no cash data today** since MouseSavers is WDW-only.

The ask isn't just "today's price" — it's "what does this room typically cost N months out,"
since Disney's real prices move with promos and demand. That means this is a **time-series
data collection project**, not a one-time scrape.

## The big find: a real, public, unauthenticated JSON API

No browser automation needed. Disney's own site calls a plain REST endpoint to get pricing,
and it's callable directly with zero session state, zero cookies, zero login:

```
POST https://disneyworld.disney.go.com/wdw-resorts-details-api/api/v1/resort/{resort-slug}/availability-and-prices/?storeId=wdw
Content-Type: application/json

{
  "checkInDate": "2027-04-10",
  "checkOutDate": "2027-04-14",
  "partyMix": { "adultCount": 2, "childCount": 0, "nonAdultAges": [] },
  "region": "US",
  "accessible": false,
  "marketingOfferId": "room-only"
}
```

Verified live (Copper Creek, 4/10-4/14/2027): **200 OK**, no auth, no referrer/session tokens
required — a request built from scratch with only the 6 fields above worked. (The real page
also sends `personalizationId`, `availabilityId`, `affiliations`, `postalCode` — those looked
optional; worth re-confirming at build time, but the minimal body was sufficient in testing.)

### The response is better than what we have today

The response includes `roomPriceLookup`, keyed by Disney's internal room ID, and each room
carries an **`orderedPricePerNight` array — true day-by-day pricing for every night of the
stay**, not just a stay average:

```json
{
  "code": "2E",
  "displayPrice": { "basePrice": { "subtotal": "1033.00", "taxIncluded": false } },
  "orderedPricePerNight": [
    { "date": "2027-04-10", "price": { "subtotal": "1126.00", "tax": "0.00", "total": "1126.00" } },
    { "date": "2027-04-11", "price": { "subtotal": "1002.00", "tax": "0.00", "total": "1002.00" } },
    { "date": "2027-04-12", "price": { "subtotal": "1002.00", "tax": "0.00", "total": "1002.00" } },
    { "date": "2027-04-13", "price": { "subtotal": "..." } }
  ],
  "totalPrice": { "subtotal": "4132.00", "tax": "516.50", "total": "4648.50" },
  "packageId": "5GKFC",
  "packageName": "2027 WDW Annual Room Only V1"
}
```

- `tax` came back `"0.00"` per night but `516.50` in `totalPrice` for a `4132.00` subtotal —
  that's **exactly 12.5%**, confirming the same Florida tax rate this app already applies to
  MouseSavers rates. Consistent methodology, no changes needed there.
- One call per (resort, date-range, party size) returns **every room type at that resort**,
  each with genuine per-night prices — far more granular than MouseSavers' ~27 seasonal
  buckets mapped onto DVC's 7 periods. This could eventually let the app show real day-by-day
  cash pricing instead of a season-level estimate.
- `code` (e.g. `"2E"`) is Disney's internal room code, not a human name. The room-rates page
  itself (`/resorts/{slug}/rates-rooms/`) lists human names ("Deluxe Studio - Resort View")
  alongside images — building a one-time `code → this app's roomTypes[] id` lookup table per
  resort is the remaining mapping work, not a blocker.
- A secondary confirmation signal exists too: a DerbySoft marketing-attribution pixel
  (`linkcenter.derbysoftca.com/dplatform-linkcenter/pixelTagging`) fires with the full price
  breakdown in plain URL query params (`price_base`, `price_tax_fees`, `price_total`,
  `room_type_id`, `hotel_id`) — not needed given the API works directly, but useful as a
  cross-check if the API response format ever gets harder to parse.

### What this changes about the plan

The original plan assumed we'd need Playwright driving a real rendered page — slow, resource
heavy, and fragile to UI redesigns. **We don't.** A scraper can be a plain script making HTTP
POST requests with `fetch`/`requests`/`curl` — no browser, no headless Chrome, dramatically
simpler and faster to run on a schedule. This lowers the whole project's cost by a lot.

### The resort-rates page (secondary, human-facing reference)

`https://disneyworld.disney.go.com/resorts/{resort-slug}/rates-rooms/` — the page a person
would actually browse. Not needed for scraping now that the API is known, but useful for
double-checking room-code-to-name mappings and for spot-checking the scraper's output looks
right. Confirmed slug pattern varies per resort (Bay Lake Tower is
`bay-lake-tower-at-contemporary`, Copper Creek is `copper-creek-villas-and-cabins` — no
`-at-wilderness-lodge` suffix despite the display name including it). Slugs need to be
collected per resort, not derived from a formula.

## Why this still can't run "in" the static site

Even without needing a browser, this still has to run **repeatedly, on a schedule,
indefinitely** to build a price-over-time picture, and DVCalc is a static site on GitHub
Pages with no server. The scraper has to live somewhere else and hand its output to the
static site as a data file.

**Proposed architecture:** a scheduled **GitHub Actions workflow** (cron) that:
1. Runs a small Node.js (or Python) script on GitHub's runners (free minutes on a public
   repo) — plain HTTP requests to the API above, no browser dependency
2. Fetches pricing for whichever (resort, date) samples are due that day
3. Writes/updates a JSON file (e.g. `data/cash_prices_live.json`)
4. Commits and pushes it back to the repo — same pattern as every other data file, no new
   hosting, no server to maintain, no credentials beyond the commit token GitHub Actions
   already provides.

## Data model: sampling by lead time, not by day

Scraping every date for every resort every day is still both wasteful and rude to Disney's
servers (17 resorts x 100+ room types x 365 days is not a reasonable request volume, even at
API speed). Instead:

1. **Track a rolling set of target check-in dates** — e.g. the 1st and 15th of each of the
   next 12 months (~24 dates), each with a fixed stay length (3-4 nights, matching how Stay
   Insights already compares "same-length stays").
2. **Snapshot each target date at a handful of lead times** as it approaches: ~7 months out,
   ~5 months, ~3 months, ~1 month, ~2 weeks, ~3 days. This directly answers "what does this
   cost 7 months out" — and since each date gets multiple snapshots at different lead times,
   we get a real **price-by-lead-time curve** per resort/room, not a single guess.
3. **Store every snapshot** (resort, room code, check-in date, nights, per-night prices,
   capture timestamp, lead-time-in-days) rather than overwriting — this is what lets the app
   compute an average/median/range instead of showing one possibly-promo-skewed number,
   directly addressing "prices change and they do promos."

### Volume math

24 target dates x 17 resorts = 408 total API calls to fully refresh all lead-time buckets once
— and since each call already returns every room type at that resort, that's the *entire*
request count, not per-room-type. A rolling scheduler that only calls for "dates whose next
snapshot is due today" spreads that thin across the year. At API speed (no browser rendering)
this is a very light daily job — plausibly seconds, not minutes.

## Recommended phasing

1. **Phase 1 — prove the pipeline, with a validation check:** Copper Creek (your pick — and a
   good one: since it already has MouseSavers rates, we can sanity-check the scraped live
   prices against the existing estimate before trusting this approach anywhere else). Confirm
   the GitHub Actions + API-call + git-commit-back flow works end-to-end, and compare a few
   scraped prices against `data.js`'s current MouseSavers numbers for the same dates/rooms.
2. **Phase 2 — close the real gap:** expand to the 5 non-WDW resorts with zero cash data
   today — biggest coverage win.
3. **Phase 3 (stretch) — go live everywhere:** extend to all 12 WDW resorts, eventually
   letting live data supersede the static MouseSavers snapshot entirely, and consider
   surfacing true day-by-day pricing instead of season-level estimates given the API supports it.

## Open risks to keep in mind

- **API contract could change without notice** — it's not a documented public API, just what
  Disney's own frontend happens to call. Scraper should validate response shape and log/alert
  on unexpected structure rather than silently writing bad data.
- **Room-code mapping:** each resort's `code` values (e.g. `"2E"`) need a one-time mapping to
  this app's existing `roomTypes[]` IDs, built by cross-referencing the human-readable
  `/rates-rooms/` page. Some cross-contamination risk (Bay Lake Tower's rendered page showed
  room categories that didn't look like Bay Lake Tower DVC rooms, likely spillover from the
  adjacent Contemporary Resort) — worth double-checking the API response is cleanly scoped to
  the requested resort, not just trusting the rendered page's grouping.
- **Be a polite scraper anyway**, even though it's lightweight: rate-limit requests, spread
  them out, keep the daily request budget small (per the sampling model above). Being an API
  instead of a rendered page doesn't change the etiquette expectation.
- **Storage growth:** time-series data accumulates. Will eventually need a retention policy —
  e.g. keep raw snapshots for a rolling window, then collapse older data into monthly
  averages.
- **Optional fields we dropped** (`personalizationId`, `availabilityId`, `affiliations`,
  `postalCode`) should be re-tested at build time across a few resorts to confirm they're
  truly optional everywhere, not just for this one request.

## What this doc is not

This is not a build-ready spec — it's the research and shape of the plan. Before writing the
scraper script and GitHub Actions workflow, we should confirm: the exact target-date/lead-time
schedule, and the JSON schema for `cash_prices_live.json`.
