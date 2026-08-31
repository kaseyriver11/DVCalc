#!/usr/bin/env python3
"""
Builds averaged live cash rates for a resort, bucketed by (date-range, day-type,
room-type) -- one average per distinct date-range within each DVC travel period,
not blended across a whole period, so e.g. Easter and Christmas (both under the
"Holiday" period name) stay separate instead of smearing into one number.

Reuses the raw per-night API calls from scrape_live_prices.py, sampling one
representative stay per date-range (capped at 7 nights, which always covers a
full Sun-Sat cycle -- 5 Sun-Thu nights + 2 Fri-Sat nights -- regardless of which
day of the week the range starts on).

Each run appends new snapshots into the output file's "history" rather than
overwriting, so "average" and "lastChecked" diverge naturally as this gets run
repeatedly over time. Right now, on the first run, they'll be identical -- that's
expected and correct, not a bug.

Usage:
    python3 scripts/build_live_cash_rates.py copper-creek-villas-and-cabins --year 2027
"""

import argparse
import datetime
import json
import os
import statistics
import sys
import time
import urllib.error
import urllib.request

API_URL_TMPL = (
    "https://disneyworld.disney.go.com/wdw-resorts-details-api/api/v1/"
    "resort/{slug}/availability-and-prices/?storeId=wdw"
)
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36"
)
REQUEST_TIMEOUT_SECONDS = 20
DELAY_BETWEEN_REQUESTS_SECONDS = 2.0
MAX_RETRIES = 3

# Copper Creek Villas & Cabins / Boulder Ridge Villas share one cash inventory
# pool in Disney's booking system (confirmed live: identical room IDs and
# prices from both resort slugs) -- see docs/live_pricing_plan.md. Both DVC
# resorts in data.js should read from this same live dataset.
ROOM_CODE_TO_APP_TYPE = {
    # Deluxe Studio -- confirmed via Copper Creek's branded image slugs (2A, 2D)
    # and Boulder Ridge's (XA); JB/JC/Z3/Z9 inferred by tight price clustering
    # (~$810-890/night in the 2027-03-30 pilot sample, right alongside 2A/2D/XA).
    "2A": "deluxeStudio", "2D": "deluxeStudio", "JB": "deluxeStudio", "JC": "deluxeStudio",
    "XA": "deluxeStudio", "Z3": "deluxeStudio", "Z9": "deluxeStudio",
    # One-Bedroom Villa -- confirmed 2E, XB; JZ/25/JD/ZS inferred by price
    # clustering (~$1090-1400/night, distinctly below the 2-bedroom tier).
    "2E": "oneBedroom", "XB": "oneBedroom", "JZ": "oneBedroom", "25": "oneBedroom",
    "JD": "oneBedroom", "ZS": "oneBedroom",
    # Two-Bedroom Villa -- confirmed 2F, XC ($2400s); JS included too (~$1583,
    # likely the cheaper Lock-Off variant of the same room type -- the resort
    # does list a distinct "2 Bedroom Lock-Off Villa" room name).
    "2F": "twoBedroom", "XC": "twoBedroom", "JS": "twoBedroom",
    # Three-Bedroom Grand Villa -- confirmed via image slug.
    "2I": "threeBedroom",
    # Two-Bedroom Cabin -- confirmed via image slug.
    "2K": "twoBedCabin",
}

# Mirrors data.js's wdwPeriods()/wdwPeriods2027() date ranges, but kept as
# separate entries per date-range rather than blended per period -- see the
# Holiday note below. Both years use the SAME period names and the SAME number
# of date-ranges per period (only the exact days shift, since Easter and
# Thanksgiving move each year), so a range in PERIODS_2026 pairs positionally
# with the range at the same (period name, index) in PERIODS_2027 -- that
# pairing is what the year-fallback logic below relies on.
PERIODS_2026 = [
    ("Adventure", [("2026-09-01", "2026-09-30")]),
    ("Dream", [("2026-01-01", "2026-01-31"), ("2026-05-01", "2026-05-14")]),
    ("Choice", [("2026-05-15", "2026-06-10"), ("2026-12-01", "2026-12-23")]),
    ("Select", [("2026-02-01", "2026-02-15"), ("2026-06-11", "2026-08-31")]),
    ("Preferred", [("2026-10-01", "2026-11-24"), ("2026-11-28", "2026-11-30")]),
    ("Premier", [("2026-02-16", "2026-03-28"), ("2026-04-06", "2026-04-30"), ("2026-11-25", "2026-11-27")]),
    # Easter and Christmas/New Year's are both called "Holiday" in DVC's points
    # chart, but they're different demand events -- kept as separate date-range
    # buckets here rather than averaged together (see chat: "holidays get wonky").
    ("Holiday", [("2026-03-29", "2026-04-05"), ("2026-12-24", "2026-12-31")]),
]

PERIODS_2027 = [
    ("Adventure", [("2027-09-01", "2027-09-30")]),
    ("Dream", [("2027-01-01", "2027-01-31"), ("2027-05-01", "2027-05-14")]),
    ("Choice", [("2027-05-15", "2027-06-10"), ("2027-12-01", "2027-12-23")]),
    ("Select", [("2027-02-01", "2027-02-15"), ("2027-06-11", "2027-08-31")]),
    ("Preferred", [("2027-10-01", "2027-11-23"), ("2027-11-27", "2027-11-30")]),
    ("Premier", [("2027-02-16", "2027-03-20"), ("2027-03-29", "2027-04-30"), ("2027-11-24", "2027-11-26")]),
    ("Holiday", [("2027-03-21", "2027-03-28"), ("2027-12-24", "2027-12-31")]),
]

PERIODS_BY_YEAR = {2026: PERIODS_2026, 2027: PERIODS_2027}


def paired_ranges(preferred_year, fallback_year):
    """Yields (period_name, range_index, {year: (range_start, range_end), ...})
    for every (period_name, range_index) slot, pairing the preferred year's
    date-range with the fallback year's date-range at the same position.
    """
    preferred = PERIODS_BY_YEAR[preferred_year]
    fallback = PERIODS_BY_YEAR[fallback_year]
    fallback_lookup = {name: ranges for name, ranges in fallback}
    for period_name, ranges in preferred:
        fb_ranges = fallback_lookup.get(period_name, [])
        for idx, (range_start, range_end) in enumerate(ranges):
            years = {preferred_year: (range_start, range_end)}
            if idx < len(fb_ranges):
                years[fallback_year] = fb_ranges[idx]
            yield period_name, idx, years


def fetch_resort_pricing(slug, check_in, check_out, adults=2, children=0):
    url = API_URL_TMPL.format(slug=slug)
    payload = {
        "checkInDate": check_in,
        "checkOutDate": check_out,
        "partyMix": {"adultCount": adults, "childCount": children, "nonAdultAges": []},
        "region": "US",
        "accessible": False,
        "marketingOfferId": "room-only",
    }
    body = json.dumps(payload).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": USER_AGENT,
        "Origin": "https://disneyworld.disney.go.com",
        "Referer": f"https://disneyworld.disney.go.com/resorts/{slug}/rates-rooms/",
    }
    last_err = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            req = urllib.request.Request(url, data=body, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT_SECONDS) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
            last_err = e
            print(f"  [retry {attempt}/{MAX_RETRIES}] {check_in}: {e}", file=sys.stderr)
            time.sleep(2 * attempt)
    raise last_err


def day_type(date_str):
    d = datetime.date.fromisoformat(date_str)
    return "friSat" if d.weekday() in (4, 5) else "sunThu"  # Mon=0 .. Fri=4, Sat=5


def sample_date_range(slug, range_start, range_end, adults=2, children=0):
    """Fetches one representative stay for a date-range (up to 7 nights, capped
    to the range's own length), and buckets per-night prices by (dayType,
    appRoomType). Returns {dayType: {appRoomType: [prices...]}}.
    """
    start = datetime.date.fromisoformat(range_start)
    end = datetime.date.fromisoformat(range_end)
    max_nights = (end - start).days + 1
    nights = min(7, max_nights)
    check_in = start.isoformat()
    check_out = (start + datetime.timedelta(days=nights)).isoformat()

    data = fetch_resort_pricing(slug, check_in, check_out, adults, children)
    room_lookup = data.get("roomPriceLookup") or {}

    buckets = {"sunThu": {}, "friSat": {}}
    for room_id in data.get("orderedRoomIds", []):
        room = room_lookup.get(room_id)
        if not room or room.get("reasonUnavailable"):
            continue
        code = room.get("code")
        app_type = ROOM_CODE_TO_APP_TYPE.get(code)
        if not app_type:
            continue
        for night in room.get("orderedPricePerNight", []):
            date = night.get("date")
            price = (night.get("price") or {}).get("subtotal")
            if not date or price is None:
                continue
            dt = day_type(date)
            buckets[dt].setdefault(app_type, []).append(float(price))

    return buckets, check_in, check_out


def merge_history(existing, new_entries):
    """Appends new_entries (list of raw price floats with a timestamp) into
    the existing history list for a (dateRange, dayType, appRoomType) bucket.
    """
    if existing is None:
        existing = []
    existing.extend(new_entries)
    return existing


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("slug", help="Resort URL slug, e.g. copper-creek-villas-and-cabins")
    parser.add_argument("--year", type=int, default=2027, help="Preferred year to sample. Falls back to the other year for any date-range that isn't bookable yet (or already isn't bookable anymore).")
    parser.add_argument("--fallback-year", type=int, default=None, help="Defaults to the other of 2026/2027.")
    parser.add_argument("--adults", type=int, default=2)
    parser.add_argument("--children", type=int, default=0)
    parser.add_argument("--out", default=None)
    args = parser.parse_args()

    fallback_year = args.fallback_year or (2026 if args.year == 2027 else 2027)
    if args.year not in PERIODS_BY_YEAR or fallback_year not in PERIODS_BY_YEAR:
        raise SystemExit(f"Only years {sorted(PERIODS_BY_YEAR)} are supported.")

    out_path = args.out or os.path.join("data", "cash_prices_live.json")
    now = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")

    # Load existing history if present, so re-runs accumulate instead of overwrite.
    existing = {}
    if os.path.exists(out_path):
        with open(out_path, "r", encoding="utf-8") as f:
            existing = json.load(f)

    result_periods = existing.get("periods", [])
    # Index existing periods by (periodName, rangeIndex) for quick lookup/merge.
    # Keyed by index (not rangeStart) now, since the same slot can be filled by
    # either year's dates depending on which one is currently bookable.
    existing_index = {(p["period"], p.get("rangeIndex", 0)): p for p in result_periods}

    for period_name, range_idx, years in paired_ranges(args.year, fallback_year):
        # Try the preferred year first; if it's not bookable yet (or, in the
        # rare case a past-dated range fell out of the booking window, not
        # bookable anymore), fall back to the other year's equivalent range.
        # This directly implements "if 2026 or 2027 data isn't available, use
        # the alternate year" -- per date-range, not as an all-or-nothing switch.
        try_order = [args.year] + ([fallback_year] if fallback_year in years else [])
        buckets = check_in = check_out = None
        year_used = None
        for y in try_order:
            range_start, range_end = years[y]
            print(f"Sampling {period_name} {y} ({range_start} to {range_end}) ...")
            try:
                buckets, check_in, check_out = sample_date_range(args.slug, range_start, range_end, args.adults, args.children)
                year_used = y
                break
            except Exception as e:
                print(f"  FAILED ({y}): {e}", file=sys.stderr)
                time.sleep(DELAY_BETWEEN_REQUESTS_SECONDS)

        if buckets is None:
            print(f"  SKIPPED: neither {args.year} nor {fallback_year} was bookable for {period_name}", file=sys.stderr)
            continue

        range_start, range_end = years[year_used]
        key = (period_name, range_idx)
        entry = existing_index.get(key)
        if entry is None:
            entry = {"period": period_name, "rangeIndex": range_idx, "roomTypes": {}}
            result_periods.append(entry)
            existing_index[key] = entry
        entry["rangeStart"] = range_start
        entry["rangeEnd"] = range_end
        entry["yearUsed"] = year_used

        room_type_summary = {}
        for day_t in ("sunThu", "friSat"):
            for app_type, prices in buckets[day_t].items():
                entry["roomTypes"].setdefault(app_type, {}).setdefault(day_t, {"history": []})
                hist_bucket = entry["roomTypes"][app_type][day_t]
                for p in prices:
                    hist_bucket["history"].append({"price": p, "capturedAt": now})
                all_prices = [h["price"] for h in hist_bucket["history"]]
                hist_bucket["average"] = round(statistics.mean(all_prices), 2)
                hist_bucket["lastChecked"] = hist_bucket["history"][-1]["price"]
                hist_bucket["lastCheckedAt"] = hist_bucket["history"][-1]["capturedAt"]
                hist_bucket["sampleCount"] = len(all_prices)
                room_type_summary[f"{app_type}/{day_t}"] = f"avg=${hist_bucket['average']} last=${hist_bucket['lastChecked']} (n={hist_bucket['sampleCount']})"

        for k, v in sorted(room_type_summary.items()):
            print(f"    {k}: {v}")

        time.sleep(DELAY_BETWEEN_REQUESTS_SECONDS)

    output = {
        "resortSlug": args.slug,
        "preferredYear": args.year,
        "fallbackYear": fallback_year,
        "adults": args.adults,
        "children": args.children,
        "lastRunAt": now,
        "periods": result_periods,
    }
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    main()
