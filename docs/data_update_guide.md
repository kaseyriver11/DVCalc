# Data Update Guide

Detailed instructions for updating DVC Points Calendar data year-over-year.

---

## 1. DVC Points Charts

**Source:** Official DVC PDFs from Disney's CDN
**Current data:** 2026 + 2027 (all 17 resorts — but only 16 come from `data.js`; Animal
Kingdom Villas is supplied by the generated `data_historical.js`, so it has no cash rates)

### Fetching PDF URLs

Run `scripts/fetch_pdf_urls.sh` to get all available PDF links from Disney's content API. Use `--download` to save them locally. See the script header for details.

### Resort PDF codes (Disney CDN naming)

| Code | Resort |
|------|--------|
| AKV / AKV2 | Animal Kingdom Villas |
| BLT | Bay Lake Tower |
| BCV | Beach Club Villas |
| BWALK | BoardWalk Villas |
| VWL-BRV | Boulder Ridge Villas |
| WCC-CCVC | Copper Creek Villas & Cabins |
| CFW | Fort Wilderness Cabins |
| VGF | Grand Floridian Villas |
| CLUB-OKW | Old Key West |
| POLYV | Polynesian Villas & Bungalows |
| RVA | Riviera Resort |
| SSR | Saratoga Springs |
| AULV | Aulani (Hawaii) |
| HH | Hilton Head Island |
| VERO | Vero Beach |
| VDH | Disneyland Hotel |
| GCAL-VGC | Grand Californian |

### Extracting data from PDFs

Each PDF is 1-2 pages with a points chart table. Use Claude's multimodal PDF reading to extract:
- Travel period date ranges
- Room types and view categories
- Sun-Thu and Fri-Sat point values per period per room type
- Cross-check: Weekly = 5 x Sun-Thu + 2 x Fri-Sat

### Adding to data.js

Follow the existing pattern in `src/data.js`:
- **WDW resorts** share the same 7 season date ranges via `wdwPeriods(rates, cashRates)` (or `wdwPeriods2027()` etc). Pass an array of 7 rate objects in order: Adventure, Dream, Choice, Select, Preferred, Premier, Holiday.
- **Non-WDW resorts** (Aulani, Hilton Head, Vero Beach, Disneyland Hotel, Grand Californian) define their own period structures inline since they have different season dates and names.
- If WDW season dates shift (Easter/Thanksgiving), create a new helper (e.g., `wdwPeriods2028()`).

### Alternative source (images, not PDFs)

If the API is unavailable, dvcnews.com hosts points charts as JPEG images:
- URL pattern: `https://dvcnews.com/wdw-resorts/{resort-slug}/{code}-points-chart`
- Images at: `https://dvcnews.com/images/stories/{code}/points/{Resort-Name}-DVC-Points-Chart-{year}.jpg`

---

## 2. Disney Cash Rack Rates (WDW only)

**Source:** MouseSavers.com
**Current data:** 2026 rates for 11 of the 12 WDW DVC resorts (Animal Kingdom Villas is
missing — see "Non-WDW resorts" below)

### Where to find the data

- **Hub page:** `https://www.mousesavers.com/{year}-disney-world-room-rates-season-dates/`
- **Individual resort pages:** Follow links from the hub. URL pattern: `https://www.mousesavers.com/{year}-{resort-name}-room-rates-season-dates/`

Example URLs (substitute year as needed):
- `.../2026-animal-kingdom-villas-jambo-house-room-rates-season-dates/` (never scraped)
- `.../2026-animal-kingdom-villas-kidani-village-room-rates-season-dates/` (never scraped)
- `.../2026-bay-lake-tower-room-rates-season-dates/`
- `.../2026-beach-club-villas-room-rates-season-dates/`
- `.../2026-boardwalk-villas-room-rates-season-dates/`
- `.../2026-wilderness-lodge-room-rates-season-dates/` (Boulder Ridge + Copper Creek)
- `.../2026-fort-wilderness-cabins-campsites-room-rates-season-dates/`
- `.../2026-grand-floridian-room-rates-season-dates/`
- `.../2026-old-key-west-room-rates-season-dates/`
- `.../2026-polynesian-village-room-rates-season-dates/`
- `.../2026-riviera-resort-room-rates-season-dates/`
- `.../2026-saratoga-springs-room-rates-season-dates/`

### MouseSavers-to-DVC period mapping

MouseSavers uses ~27 micro-seasons. The mapping used:

| DVC Period | MouseSavers Season | Rationale |
|------------|-------------------|-----------|
| Adventure (Sep) | "Sep 11 - Oct 1" (Fall 1) | Direct date overlap |
| Dream (Jan, early May) | "Jan 20 - Feb 4" (Value) | Representative value season |
| Choice (mid May-Jun, Dec 1-23) | Average of Dream & Select | Transitional period |
| Select (Feb 1-15, Jun-Aug) | "Jul 5 - Aug 13" (Summer 2) | Peak summer |
| Preferred (Oct-Nov) | "Oct 5 - Nov 24" (Fall 2) | Direct date overlap |
| Premier (Feb-Mar, Apr, Thanksgiving) | "Mar 6 - 28" (Spring) | Spring break rates |
| Holiday (Easter week, Dec 24-31) | Average of Easter & Holiday | Peak holiday |

### Rate format

- Rates include **12.5% tax** (MouseSavers lists pre-tax; multiply by 1.125)
- `sunThu` uses the Sun-Wed column (closest to DVC's Sun-Thu)
- `friSat` uses the Fri-Sat column
- Holiday period uses same rate for both (no day-of-week variance)

### How to add cash rates

Pass a second array to `wdwPeriods(rates, cashRates)`:
```javascript
travelPeriods: wdwPeriods([
  // 7 rate objects (points)...
], [
  // 7 cashRate objects, same period order:
  { sunThu: { roomTypeId: amount, ... }, friSat: { roomTypeId: amount, ... } },
  // ...
]),
```

Room type IDs in cashRates must match the resort's `roomTypes[].id`. If MouseSavers doesn't list a room type, omit it — `getCashRateForDate()` returns null gracefully.

### Resorts with no cash rate data

These 5 resorts don't have built-in cash rates (MouseSavers only covers WDW):
- Aulani, Hilton Head, Vero Beach, Disneyland Hotel, Grand Californian

**Animal Kingdom Villas** is a sixth, for a different reason: it has no entry in `data.js` at
all, so it gets neither points nor cash rates from there (the generated `data_historical.js`
supplies its points). MouseSavers does cover AKV. See the "Animal Kingdom Villas — missing
entirely" section of `data_reproducibility.md` for what adding it involves.

The app handles all of these by hiding the cash column and offering a manual "compare to your own rate" input. Potential future sources: Disney's booking site (requires browser automation), Touring Plans (paid), or manual price checks.

---

## 3. Annual Dues Per Point

**Source:** https://www.dvcresalemarket.com/buying/annual-dues/
**Current data:** 2026 dues for all 17 resorts

Update the `DUES_PER_POINT` object at the top of `data.js`. Usually announced Q4 of the prior year.

**Alternative:** DVCNews at `https://dvcnews.com/dvc-program/financial/annual-dues`

---

## 4. Rental Rates

**Source:** Market observation (not a single URL)
**Current data:** Configurable slider, $15-$25/pt, default $20

Represents the per-point price to rent DVC points from a broker (David's, DVC Rental Store, etc.). As of early 2026, market rates are $19-$22/pt.
