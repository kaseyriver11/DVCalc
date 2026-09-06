# DVC Points Calendar — Development Plan

## Goal
Build a single-page web app that shows a calendar view of DVC point costs per night, lets users select nights, and shows total points + cash cost.

---

## Architecture Decision: Vanilla HTML/CSS/JS

No framework needed. This is a self-contained tool with:
- A few dropdowns
- A calendar grid
- Some click handlers
- A running total

A single `index.html` file (with embedded CSS/JS or separate files) keeps it simple, portable, and easy to host anywhere (GitHub Pages, Netlify, or just open the file locally).

---

## Data Model

### Points Data Structure (extracted from PDF)
```
Resort
  └── Travel Periods[]
        ├── name (e.g., "Adventure", "Dream", "Holiday")
        ├── dateRanges[] (e.g., ["Sep 1 - Sep 30"])
        ├── rates
        │     ├── sunThu: { deluxeStudio, oneBR, twoBR, threeBR, twoBRCabin }
        │     └── friSat: { deluxeStudio, oneBR, twoBR, threeBR, twoBRCabin }
        └── color (for calendar display)
```

### Copper Creek 2026 — Travel Periods (from PDF)

| Period       | Dates                                  | Sun-Thu | Fri-Sat | (Deluxe Studio example) |
|-------------|----------------------------------------|---------|---------|------------------------|
| Adventure   | Sep 1-30                               | 13      | 15      | Lowest                 |
| Dream       | Jan 1-31, May 1-14                     | 15      | 16      |                        |
| Choice      | May 15-Jun 10, Dec 1-23               | 16      | 17      |                        |
| Select      | Feb 1-15, Jun 11-Aug 31               | 17      | 18      |                        |
| Preferred   | Oct 1-Nov 24, Nov 28-30               | 17      | 19      |                        |
| Premier     | Feb 16-Mar 28, Apr 6-30, Nov 25-27    | 18      | 21      |                        |
| Holiday     | Mar 29-Apr 5, Dec 24-31              | 25      | 28      | Highest                |

---

## Implementation Phases

### Phase 1: Core Calendar with Points Display
**Files:** `index.html`, `styles.css`, `app.js`, `data.js`

**Tasks:**
1. **`data.js`** — Define the Copper Creek points data as a JS object
   - All 7 travel periods with their date ranges
   - Points for each room type, split by Sun-Thu and Fri-Sat
   - Helper function: given a date + room type → return points per night

2. **`styles.css`** — Calendar styling
   - CSS Grid for the calendar (7 columns for days of week)
   - Color-coded cells by travel period (7 distinct colors)
   - Selected state for clicked nights
   - Responsive layout

3. **`app.js`** — Application logic
   - Render month grid for a given year/month
   - Month navigation (prev/next arrows)
   - Resort dropdown (just Copper Creek for now)
   - Room type dropdown (5 options)
   - On room type change → re-render calendar with new point values
   - Click handler on day cells → toggle selected
   - Update running total (points + cash) on selection change

4. **`index.html`** — Page structure
   - Header with title
   - Controls bar: resort dropdown, room type dropdown, month nav
   - Calendar grid area
   - Summary panel: selected nights count, total points, total cash

### Phase 2: Polish & UX
- Add a legend showing travel period colors
- Show check-in / check-out date range when nights are selected
- Highlight weekends (Fri/Sat) subtly since they cost more
- Tooltip on hover showing the travel period name
- Disable past dates
- Mobile-friendly layout

### Phase 3: Multi-Resort Support
- Add more resort PDFs (Bay Lake Tower, Riviera, etc.)
- Resort selector dynamically loads the correct points chart
- Each resort has its own room types

### Phase 4: Real Cash Pricing
- Replace the flat $400/night with actual rack rates
- Could scrape Disney's booking site or use known rate cards
- Show points value (cash price / points = $/point)

---

## File Structure
```
01_dvc_calendar/
├── CLAUDE.md           # Project context
├── plan.md             # This file
└── src/
    ├── index.html      # Main page
    ├── styles.css       # Styles
    ├── data.js          # Points data
    └── app.js           # App logic
```

---

## Phase 1 Detailed Breakdown

### Step 1: Create `data.js`
- Define `RESORTS` object with Copper Creek data
- Write `getPointsForDate(date, roomType)` function that:
  - Determines which travel period the date falls in
  - Determines if it's Sun-Thu or Fri-Sat
  - Returns the point cost for the given room type
- Write `getTravelPeriod(date)` to get period name + color

### Step 2: Create `styles.css`
- Layout: flex column (header → controls → calendar → summary)
- Calendar grid: 7 columns, auto rows
- Day cells: show date number + points value
- 7 season colors (Adventure=green, Dream=blue, ... Holiday=red)
- Selected cells: bold border or highlight
- Summary bar: sticky at bottom or sidebar

### Step 3: Create `app.js`
- State: `{ resort, roomType, year, month, selectedDates: Set }`
- `renderCalendar()` — builds the month grid
- `renderSummary()` — updates totals
- Event listeners for dropdowns, nav buttons, day clicks
- Initialize with current month, Deluxe Studio

### Step 4: Create `index.html`
- Link CSS and JS files
- Semantic HTML structure
- Dropdowns populated from data

---

## Ready to Build
Phase 1 can be completed in a single session. Want me to start building?
