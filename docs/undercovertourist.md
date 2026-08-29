# Undercover Tourist Crowd Data

Adds a real crowd-level indicator to the DVC calendar, sourced from Undercover
Tourist's public Orlando Crowd Calendar:

https://www.undercovertourist.com/orlando/crowd-calendar/2026/
https://www.undercovertourist.com/orlando/crowd-calendar/2027/

## What the data actually is

Undercover Tourist publishes one aggregate "Crowd Level" (1-10) per date for
the whole Orlando theme-park area — it covers Magic Kingdom, EPCOT,
Hollywood Studios, Animal Kingdom, Typhoon Lagoon, and the Universal Orlando
parks together under a single number. It does **not** publish a separate
numeric 1-10 score per individual park.

What it does publish per park, in each date's detail view, is two icons:

- a green "recommended" icon (`icon-recommendedpark.svg`) — that park is
  their lowest-crowd pick for the day
- an orange "busy day" icon (`icon-busyday.svg`) — that park is flagged busier
  than usual
- no icon at all if neither applies

...plus a single "Season" $ tier (1-3 dollar signs, `icon-dollars-N-white.svg`)
for the day, which is a ticket-pricing-season indicator, not per-park.

`data/undercovertourist_2026.js` / `_2027.js` store exactly these three real
things per date — `crowd`/`label` (the aggregate score), `season` (the $
tier, or `null` if the source hasn't published one that far out yet), and
`parks` (`"recommended"` / `"busy"` / `null` for each of 7 parks). Anything
resembling a numeric per-park crowd score would be fabricated — the source
doesn't have one.

## How it was collected

Direct HTTP requests (`curl`, `requests`, `WebFetch`) to undercovertourist.com
return `403` — the site blocks non-browser traffic. The data in this repo was
extracted via a real browser session (Claude in Chrome) on 2026-08-27
(crowd/label) and 2026-08-28 (season + per-park flags), reading values
straight out of the rendered Year View DOM for every day of 2026 and 2027.
Each day's detail modal is pre-rendered into the page (`div#modal-crowd-calendar-year-YYYY-MM-DD`),
so the whole year's data is present in the DOM without needing to click
through 365 modals — it can be read directly with `document.getElementById`.

## Schema

```js
const UNDERCOVER_TOURIST_CROWD_2026 = {
  "2026-01-01": {
    crowd: 10,
    label: "Extreme",       // bucketed locally from `crowd`, see table below
    season: 3,               // 1-3 ($ tier), or null if not yet published
    parks: {
      magicKingdom: "recommended",   // "recommended" | "busy" | null
      epcot: "recommended",
      hollywoodStudios: "busy",
      animalKingdom: null,
      universalStudios: "busy",
      islandsOfAdventure: null,
      epicUniverse: "busy",
    },
  },
  // ...
};
```

`label` buckets (derived locally, not published by the source):

| crowd | label    |
|-------|----------|
| 9-10  | Extreme  |
| 7-8   | Heavy    |
| 5-6   | Busy     |
| 3-4   | Moderate |
| 0-2   | Low      |

## Updating for a new year

In a real browser, navigate to `https://www.undercovertourist.com/orlando/crowd-calendar/{YEAR}/`
(Year View) and run this in the console per month (`mm` = `"01"`..`"12"`):

```js
const PARK_ORDER = ["Magic Kingdom® Park","EPCOT®","Disney's Hollywood Studios®",
  "Disney's Animal Kingdom® Theme Park","Universal Studios Florida",
  "Universal Islands of Adventure","Universal Epic Universe"];
const FLAG_CODE = { "icon-recommendedpark.svg": "R", "icon-busyday.svg": "B" };

function dayCode(year, mm, dd) {
  const modal = document.getElementById(`modal-crowd-calendar-year-${year}-${mm}-${dd}`);
  if (!modal) return null;
  const all = Array.from(modal.querySelectorAll('*'));
  const crowdLabelEl = all.find(el => el.children.length===0 && el.textContent.trim()==='Crowd Level');
  const crowdVal = crowdLabelEl ? crowdLabelEl.parentElement.querySelector('div:last-child') : null;
  const crowd = crowdVal ? (crowdVal.textContent.trim().match(/\d+/) || [])[0] : null;
  const seasonLabelEl = all.find(el => el.children.length===0 && el.textContent.trim()==='Season');
  const seasonImg = seasonLabelEl ? seasonLabelEl.parentElement.querySelector('img') : null;
  const seasonTier = seasonImg ? (seasonImg.getAttribute('src').match(/dollars-(\d)/) || [])[1] : null;
  const parkMap = {};
  Array.from(modal.querySelectorAll('.crowd-calendar-poi-name')).forEach(h => {
    const row = h.closest('div.w-full.flex.justify-between.items-center') || h.parentElement.parentElement;
    const iconWrap = row.children[1];
    const src = iconWrap && iconWrap.tagName === 'IMG' ? iconWrap.getAttribute('src').split('/').pop() : null;
    parkMap[h.textContent.trim()] = FLAG_CODE[src] || '-';
  });
  return `${dd}:${crowd}:${seasonTier}:${PARK_ORDER.map(p => parkMap[p] || '-').join('')}`;
}

function monthCodes(year, mm, numDays) {
  const parts = [];
  for (let d = 1; d <= numDays; d++) parts.push(dayCode(year, mm, String(d).padStart(2,'0')));
  return parts.filter(Boolean).join(',');
}

monthCodes('2028', '01', 31) // repeat per month, feed the strings into a script like
                              // scripts that produced the current files (see git history)
                              // to expand into the schema above.
```

There's no official API, so it has to be read out of the rendered page.
