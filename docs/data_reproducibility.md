# Data Reproducibility Audit

Can every piece of data in `data.js` be reproduced from scratch? This document answers that question for each data set, rates the risk of data loss, and provides step-by-step recovery instructions.

Last audited: 2026-03-08

---

## Quick Summary

| Data Set | Reproducible? | Risk | Source |
|---|---|---|---|
| Points charts (17 resorts, 2 years) | Yes | Low | Official DVC PDFs |
| Historical points (all 17 resorts, 2016-2025) | Yes | Low | DVC Field Guide point-archive PDFs |
| Season date ranges (WDW) | Yes | Low | Same PDFs |
| Season date ranges (non-WDW) | Yes | Low | Same PDFs |
| Cash rack rates (11 WDW resorts) | Mostly | **Medium** | MouseSavers.com + manual mapping |
| Annual dues per point | Yes | Low | dvcresalemarket.com |
| Rental rate default | N/A | None | User-configurable slider |
| Availability confidence scores | Yes | **Medium** | DVC Field Guide PNG images + color extraction |

---

## 1. Points Charts

**What:** Nightly point costs per room type, per season, per day type (Sun-Thu / Fri-Sat). 17 resorts x 2 years (2026, 2027). This is the core data that drives the entire app.

**Source:** Official DVC points chart PDFs from Disney's CDN.

**How to reproduce:**
1. Run `scripts/fetch_pdf_urls.sh` — hits Disney's content API, lists all PDF URLs
2. Run `scripts/fetch_pdf_urls.sh --download` — saves all PDFs locally to `./pdfs/`
3. Open each PDF (1-2 pages with a tabular points chart)
4. Extract: room types, view categories, travel period date ranges, and point values
5. Cross-check: Weekly total should equal `(5 x Sun-Thu) + (2 x Fri-Sat)`
6. Add to `data.js` following existing patterns:
   - **WDW resorts** share season date ranges via `wdwPeriods(rates, cashRates)` (or `wdwPeriods2027()` etc). Pass an array of 7 rate objects in order: Adventure, Dream, Choice, Select, Preferred, Premier, Holiday.
   - **Non-WDW resorts** (Aulani, Hilton Head, Vero Beach, Disneyland Hotel, Grand Californian) define their own period structures inline since they have different season names and dates.
   - If WDW season dates shift year-to-year (Easter/Thanksgiving), create a new helper (e.g., `wdwPeriods2028()`) with adjusted dates.

**Resort PDF codes:**

| Code | Resort |
|------|--------|
| AKV / AKV2 | Animal Kingdom Villas |
| BLT | Bay Lake Tower |
| BCV | Beach Club Villas |
| BWALK | BoardWalk Villas |
| VWL-BRV | Boulder Ridge |
| WCC-CCVC | Copper Creek |
| CFW | Fort Wilderness Cabins |
| VGF | Grand Floridian |
| CLUB-OKW | Old Key West |
| POLYV | Polynesian |
| RVA | Riviera |
| SSR | Saratoga Springs |
| AULV | Aulani |
| HH | Hilton Head |
| VERO | Vero Beach |
| VDH | Disneyland Hotel |
| GCAL-VGC | Grand Californian |

**Backup source:** If Disney's API changes, dvcnews.com hosts the same charts:
- Page URL pattern: `https://dvcnews.com/wdw-resorts/{resort-slug}/{code}-points-chart`
- Image URL pattern: `https://dvcnews.com/images/stories/{code}/points/{Resort-Name}-DVC-Points-Chart-{year}.jpg`

**Risk:** Low. Multiple sources, automated fetch script, well-documented extraction process.

---

## 1b. Historical Points Charts

**What:** Historical nightly point costs for all 17 DVC resorts, 2016-2027 (or from each resort's opening year). 182 resort-year entries covering all room types. Stored in `data_historical.js`.

**Source:** DVC Field Guide point-archive at `https://dvcfieldguide.com/point-archive`. These are the same official Disney PDFs, hosted by a third-party archive.

**Period structure changes:**
- **2016-2020:** 5 named periods (Adventure, Choice, Dream, Magic, Premier) for WDW resorts
- **2021+:** 7 unnamed periods (assigned names: Adventure, Dream, Choice, Select, Preferred, Premier, Holiday)
- **Transitional years:** Some resorts have 3, 4, or 6 periods in certain years
- **Non-WDW:** Aulani uses flat SUN-SAT rates; HHI, VBR, GCV, VDH have unique period structures

**Column count variations by resort:**
| Resort | Column Count(s) | Notes |
|--------|-----------------|-------|
| AKV | 14 | Standard/Resort/Savanna/Club across studio/1BR/2BR/3BR |
| AUL | 15 | Flat rate (SUN-SAT, no weekday/weekend split) |
| BCV | 3 | |
| BLT | 11 | |
| BRV | 3 | |
| BWV | 7 | |
| CCV | 5 | |
| CFW | 1 | Single cabin room type |
| GCV | 4 | |
| HHI | 4 | |
| OKW | 4 | |
| PVB | 3 or 17 | 3 cols pre-2025, 17 cols 2025+ (tower rooms added) |
| RIV | 8 | Data starts 2020 (resort opened 2019) |
| SSR | 5 or 9 | 5 cols in 2016, 9 cols 2017+ (Standard/Preferred split added) |
| VBR | 6 | |
| VDH | 7 or 9 | Data starts 2023 (DVC opened 2023); 7 in 2023, 9 in 2024+ |
| VGF | 7 or 10 | 7 cols pre-2022, 10 cols 2022+ (resort view added) |

**How to reproduce:**

1. Download all PDFs:
   ```bash
   bash scripts/download_historical_pdfs.sh
   ```
   This downloads ~184 PDFs to `pdfs/{resort}_archive/{resort}_{year}.pdf`. Idempotent (skips existing files).

2. Extract all historical data:
   ```bash
   /Library/Developer/CommandLineTools/usr/bin/python3 scripts/extract_all_historical.py pdfs/ --max-year 2027
   ```
   Output is written to stdout as JavaScript. Redirect to `data/data_historical.js`:
   ```bash
   /Library/Developer/CommandLineTools/usr/bin/python3 scripts/extract_all_historical.py pdfs/ --max-year 2027 > data/data_historical.js
   ```

3. Optional flags:
   - `--resort akv` — extract a single resort
   - `--min-year 2020` — skip years before 2020
   - `--max-year 2027` — skip years after 2027
   - `--json` — output JSON instead of JavaScript

**Extraction script details:** `scripts/extract_all_historical.py` uses `pdfplumber` to extract text from PDFs, then parses SUN-THU / FRI-SAT (or SUN-SAT for Aulani) rate lines and date ranges. It contains `RESORT_CONFIGS` with room type mappings for every resort at every column count, auto-detects the column count from rate lines, and handles all format variations including PDF text artifacts (e.g., spaced-out "F R I — S A T").

**Known gaps:**
- **BWV 2018:** Image-based PDF (no extractable text). Would require OCR.
- **PVB 2016:** Image-based PDF (no extractable text). Would require OCR.

**2026/2027 overlap:** The historical extraction also generates 2026/2027 entries for all resorts, duplicating the `data.js` entries for those years. `data_historical.js` therefore ends with a `dedupeResorts()` IIFE that keeps the first entry per `(id, year)` — `data.js` loads first, so its entries win (they include cash rates) and the resort dropdowns list each resort once. The footer is emitted by `extract_all_historical.py`, so regenerating the file preserves it.

**Legacy script:** `scripts/extract_historical.py` is the original AKV-only extraction script. It still works but is superseded by `extract_all_historical.py`.

**Risk:** Low. PDFs are archived on Field Guide. Download and extraction are fully automated with validation (period count and column count reported per resort-year).

---

## 2. Season Date Ranges

### WDW Resorts (shared seasons)

**What:** The 7 travel periods (Adventure, Dream, Choice, Select, Preferred, Premier, Holiday) with their date ranges. All 12 WDW resorts share the same period structure; only points differ.

**Source:** Embedded in the DVC points chart PDFs. Each PDF header shows which date ranges map to which period.

**How to reproduce:** Extract date ranges from any WDW resort's PDF. The `wdwPeriods()` helper in `data.js` encodes these once and reuses them across all WDW resorts.

**Year-to-year changes:** Easter and Thanksgiving shift each year, which changes Premier and Holiday period dates. When adding a new year, create a new helper (e.g., `wdwPeriods2028()`) with adjusted dates. Only Preferred, Premier, and Holiday typically change.

**Risk:** Low. Dates are clearly printed on every PDF.

### Non-WDW Resorts (unique seasons)

**What:** Aulani, Hilton Head, Vero Beach, Disneyland Hotel, and Grand Californian each have their own unique season names and date ranges (not the standard WDW 7-period system).

**Source:** Same DVC PDFs, but each resort defines its own periods inline in `data.js`.

**How to reproduce:** Read each non-WDW resort's PDF and extract the period names, date ranges, and rates.

**Risk:** Low.

---

## 3. Cash Rack Rates — THE WEAK SPOT

**What:** Estimated nightly Disney cash price per room type, per season, for all 12 WDW resorts (Animal Kingdom Villas fixed 2026-08-30 — see below). Used to calculate savings vs. DVC points. Includes 12.5% Florida tax.

**Source:** MouseSavers.com — a fan site that tracks Disney room rates across ~27 micro-seasons per year.

**Why this is the hardest data to reproduce:**
- MouseSavers uses ~27 micro-seasons; DVC uses 7. The mapping requires **manual judgment**.
- Some DVC periods span multiple MouseSavers seasons, requiring averages.
- MouseSavers room names don't always match DVC room type IDs.
- Different people may make slightly different mapping choices.

### MouseSavers URLs

- Hub: `https://www.mousesavers.com/{year}-disney-world-room-rates-season-dates/`
- Per-resort pattern: `https://www.mousesavers.com/{year}-{resort-slug}-room-rates-season-dates/`

Resort URL slugs (the two AKV slugs are listed for completeness but were never used — see
"Animal Kingdom Villas — missing entirely" below):
```
animal-kingdom-villas-jambo-house      (UNUSED)
animal-kingdom-villas-kidani-village   (UNUSED)
bay-lake-tower
beach-club-villas
boardwalk-villas
wilderness-lodge          (covers Boulder Ridge + Copper Creek)
fort-wilderness-cabins-campsites
grand-floridian
old-key-west
polynesian-village
riviera-resort
saratoga-springs
```

### MouseSavers → DVC Period Mapping

This is the key mapping. Documented in `data.js` above `wdwPeriods()`.

| # | DVC Period | MouseSavers Row Used | Method |
|---|------------|---------------------|--------|
| 0 | Adventure (Sep) | "Sep 11 - Oct 1" (Fall 1) | Direct — dates overlap |
| 1 | Dream (Jan, early May) | "Jan 20 - Feb 4" (Value) | Direct — representative low season |
| 2 | Choice (May-Jun, Dec 1-23) | Average of Dream row + Select row | Calculated — transitional period |
| 3 | Select (Feb, Jun-Aug) | "Jul 5 - Aug 13" (Summer 2) | Direct — peak summer rates |
| 4 | Preferred (Oct-Nov) | "Oct 5 - Nov 24" (Fall 2) | Direct — dates overlap |
| 5 | Premier (Feb-Mar, Apr, Thanksgiving) | "Mar 6 - 28" (Spring) | Direct — spring break rates |
| 6 | Holiday (Easter, Dec 24-31) | Average of Easter row + Holiday row | Calculated — same rate for Sun-Thu & Fri-Sat |

### Rate Processing Rules

- **Tax:** Multiply MouseSavers pre-tax rates by **1.125** (12.5% FL tax)
- **Sun-Thu:** Use MouseSavers "Sun-Wed" column (closest match to DVC's Sun-Thu)
- **Fri-Sat:** Use MouseSavers "Fri-Sat" column
- **Holiday:** Use the same rate for both `sunThu` and `friSat` (no day-of-week variance on MouseSavers for holiday periods)
- **Rounding:** Round to nearest whole dollar after applying tax

### How to Add Cash Rates to data.js

Pass a second array to `wdwPeriods(rates, cashRates)`:
```javascript
travelPeriods: wdwPeriods([
  // 7 rate objects (points)...
], [
  // 7 cashRate objects, same period order (Adventure through Holiday):
  { sunThu: { roomTypeId: amount, ... }, friSat: { roomTypeId: amount, ... } },
  // ...
]),
```

Room type IDs in `cashRates` must match the resort's `roomTypes[].id`.

### Room Type ID Mapping

Each resort has its own room type IDs in `data.js`. When extracting MouseSavers data, map their room names to the IDs used in the resort's `roomTypes[]` array. Common patterns:

- "Standard View" → `dsV` or similar
- "Theme Park View" → `dsTP`
- "Savanna View" → `dsSV`
- "Club Level" → `dsC`

If MouseSavers doesn't list a room type (common for Club Concierge), omit it from `cashRates` — `getCashRateForDate()` returns null gracefully.

### Non-WDW Resorts (no cash data)

These 5 resorts have **no built-in cash rates** because MouseSavers only covers WDW:
- Aulani, Hilton Head, Vero Beach, Disneyland Hotel, Grand Californian

The app handles this with:
- A "No cash rate data" note
- A manual "Compare to your own rate" input
- `getCashRateWithFallback()` which tries prior-year data for 2027 resorts

Potential future sources: Disney's booking site (requires browser automation), Touring Plans (paid), or manual price checks.

### Animal Kingdom Villas — fixed 2026-08-30

AKV now has a real `data.js` entry for 2026: points copied from the generated
`data_historical.js` entry, cash rates read directly from the raw MouseSavers Jambo House +
Kidani Village HTML tables (not a summarized fetch, to avoid misreading the unlabeled
Sun-Wed/Thu/Fri-Sat multi-price cells). Views offered by both buildings (dsR, dsSV, oneR,
oneSV, threeSV) are averaged across the two pages; Value and Club Concierge views only exist
at Jambo House. Neither building lists a 2-Bedroom Value or Club Concierge rate, so `twoV`/
`twoC` are omitted from `cashRates` — `getCashRateForDate()` already handles missing room
types gracefully.

**2027 was deliberately left without a `data.js` entry.** MouseSavers' 2027 AKV pages don't
yet publish rates past late November, so there's no real Dec 24-31 "Holiday" row to average
against Easter for the mapping. AKV 2027 still comes from the generated `data_historical.js`
for points, and `getCashRateWithFallback()` automatically pulls 2026's cash rates as a
prior-year fallback (same mechanism already used elsewhere) until MouseSavers publishes the
rest of 2027.

**To refresh for a future year:** re-read the raw `<table>` rows from both MouseSavers pages
(see the Jambo House page's own note: 2 prices = Sun-Thu/Fri-Sat, 3 prices = Sun-Wed/Thu/
Fri-Sat), average overlapping views across Jambo House + Kidani Village, and apply the same
7-period mapping documented above `wdwPeriods()` in `data.js`.

---

## 4. Annual Dues Per Point

**What:** `DUES_PER_POINT` object — 17 values, one per resort. Used to calculate owner cost.

**Source:** https://www.dvcresalemarket.com/buying/annual-dues/

**How to reproduce:** Visit the page, copy the 17 per-point dues values, update `DUES_PER_POINT` in `data.js`. Usually announced Q4 of the prior year.

**Backup source:** https://dvcnews.com/dvc-program/financial/annual-dues

**Risk:** Low. Single page, 17 numbers, trivially reproducible.

---

## 5. Rental Rate

**What:** Default $20/pt, user-adjustable via slider ($15-$25 range). Represents the per-point price to rent DVC points from a broker.

**Source:** Market observation. As of early 2026, rates from David's Vacation Club Rentals and similar brokers are $19-$22/pt.

**How to reproduce:** Not data-driven — it's a user-configurable input with a sensible default.

**Risk:** None.

---

## 6. Utility Functions

**What:** `getTravelPeriod()`, `getPointsForDate()`, `getCashRateForDate()`, `getCashRateWithFallback()`, `getDayType()`

**Source:** Application logic, no external data.

**Key behaviors:**
- `getDayType()`: Fri (day 5) and Sat (day 6) = "friSat", all others = "sunThu"
- `getCashRateWithFallback()`: For resorts with no cash data in the current year, falls back to prior year by matching period name (e.g., "Adventure" → "Adventure"). Returns `{ rate, isPriorYear: true }` so the UI can annotate it.

**Risk:** None — pure code.

---

## 7. Availability Confidence Scores

**What:** `AVAILABILITY_DATA` in `availability_data.js` — historical booking availability for 17 resorts, 129 room types, across 6-8 Key Dates periods and 5 booking windows (11Mo, 7Mo, 5Mo, 3Mo, 1Mo). Values are 0.0-7.0 representing average days available per week. Displayed in the app as a "Booking Outlook" badge (Excellent/Good/Fair/Low/Very Low).

**Source:** DVC Field Guide availability table charts at https://dvcfieldguide.com/availability-tables. These are **PNG images** (not HTML tables) hosted on Squarespace CDN. Values are encoded as cell background hue (red→green gradient = 0→7).

**Risk: Medium.** Fully automated extraction pipeline, but depends on the DVC Field Guide site remaining online with the same image format. If the site changes layout or color scheme, the extraction scripts will need recalibration.

### How to Reproduce

The extraction is a 3-step pipeline. All scripts are stored in `/tmp/` (not in the repo) but are documented here for reproducibility.

#### Prerequisites

- Python 3.9+ with Pillow (`pip install Pillow`)
- System Python at `/Library/Developer/CommandLineTools/usr/bin/python3` has Pillow pre-installed on macOS
- `curl` for downloads

#### Step 1: Download Images

**Script:** `/tmp/download_dvc_images.sh`

This script:
1. Reads slug names from `/tmp/dvc_slugs.txt` (169 slugs, one per line)
2. For each slug, fetches the HTML page at `https://dvcfieldguide.com/availability-tables/{slug}`
3. Extracts the Squarespace CDN image URL from the page source
4. Downloads the PNG image to `/tmp/dvc_images/{slug}.png`

**Slug list source:** The 169 slugs come from the availability tables page. Each slug corresponds to one resort/room-type/view combination on the field guide (e.g., `akv-j-s-value1`, `blt-s-standard43`, `poly-tower-studio-resort`).

All images are consistently 2500x4107 pixels.

```bash
# Generate the slug list (scrape the main page for links):
# Visit https://dvcfieldguide.com/availability-tables
# Extract all href values ending with slug patterns
# Save to /tmp/dvc_slugs.txt

# Download all images (takes ~20 minutes):
bash /tmp/download_dvc_images.sh
```

#### Step 2: Extract Availability Values from Images

**Script:** `/tmp/extract_availability_v4.py`

This script reads each PNG image and extracts availability values using **pixel color analysis** (no OCR needed). The technique:

1. **Find the Key Dates table** — Scans the bottom portion of each image for a light blue header row (R>190, G>210, B>230, B>R, B-R>15). The table is located at approximately x=64%, y=55-80% of image dimensions.

2. **Detect column boundaries** — Scans horizontally near the top of the blue header (avoiding text) to find 7 dark pixel transitions (column borders). Columns are: Label, 11Mo, 7Mo, 5Mo, 3Mo, 1Mo.

3. **Detect row boundaries** — Scans vertically for horizontal grid lines in the data area. WDW resorts have 8 rows, non-WDW have 6.

4. **Sample cell background color** — For each cell, samples a 9x9 pixel patch offset (-20, -15) from center to avoid hitting digit text. Takes the median color.

5. **Convert hue to value** — Uses a 25-point calibration curve mapping hue (0°→136°) to availability (0.0→7.0). Red hue ≈ 0 days available, green hue ≈ 7 days available.

**Calibration points** (hue → value):
```
(-1.0, 0.0), (3.0, 0.3), (4.0, 0.4), (5.0, 0.5), (6.0, 0.6), (8.0, 0.6),
(9.0, 0.7), (14.0, 1.1), (19.0, 1.4), (21.0, 1.6), (23.0, 1.7), (24.0, 1.9),
(29.0, 2.1), (31.0, 2.3), (32.0, 2.4), (34.0, 2.5), (60.0, 4.1), (70.0, 4.7),
(72.0, 4.7), (74.0, 4.8), (83.0, 5.2), (98.0, 5.7), (130.0, 6.8), (131.0, 6.8),
(136.0, 7.0)
```

These were calibrated by reading known values from the AKV-K and BLT charts visually and fitting hue readings to the displayed numbers. Average error: 0.04 days, max error: <0.5 days.

**Non-WDW detection:** Resorts with slug prefixes `aul-`, `gcv-`, `dlh-`, `hhi-`, `vbr-` are non-WDW and have 6 Key Dates periods (no Marathon, no Food & Wine).

```bash
/Library/Developer/CommandLineTools/usr/bin/python3 /tmp/extract_availability_v4.py
# Output: /tmp/dvc_availability_data.json (169 entries)
```

#### Step 3: Map and Clean to Final JS

**Script:** `/tmp/build_availability_js.py`

This script:
1. Maps 169 field guide slugs to app resort/room type IDs via a `SLUG_TO_APP` dictionary
2. Removes "phantom rows" — rows with all values ~0.1 (from reading beyond the actual table in non-WDW images that have fewer rows)
3. Relabels periods for non-WDW resorts (6 periods: newYears, presidents, easter, summer, thanksgiving, christmas)
4. Averages duplicates where multiple field guide entries map to the same app room type (e.g., lock-off vs dedicated 2BR, Jambo vs Kidani for the same view category)
5. Outputs `availability_data.js`

```bash
/Library/Developer/CommandLineTools/usr/bin/python3 /tmp/build_availability_js.py
# Output: availability_data.js (17 resorts, 129 room types)
```

### Key Dates Periods

| Period | WDW? | Non-WDW? | Calendar Months |
|--------|------|----------|----------------|
| newYears | Yes | Yes | Dec 25 - Jan 5 |
| marathon | Yes | No | Jan 6-31 (Marathon Weekend) |
| presidents | Yes | Yes | Feb (Presidents' Day) |
| easter | Yes | Yes | Mar-Apr (Easter/Spring Break) |
| summer | Yes | Yes | May-Aug |
| foodAndWine | Yes | No | Sep-Oct (Epcot festival) |
| thanksgiving | Yes | Yes | Nov |
| christmas | Yes | Yes | Dec 1-24 |

### Confidence Labels (in app.js)

The raw score means "average consecutive days available for booking" at that window during that period. Confidence is determined by comparing the score to the stay length (ratio = score / stayLength):

| Label | Ratio | Example |
|-------|-------|---------|
| Excellent | >= 1.5 | Score 6.0, 3-night stay (ratio 2.0) — opening is much larger than your stay |
| Good | >= 1.0 | Score 7.0, 7-night stay (ratio 1.0) — opening fits your stay |
| Fair | >= 0.5 | Score 4.0, 7-night stay (ratio 0.57) — opening is about half your stay |
| Low | >= 0.2 | Score 1.5, 7-night stay (ratio 0.21) — opening is much smaller |
| Very Low | < 0.2 | Score 0.5, 7-night stay (ratio 0.07) — nearly impossible |

A score of 0.1 or below is always "Very Low" regardless of stay length.

For multi-night stays, the app uses the **minimum** score across all nights (worst-case night determines booking difficulty).

### Slug-to-App-ID Mapping

The full mapping (169 slugs → 129 room types across 17 resorts) is defined in the `SLUG_TO_APP` dictionary in `/tmp/build_availability_js.py`. Key patterns:

- **AKV:** Jambo (`akv-j-*`) and Kidani (`akv-k-*`) map to the same `animalKingdomVillas` resort; overlapping room types are averaged
- **Poly Tower:** New room types (`poly-tower-*`) including duo studios, penthouses
- **Non-WDW:** Aulani (`aul-*`), Grand Californian (`gcv-*`), Disneyland Hotel (`dlh-*`), Hilton Head (`hhi-*`), Vero Beach (`vbr-*`)
- **Lock-off vs dedicated 2BR:** Both map to the same room type ID and are averaged

### Known Issues

- `vbr-3-br-141` (Vero Beach cottage) had a corrupted download in the initial batch but was mapped successfully in later runs
- The calibration curve was built from WDW resort images; non-WDW images use the same color scheme so the same curve applies

---

## Recovery Checklist

If starting from zero, reproduce in this order:

1. **Points charts** — Run `scripts/fetch_pdf_urls.sh --download`, extract all PDFs
2. **Historical points** — Run `scripts/download_historical_pdfs.sh`, then `scripts/extract_all_historical.py pdfs/ --max-year 2027 > data/data_historical.js`
3. **Season dates** — Read from the same PDFs
4. **Dues** — Visit dvcresalemarket.com, copy 17 numbers
5. **Cash rates** — Visit MouseSavers, apply mapping above, multiply by 1.125 for tax
6. **Availability data** — Download Field Guide images, run extraction scripts (Steps 1-3 above in Section 7)
7. **Verify** — Spot-check a few resorts against the live DVC and MouseSavers sites

---

## Updating for a New Year

1. Fetch and extract new points charts (run `scripts/fetch_pdf_urls.sh --download`)
2. Download new historical PDFs from Field Guide when available (`scripts/download_historical_pdfs.sh` — add new URLs to the script first)
3. Re-extract historical data: `scripts/extract_all_historical.py pdfs/ --max-year YYYY > data/data_historical.js`
4. Get new cash rates from MouseSavers (usually published late Q4)
5. Update dues from dvcresalemarket.com (announced Q4)
6. Re-run availability extraction if Field Guide has updated their charts (Steps 1-3 in Section 7)
7. Add new resort entries to `RESORTS[]` with `year: YYYY`
8. If WDW season dates shift (Easter/Thanksgiving), create a new helper (e.g., `wdwPeriods2028()`)
9. 2027 resorts without cash data will automatically fall back to 2026 rates via `getCashRateWithFallback()`
