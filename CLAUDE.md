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
All 17 DVC resorts are selectable for 2026 and 2027. Note that `data.js` only defines 16 of them — Animal Kingdom Villas has no `data.js` entry, so its 2026/2027 points come from the generated `data_historical.js` and it has **no cash rates**. Cash rates cover 11 resorts (the 12 WDW resorts minus AKV); the 5 non-WDW resorts never had them since MouseSavers is WDW-only.

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

### changes.html (self-contained)
- Week navigator (prev/next) replaces the old 52-row table
- Multi-combo comparison: "+" button pins resort/room selections as colored series (max 4)
- `getAllCombos()` merges live selector combo with pinned combos, deduplicating
- Chart: SVG with per-year column hover zones → HTML tooltip showing all combos' values
- Y-axis uses nice-number algorithm for readable grid lines at any scale
- Colored chips below controls show pinned combos with × to remove

---

## Future Feature Ideas

Sourced from DVC community forums (DISboards, DVCNews, Reddit r/dvcmember). Roughly prioritized by community demand.

| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 1 | Cross-resort date comparison | Pick dates, see point costs across all resorts side-by-side | Done |
| 2 | Optimal date finder | Given resort/room/# nights/date range, find the cheapest window | Not planned |
| 3 | Weekday/weekend optimization hints | Show "save X points by shifting check-in by 1 day" | Not planned |
| 4 | Split stay calculator | Model multi-segment stays across resorts to save points | Done |
| 5 | Banking/borrowing use year planner | Timeline of point availability, deadlines, expiration by use year | Planned |
| 6 | Booking window indicator | Mark 11-month and 7-month booking window open dates on calendar | Done |
| 7 | Points budget reverse calculator | "I have X points — show me what I can book" | Planned |
| 8 | Year-over-year point changes | Highlight point increases/decreases between years | Done |
| 8a | Multi-resort YoY comparison | Pin up to 4 resort/room combos on the YoY chart to compare trends side-by-side | Done |
| 9 | True cost per night (ownership) | Factor in amortized purchase price + dues over remaining contract | Planned |
| 10 | Cash value score | "Dollars saved per point" metric for each booking | Planned |
