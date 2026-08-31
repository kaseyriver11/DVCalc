# Live Disney Cash Pricing — Research & Plan

**Status:** Phase 1 pilot (`scripts/scrape_live_prices.py`) and Phase 1.5 period-aggregation
build (`scripts/build_live_cash_rates.py`, output in `data/cash_prices_live.json`) both done for
Copper Creek. Not yet wired into the app or scheduled. Written 2026-08-30 after live exploration
of `disneyworld.disney.go.com`, updated same day after finding the real pricing API, again after
the first pilot run, and again after the full 2027 period build.

## Shared inventory: Copper Creek and Boulder Ridge

Copper Creek Villas & Cabins and Boulder Ridge Villas are two separate DVC resorts (separate
points charts, separate `RESORTS[]` entries in `data.js`) but **one physical building complex**
at Wilderness Lodge — Boulder Ridge is the original 2000-era villas, Copper Creek is the 2017
addition. Confirmed live: querying both resort slugs with identical dates returns byte-identical
room IDs and prices. Disney's cash-booking system doesn't distinguish them. Decision (user
confirmed): both DVC resorts read from the same live dataset rather than trying to artificially
split an inventory pool Disney itself doesn't split. Worth checking whether other resort pairs
at shared physical properties behave the same way (Beach Club/Yacht Club flagged as a likely
candidate, not yet investigated).

## Room-code mapping (Copper Creek / Boulder Ridge)

Disney's `code` field (e.g. `"2E"`) is an internal room code, not a human name. Mapped to this
app's `roomTypes[]` IDs two ways:
- **Confirmed via CDN image slug** — Disney's room-photo URLs embed the code plus a descriptive
  name (e.g. `.../copper-creek-resort-2a-deluxe-studio-resort-view/...` → `2A` = Deluxe Studio).
  Copper Creek's slugs gave `2A, 2D, 2E, 2F, 2I, 2K`; Boulder Ridge uses a differently-formatted
  URL (`.../boulder-ridge-villas/standard/{category}/room-{code}-g00.jpg`) and confirmed `XA, XB,
  XC` for the same three tiers.
- **Inferred by price clustering** for the remaining codes (`JB, JC, Z3, Z9` alongside the
  confirmed Deluxe Studio codes at ~$810-890/night in the pilot sample; `JZ, 25, JD, ZS`
  alongside One-Bedroom at ~$1090-1400; `JS` alongside Two-Bedroom at ~$1583, likely the
  Lock-Off variant). Full mapping lives in `ROOM_CODE_TO_APP_TYPE` in
  `scripts/build_live_cash_rates.py`.

## Pilot results (Copper Creek, 2026-08-30)

Ran the scraper for 4 target dates at different lead times. Confirmed the exact concern raised
before building this: **near-term dates return sparse pricing**, but not for the reason
expected, and it's a real per-room signal, not noise:

| Check-in | Lead time | Rooms priced | Rooms sold out |
|---|---|---|---|
| 2026-09-01 | ~2 days | 3 / 18 | 15 / 18 |
| 2026-09-30 | ~1 month | 7 / 18 | 11 / 18 |
| 2027-01-15 | ~4.5 months | 15 / 18 | 3 / 18 |
| 2027-03-30 | ~7 months | 16 / 18 | 2 / 18 |

**Why so many rooms are "sold out" even 7 months out:** DVC resorts only release whatever
rooms *aren't* reserved by points-holders for cash rental — cash inventory at a DVC villa is
inherently much more limited than at a normal Disney hotel. Seeing most rooms unavailable for
near-term dates is expected behavior, not a scraper bug.

**The API distinguishes two levels of unavailability**, and the script now handles both:
- **Per-search** (`reasonsUnavailable`, plural, top-level): the searched party/dates found no
  bookable combination at all. Other rooms in the same response can still be fully priced.
- **Per-room** (`reasonUnavailable`, singular, on the room object): that specific room has no
  inventory for these dates. Its object shrinks to just `code`/`id`/`currentlyInCart` — no
  `displayPrice`, no `orderedPricePerNight`, nothing to fall back to. This was the real
  explanation for "some rooms return no pricing" — not a broken request, a genuine per-room
  sold-out state. The pilot script now checks for this and records `unavailable: true` with
  the reason code on that room rather than crashing or silently producing `null`.

**Sanity check against existing data:** Copper Creek's static 2026 MouseSavers "Premier" rate
(`data.js`) is $771 (Sun-Thu) to $868 (Fri-Sat) per night for the studio. The live 2027 scrape
for the equivalent period landed at ~$810-815/night average across a mixed weekday/weekend
stay — same order of magnitude, and higher as expected for the following year. Good first
signal that the live numbers are trustworthy.

## Period-based aggregation build (Copper Creek, all 2027 periods)

Ran `scripts/build_live_cash_rates.py`, which samples one representative stay per DVC
date-range (not per named period — see the Holiday note in the script), buckets per-night
prices by `(dayType, roomType)`, and averages. 14 date-ranges across 2027's 7 named periods
(Holiday split into its Easter and Christmas sub-ranges, per the "holidays get wonky" concern).

**10 of 14 succeeded.** The 4 failures were all Nov 24 - Dec 31, 2027 — ~451+ days from today —
and failed with HTTP 404, consistent with the ~400-450 day booking-horizon limit found during
the pilot. This is a real system limit (Disney hasn't opened that far out for booking yet), not
a scraper bug — those ranges will succeed on a later re-run as the horizon rolls forward.

**Unexpected finding: DVC's period boundaries don't always match real cash-rate changes.**
The "Dream" range (May 1-14) and "Choice" range (May 15 - Jun 10) — different DVC points
periods, split specifically because points cost differs between them — came back with
**byte-identical live cash prices**, all 35 sampled nightly rates matching exactly. Verified
this wasn't a request bug: the two calls sent genuinely different check-in dates (`2027-05-01`
vs `2027-05-15`) and got the same nightly price sequence back regardless. Read as a real signal,
not noise: Disney's own room-rate calendar apparently doesn't change at May 15 the way DVC's
points chart does — the two "periods" sit inside one underlying Disney rate window for cash
purposes. This is exactly the kind of gap live data is meant to catch that a static
period-level mapping (like the MouseSavers approach) can't.

Full averaged results (Sun-Thu / Fri-Sat, per room type):

| Period | Range | Deluxe Studio | 1BR | 2BR | 2BR Cabin |
|---|---|---|---|---|---|
| Dream | Jan 1-31 | $605 / $849 | $893 / $1,239 | $1,525 / $2,336 | — |
| Select | Feb 1-15 | $649 / $740 | $935 / $1,062 | $1,522 / $1,816 | $3,071 / $3,514 |
| Premier | Feb 16 - Mar 20 | $706 / $821 | $1,027 / $1,188 | $1,782 / $2,110 | — |
| Holiday (Easter) | Mar 21-28 | $841 / $841 | $1,266 / $1,266 | $2,184 / $2,184 | — |
| Premier | Mar 29 - Apr 30 | $818 / $818 | $1,229 / $1,188 | $2,126 / $2,110 | — |
| Dream | May 1-14 | $633 / $681 | $906 / $998 | $1,569 / $1,721 | — |
| Choice | May 15 - Jun 10 | $633 / $681 | $906 / $998 | $1,569 / $1,721 | — |
| Select | Jun 11 - Aug 31 | $617 / $619 | $853 / $855 | $1,444 / $1,448 | — |
| Adventure | Sep 1-30 | $597 / $676 | $811 / $931 | $1,064 / $1,205 | — |
| Preferred | Oct 1 - Nov 23 | $719 / $796 | $1,039 / $1,158 | $1,415 / $1,595 | — |

Missing: Preferred (Nov 27-30), Premier (Nov 24-26), Choice (Dec 1-23), Holiday/Christmas
(Dec 24-31) — all beyond the current booking horizon, to be filled in on a later re-run.

Not yet resolved: only one snapshot exists per bucket so far (n = one sampling run), so
`average` and `lastChecked` are currently identical everywhere — that's expected on a first
run (per the script's own docstring), and will start to diverge once this runs repeatedly
over time per the agreed "average + honestly-labeled last-checked" display design.

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
