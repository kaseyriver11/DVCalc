# DVC Points Calendar

## Overview
A web app that displays a calendar view for Disney Vacation Club resorts, showing the nightly cost in points and estimated cash equivalent. Users can select a resort and room type, browse months, and select check-in/check-out dates to see total points, rental value, Disney cash rate, and savings.

## Status
**Phase:** Phase 1 complete (core functionality)

## Tech Stack
- **Frontend:** HTML/CSS/JavaScript (vanilla — single-page app, no framework needed)
- **Hosting:** Static files (can be opened locally or deployed anywhere)
- **Data:** JSON embedded in JS (points charts extracted from DVC PDFs)

## File Structure
```
├── index.html                  # Main calendar page
├── compare.html                # Cross-resort date comparison tool
├── changes.html                # Year-over-year weekly point cost comparison (multi-resort)
├── styles.css                  # Calendar page styling
├── app.js                      # Calendar app logic, rendering, event handlers
data/
├── data.js                     # Resort data, points charts, cash rates, dues (2026-2027)
├── data_historical.js          # Historical points data (all 17 resorts, 2016-2025)
└── availability_data.js        # Availability overlay data
scripts/
├── fetch_pdf_urls.sh           # Fetches DVC points chart PDF URLs from Disney's API
├── download_historical_pdfs.sh # Downloads all historical PDFs from DVC Field Guide
├── extract_all_historical.py   # Extracts points from all resort PDFs → data_historical.js
└── extract_historical.py       # (legacy) AKV-only extraction script
docs/
└── data_reproducibility.md     # Data sources, reproducibility audit, and update instructions
pdfs/{resort}_archive/          # Downloaded historical PDFs for all 17 resorts (2016-2027)
```

## Key Features
1. Searchable resort selector dropdown (alphabetical)
2. Room type selector (dynamic per resort)
3. Year selector (2016-2027, historical data for all resorts)
4. Monthly calendar grid with points-per-night displayed
5. Color coding by travel periods (season)
6. Check-in / check-out date selection
7. Side-by-side layout: calendar left, cost breakdown right
8. DVC rental rate slider ($15-$25/point, default $20)
9. Owner mode (calculates cost based on annual dues per point)
10. Summary: total points, rental value, Disney cash rate, savings %
11. Nightly breakdown (expanded by default)
12. Custom cash rate input for non-WDW resorts
13. Responsive design
14. Defaults to current month

## Resorts
All 17 DVC resorts are selectable for 2026 and 2027, and `data.js` now defines all 17 (Animal Kingdom Villas was added 2026-08-30 — see below). Cash rates now cover all 17: the 12 WDW resorts from MouseSavers, Disneyland Hotel from the live pricing pipeline, and Aulani/Grand Californian/Vero Beach/Hilton Head from rough manual estimates (`estimatedCashRates: true` in `data.js` — see `docs/data_reproducibility.md` "Estimated Cash Rates" for methodology and confidence caveats). Every estimated-rate resort gets a "(!)" hover badge (`estimateBadgeHTML()` in `app.js`/`compare.html`) next to its name and on the Cost Comparison tile, explaining the price isn't an observed rate.

**Animal Kingdom Villas** points/cash rates live directly in `data.js` for 2026 only (Jambo House + Kidani Village MouseSavers pages, averaged where both buildings share a view). 2027 has no `data.js` entry — it still comes from the generated `data_historical.js` for points, and falls back to 2026's cash rates via `getCashRateWithFallback()` (same prior-year fallback other resorts use), since MouseSavers' 2027 AKV pages don't yet publish December rates.

All 17 resorts have historical points data back to 2016 (or their opening year) in `data_historical.js`, auto-extracted from DVC Field Guide PDFs. Three gaps exist: BWV 2018 and PVB 2016 are image-based PDFs that can't be text-extracted, and AKV is missing from `data.js` (see `docs/data_reproducibility.md`).

---

## Data Sources

For detailed data documentation, reproducibility audit, and update instructions, see [`docs/data_reproducibility.md`](docs/data_reproducibility.md).

| Data | Source | How to Update |
|------|--------|---------------|
| Points charts | Official DVC PDFs from Disney's CDN | Run `scripts/fetch_pdf_urls.sh` to get URLs, extract values from PDFs, add to `data.js` |
| Historical points | DVC Field Guide point-archive PDFs | Run `scripts/download_historical_pdfs.sh`, then `scripts/extract_all_historical.py pdfs/` |
| Cash rack rates | MouseSavers.com (WDW only) | Scrape rate tables, map to DVC periods, add as `cashRates` in `wdwPeriods()` |
| Annual dues | dvcresalemarket.com | Update `DUES_PER_POINT` in `data.js` |
| Rental rates | Market observation | Slider is user-configurable ($15-$25/pt) |
| Hotel construction/refurbishment | Disney Food Blog's DFB Disney World Calendar PDF | Re-read the latest PDF, update `data/resort_construction.js` |
| Special events (festivals, hard-ticket parties, runDisney) | Disney Food Blog's DFB Disney World Calendar PDF | Re-read the latest PDF, update `data/disney_events.js` |

---

## Architecture Notes

### data.js
- `DUES_PER_POINT` — annual dues by resort ID
- `wdwPeriods(rates, cashRates)` / `wdwPeriods2027()` — helpers that create travel period objects for WDW resorts (shared season dates)
- `RESORTS[]` — array of resort objects with `id`, `name`, `year`, `roomTypes[]`, `travelPeriods[]`
- Lookup functions: `getTravelPeriod()`, `getPointsForDate()`, `getCashRateForDate()`

### data_historical.js
- `buildPeriods(periodDefs, rates)` — generic period builder for years with varying structures
- `WDW_YYYY` constants — period definitions (name, color, dateRanges) per year
- Pushes historical resort entries onto `RESORTS[]` (loaded after data.js)
- Covers all 17 resorts, 182 resort-year entries (2016-2027, varying by resort opening date)
- Handles 5-period (2016-2020: Adventure, Choice, Dream, Magic, Premier), 6-period, and 7-period (2021+) structures
- Also handles Aulani flat-rate (SUN-SAT), non-WDW period structures, and variable column counts per resort
- Generated by `scripts/extract_all_historical.py` from PDF source files
- 2026/2027 entries overlap with `data.js`, so the file ends with a `dedupeResorts()` IIFE that keeps the first entry per `(id, year)`. Since `data.js` loads first, its entries win (they include cash rates) and the resort dropdowns list each resort once. The footer is emitted by `extract_all_historical.py`, so regenerating preserves it.

### app.js
- `state` object tracks selections (resort, room type, year, month, check-in/out, rental rate, owner settings)
- Calendar renders a 7-column grid with points, cash rate, and day type per cell
- Summary panel shows totals with conditional sections based on available data
- Year-aware: `getResort()` filters by both `resortId` and `year`
- Calendar cells show a 🎉 badge (via `getEventsForDate()` in `data/disney_events.js`) for days with an EPCOT festival, hard-ticket party, or runDisney weekend, with a hover tooltip listing them — credited to Disney Food Blog
- The summary panel shows a "Resort Alerts" card (`buildResortAlertsHTML()`, sourced from `data/resort_construction.js`) whenever the selected resort has known ongoing/upcoming construction or refurbishment; entries overlapping the selected stay dates are called out with a "During your stay" badge. Alerts render *before* "Your Stay" while browsing (no dates picked yet) as a "consider this while picking a date" prompt, but move to *after* it once dates are selected, so they read as supporting context rather than the top-billed card
- "Booking As" (contract picker) and "Load Trip" (saved-itinerary picker) live in the top control bar (`#booking-as-control`/`#itinerary-load-control` in index.html) as real `initCustomSelect()`-driven custom-selects — same persistent-`<select>`-plus-styled-trigger component Resort/Room Type use, not a plain native `<select>` — so they match the theme and the trigger's fixed width (narrow for Load Trip) keeps long names from blowing out the control bar; the dropdown's option list still shows full names (wrapping, not truncating). `renderBookingAsControl()`/`renderItineraryLoadControl()` repopulate `contractSelect`/`itineraryLoadSelect`'s `<option>`s and call `._customSelectRender()` — the same one-time-`initCustomSelect()`-then-repopulate pattern as `populateRoomTypes()`/`roomSelect`, not a full innerHTML rebuild. The old "Points Year" dropdown was removed entirely — crossing a year boundary is only reachable by paging months now (`prevBtn`/`nextBtn` already handled that boundary; `state.year` is otherwise unchanged). Only the per-stay eligibility/points feedback (`buildContractEligibilityHTML()`) lives in the "Your Stay" card, not the top bar
- **Two-phase layout ("review mode")**: once a complete single-resort stay is picked, `isReviewMode()` (`!isSplitMode() && getStayDates().length > 0 && !forceExpandCalendar`) collapses the full calendar into a compact "trip rail" card (`renderTripRail()`, into `#trip-rail-view`) — resort/room, dates, a mini per-night points strip laid out as a real 7-column CSS grid with leading blank cells (so it lines up by day-of-week like the full calendar and every night stays equal-width, instead of a flex-wrap approach where a partial last row's items stretch to fill it), points, contract eligibility, then Edit dates/Clear Selection/Add Another Resort/Compare All Resorts/Save Itinerary all stacked together (the shared `buildStayActionButtonsHTML()` + `attachStayActionButtonListeners()` — also used by the normal `#action-buttons` slot in non-review layouts). The summary panel expands (`.summary-side.expanded`) into: Cost Comparison leading, then Stay Insights full-width (its `<h3>` and the "Find Alternatives" button share a `.card-header-row` — title left, button right, instead of the button stacked full-width below the card's content), then Booking Outlook and Crowd Forecast side by side in `.insights-columns`/`.insights-col`, stretched (`align-items: stretch` + `flex: 1` on the card) to match each other's height so the two boxes align, then Resort Alerts full-width below both (moved out of the columns specifically so its variable entry count can't fight that stretch) — its own entries lay out via `.resort-alert-list`'s `auto-fit`/`minmax(240px, 1fr)` grid, so multiple alerts sit two-up once the card's wide enough instead of always stacking single-file. No separate "Your Stay" card in review mode — the trip rail already covers it. `forceExpandCalendar` resets to `false` (re-collapsing) whenever a fresh stay gets completed or cleared; clicking the *current* check-in date again while a complete range is showing clears both dates outright (`handleDateClick()`) rather than re-priming checkIn to the same value, which would otherwise silently turn the next click into a checkout instead of a fresh check-in. Split-stay mode never enters review mode — the full calendar and original action-buttons placement stay unchanged there. `renderLayoutMode()` (tail of `renderCalendar()`/`renderSummary()`) toggles `#full-calendar-view`/`#trip-rail-view` visibility. The Cost Comparison "If booking through Disney" tile folds its own custom-rate input inline (`showCustomRateInput`/`showDisneyTile` in `renderSummary()`) rather than showing a separate input block above the tile grid — same `.cost-tile-rate-input` pattern the rental tile already used. That input is a fallback for resorts with NO published cash rate at all (non-WDW) — it doesn't appear for a resort that has real rate data, even if that number looks surprising; see `data/data.js`'s per-period `cashRates` for the actual stored Sun-Thu/Fri-Sat figures. The trip rail's mini strip also shows 2 dimmed/dashed "context" days just outside the stay on each end (computed fresh each render, so they always sit just past whatever the current edges are) — clicking one extends check-in/check-out to include it, and clicking the first or last *real* night removes it (shrinking that edge inward, or clearing the whole selection if it was a 1-night stay), all via `adjustTripEdge()`. Interior nights aren't clickable — removing one would split the stay into two ranges, which the single check-in/check-out model can't represent
- **Crowd Forecast** (`buildCrowdSummaryHTML()`) is a single compact line — `6 Busy · Range 3–8` — instead of two stacked rows, since the average and range are each one hover away from more detail rather than needing their own permanent row: hovering the average shows the exact (unrounded) mean across the stay; hovering the range shows every night's individual crowd score, mirroring the nightly-breakdown pattern used elsewhere (date + value rows). Both use the same instant `tooltip-anchor`/`tooltip-card` component as the rest of the app, not the native `title=""` attribute
- The "Find Alternatives" modal's "Also check other resorts" toggle (`state.altCrossResort`) reveals a second "WDW (Orlando) only" checkbox (`state.altWdwOnly`) that restricts cross-resort candidates to `NON_WDW_RESORT_IDS`-excluded resorts, same set and same filtering approach `compare.html`'s own WDW-only toggle uses. Only shown once cross-resort search is on — filtering by region is meaningless when the search is already scoped to a single resort
- Every `tooltip-anchor` (crowd/value/distribution hovers, calendar day cells, trip rail chips, booking outlook dots) gets its `cursor: pointer` and `user-select: none` from the shared base rule in `styles.css`/`compare.html`, not per-element — a bare span/div with text or an emoji directly inside it (a crowd number, a 🎉, a value-score badge) otherwise falls back to the browser's default text-select (I-beam) cursor on the glyph itself even with a pointer-cursor ancestor, since `cursor: auto` resolves per-content rather than by inheritance. Keeping it on the base class is what makes every hover in the app look and feel the same instead of drifting element by element

### changes.html (self-contained)
- Week navigator (prev/next) replaces the old 52-row table
- Multi-combo comparison: "+" button pins resort/room selections as colored series (max 4)
- `getAllCombos()` merges live selector combo with pinned combos, deduplicating
- Chart: SVG with per-year column hover zones → HTML tooltip showing all combos' values
- Y-axis uses nice-number algorithm for readable grid lines at any scale
- Colored chips below controls show pinned combos with × to remove

### compare.html (self-contained)
- "WDW (Orlando) only" checkbox (`state.wdwOnly`) filters the resort list to exclude `NON_WDW_RESORT_IDS` (aulani, hiltonHead, veroBeach, disneylandHotel, grandCalifornian) — that set already existed for the Booking Outlook seasonal-period logic, reused here for the resort filter too
- Owner cost and rental cost columns always show now — there's no "Show rental cost"/"Show owner cost" toggle anymore, since an owner might still rent out points (or vice versa), so hiding either column by default didn't serve anyone. `ownerCol`/`rentalCol` are just `true` in `render()` now rather than reading `state.ownerEnabled`/`state.rentalEnabled` (removed from state)
- Every column header explains itself on hover via `headerTooltipHTML(label, desc, align)`, the same `tooltip-anchor`/`tooltip-card` component used elsewhere — a `.header-tooltip` modifier resets `text-transform`/`white-space`/`letter-spacing` back to normal and widens the card to 210px, since those all otherwise inherit from `.compare-table th` (uppercase, nowrap) straight into the nested tooltip and silently overflow it instead of wrapping

---

## Future Feature Ideas

Sourced from DVC community forums (DISboards, DVCNews, Reddit r/dvcmember). Roughly prioritized by community demand.

| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 1 | Cross-resort date comparison | Pick dates, see point costs across all resorts side-by-side | Done |
| 2 | Optimal date finder | Given resort/room/# nights/date range, find the cheapest window | Not planned |
| 3 | Weekday/weekend optimization hints | Show "save X points by shifting check-in by 1 day" | Not planned |
| 4 | Split stay calculator | Model multi-segment stays across resorts to save points | Done |
| 5 | Banking/borrowing use year planner | Each contract shows its real next deadline in My Contracts. Contracts also track a manually-maintained points ledger, one row per use-year cycle (`contract_year_points` table, `db/migrations/007_add_contract_year_points_ledger.sql`, superseding migration 006's flat-columns approach) — edited as a small table in My Contracts (current + next year always shown, plus optional further-future rows via "+ Plan a year"), and the calendar's "Booking As" card shows what a selected stay would leave in the current year's balance. Use-year labels follow DVC's own convention (a cycle is labeled by its deposit year, not its expiration year — researched 2026-09-11). Reminder emails (Supabase Edge Functions + Resend, `supabase/functions/`) were deployed and verified live 2026-09-05 against `dvcalc.app`, with a daily `pg_cron` schedule — see `docs/phase5_deployment.md` | Done |
| 6 | Booking window indicator | Mark 11-month and 7-month booking window open dates on calendar | Done |
| 7 | Points budget reverse calculator | "I have X points — show me what I can book" — `suggest.html`, "Suggest a Stay," searches every resort/room for the longest stay a given budget affords in a target month, optionally scoped to resorts a signed-in user's contracts can actually book | Done |
| 8 | Year-over-year point changes | Highlight point increases/decreases between years | Done |
| 8a | Multi-resort YoY comparison | Pin up to 4 resort/room combos on the YoY chart to compare trends side-by-side | Done |
| 9 | True cost per night (ownership) | Factor in amortized purchase price + dues over remaining contract | Done |
| 10 | Cash value score | "Dollars saved per point" metric for each booking | Planned |
| 11 | Owner vs. rental / owner vs. cash savings tiles | Cost Comparison card used to show separate "Owner vs. cash" and "Owner vs. rental" savings tiles; removed 2026-08-28 to compact the card down to 3 tiles (Disney / Owner / Rental). Rental tile still shows rental-vs-cash savings inline. Could re-add owner-side savings as an optional expandable section. | Removed, could re-add |
| 12 | Saved trips / itineraries | Save a planned stay (single or split) from the calendar and reload it later | Done |
| 13 | Itinerary comparison | Compare up to 3 saved itineraries side by side: points, nights, cash value, $/point, crowd level | Done |
| 14 | Contract Value ("which resort should I buy") | Ranks all 17 resorts by long-term vacation value per dollar spent, given points/purchase type/years/growth-rate assumptions -- real resale &amp; direct pricing (`data/resort_investment.js`) and contract expiration dates, dues growth defaulting to each resort's own historical trend | Done |
| 15 | Hotel construction/refurbishment alerts | "Resort Alerts" card in the summary panel (`buildResortAlertsHTML()` in `app.js`, data in `data/resort_construction.js`) flags ongoing/upcoming construction for the selected resort, calling out entries that overlap the selected stay dates. Sourced from Disney Food Blog's DFB Disney World Calendar PDF, transcribed 2026-09-13 | Done |
| 16 | Special events overlay (festivals, hard-ticket parties, runDisney weekends) | 🎉 badge on calendar days with an active EPCOT festival, Halloween/Christmas party, or race weekend, with a hover tooltip (`getEventsForDate()` in `data/disney_events.js`). Sourced from the same DFB PDF as #15; only events with an explicit date range in the source were included | Done |
| 17 | High Crowds / Holiday Weekend flags | DFB's PDF also flags "High Crowds"/"Holiday Weekend" days inline on its calendar grid, separate from the Undercover Tourist crowd scores DVCalc already shows (#6 area). Skipped for now since it'd likely be redundant with the existing 1-10 crowd calendar | Not planned |
| 18 | "What's New" / permanently-closed park news | DFB's PDF has a "What Opened in [Year]" / "Permanently Closed in [Year]" editorial section (new attractions, lands, restaurants, store closures) by park/hotel. Skipped as out of scope for a points calculator — it's not date/booking-decision-relevant, and DFB's own guide would stay more current than a copy we'd have to keep re-syncing | Not planned |
