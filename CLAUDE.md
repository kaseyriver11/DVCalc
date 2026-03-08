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
src/
├── index.html      # Main page layout
├── styles.css      # All styling
├── data.js         # Resort data, points charts, cash rates, dues
└── app.js          # Application logic, rendering, event handlers
scripts/
└── fetch_pdf_urls.sh   # Fetches DVC points chart PDF URLs from Disney's API
docs/
└── data_update_guide.md  # Detailed instructions for updating all data sources
```

## Key Features
1. Searchable resort selector dropdown (alphabetical)
2. Room type selector (dynamic per resort)
3. Year selector (2026, 2027)
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
All 17 DVC resorts included for 2026 and 2027. See `data.js` for the full list.

---

## Data Sources

For detailed update instructions, see [`docs/data_update_guide.md`](docs/data_update_guide.md).

| Data | Source | How to Update |
|------|--------|---------------|
| Points charts | Official DVC PDFs from Disney's CDN | Run `scripts/fetch_pdf_urls.sh` to get URLs, extract values from PDFs, add to `data.js` |
| Cash rack rates | MouseSavers.com (WDW only) | Scrape rate tables, map to DVC periods, add as `cashRates` in `wdwPeriods()` |
| Annual dues | dvcresalemarket.com | Update `DUES_PER_POINT` in `data.js` |
| Rental rates | Market observation | Slider is user-configurable ($15-$25/pt) |

### Updating for a new year
1. Fetch and extract new points charts (see guide)
2. Get new cash rates from MouseSavers (usually published late Q4)
3. Update dues from dvcresalemarket.com (announced Q4)
4. Add new resort entries to `RESORTS[]` with `year: YYYY`
5. If WDW season dates shift (Easter/Thanksgiving), create a new helper (e.g., `wdwPeriods2028()`)

---

## Architecture Notes

### data.js
- `DUES_PER_POINT` — annual dues by resort ID
- `wdwPeriods(rates, cashRates)` / `wdwPeriods2027()` — helpers that create travel period objects for WDW resorts (shared season dates)
- `RESORTS[]` — array of resort objects with `id`, `name`, `year`, `roomTypes[]`, `travelPeriods[]`
- Lookup functions: `getTravelPeriod()`, `getPointsForDate()`, `getCashRateForDate()`

### app.js
- `state` object tracks selections (resort, room type, year, month, check-in/out, rental rate, owner settings)
- Calendar renders a 7-column grid with points, cash rate, and day type per cell
- Summary panel shows totals with conditional sections based on available data
- Year-aware: `getResort()` filters by both `resortId` and `year`
