#!/usr/bin/env python3
"""
Fetch live cash pricing for a DVC resort from Disney's own public pricing API.

This is NOT the DVC member availability portal -- it's the same unauthenticated
endpoint disneyworld.disney.go.com's own booking widget calls to price a stay.
No login, no cookies, no session tokens required. See docs/live_pricing_plan.md
for how this was found and the full request/response shape.

Every night of the stay gets its own price (not just a stay average), for
every room type at the resort, in a single request. Prices are pre-tax --
multiply by 1.125 for FL tax to match this project's existing MouseSavers
convention (see data.js).

Sold-out dates: the API still returns a full price for every room even when
nothing is actually bookable (it looks like a rate-plan lookup, independent
of real-time inventory). When that happens the response carries a top-level
"reasonsUnavailable" field. This script always records whatever price data
comes back, and separately tags each snapshot with whether the API flagged
the date as unavailable -- it's on the caller (or a later analysis pass) to
decide whether to trust "priced but flagged unavailable" data the same as a
normal snapshot. Skipping snapshots just because a date is popular would
silently bias the dataset toward disaster off-season dates.

Usage:
    python3 scripts/scrape_live_prices.py copper-creek-villas-and-cabins \\
        --dates 2026-09-01 2026-09-30 2027-01-15 2027-03-30 \\
        --nights 4 \\
        --out data/cash_prices_live_pilot.json

    # Default date list (a handful of lead times from today) if --dates is omitted:
    python3 scripts/scrape_live_prices.py copper-creek-villas-and-cabins
"""

import argparse
import datetime
import json
import os
import sys
import time
import urllib.error
import urllib.request

API_URL_TMPL = (
    "https://disneyworld.disney.go.com/wdw-resorts-details-api/api/v1/"
    "resort/{slug}/availability-and-prices/?storeId=wdw"
)

# A real browser User-Agent is required -- Disney's edge/WAF appears to hang
# or drop requests from default HTTP-client user agents (confirmed: curl's
# default UA hung indefinitely; the same request with this UA returned 200
# immediately).
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36"
)

REQUEST_TIMEOUT_SECONDS = 20
DELAY_BETWEEN_REQUESTS_SECONDS = 2.0
MAX_RETRIES = 3


def fetch_resort_pricing(slug, check_in, check_out, adults=2, children=0):
    """POSTs one availability-and-prices request. Returns the parsed JSON body.

    Raises urllib.error.HTTPError / URLError on failure after retries.
    """
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


def summarize_response(data, check_in, check_out):
    """Extracts a compact per-room snapshot from the raw API response.

    Returns {checkIn, checkOut, capturedAt, unavailable, reasonCodes, rooms: [...]}
    where each room is {code, id, avgPerNight, nights: [{date, subtotal}], totalSubtotal, totalTax}.
    Doesn't drop anything just because reasonsUnavailable is present -- see
    module docstring.
    """
    reasons = data.get("reasonsUnavailable") or []
    reason_codes = [r.get("reasonCode") for r in reasons if r.get("reasonCode")]

    room_lookup = data.get("roomPriceLookup") or {}
    rooms = []
    for room_id in data.get("orderedRoomIds", []):
        room = room_lookup.get(room_id)
        if not room:
            continue
        # Sold-out rooms carry a singular "reasonUnavailable" on the room itself
        # (distinct from the top-level plural "reasonsUnavailable") and omit
        # displayPrice/orderedPricePerNight/totalPrice entirely -- there's no
        # price to fall back to for that specific room, unlike the top-level
        # flag case where other rooms can still be fully priced.
        room_reason = room.get("reasonUnavailable")
        if room_reason:
            rooms.append({
                "code": room.get("code"),
                "id": room_id,
                "unavailable": True,
                "reasonCode": room_reason,
                "avgPerNight": None,
                "nights": [],
                "totalSubtotal": None,
                "totalTax": None,
            })
            continue

        base = (room.get("displayPrice") or {}).get("basePrice") or {}
        total = room.get("totalPrice") or {}
        nights = [
            {"date": n.get("date"), "subtotal": (n.get("price") or {}).get("subtotal")}
            for n in room.get("orderedPricePerNight", [])
        ]
        rooms.append({
            "code": room.get("code"),
            "id": room_id,
            "unavailable": False,
            "reasonCode": None,
            "avgPerNight": base.get("subtotal"),
            "nights": nights,
            "totalSubtotal": total.get("subtotal"),
            "totalTax": total.get("tax"),
        })

    return {
        "checkIn": check_in,
        "checkOut": check_out,
        "capturedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "unavailable": bool(reason_codes),
        "reasonCodes": reason_codes,
        "roomCount": len(rooms),
        "rooms": rooms,
    }


def default_target_dates():
    """A handful of lead times out from today, for a quick pilot run."""
    today = datetime.date.today()
    offsets_days = [2, 30, 138, 212]  # ~next week, ~1mo, ~4.5mo, ~7mo out
    return [(today + datetime.timedelta(days=d)).isoformat() for d in offsets_days]


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("slug", help="Resort URL slug, e.g. copper-creek-villas-and-cabins")
    parser.add_argument("--dates", nargs="+", default=None, help="Check-in dates (YYYY-MM-DD). Defaults to a few lead-time samples from today.")
    parser.add_argument("--nights", type=int, default=4)
    parser.add_argument("--adults", type=int, default=2)
    parser.add_argument("--children", type=int, default=0)
    parser.add_argument("--out", default=None, help="Output JSON path. Defaults to data/cash_prices_live_pilot.json")
    args = parser.parse_args()

    dates = args.dates or default_target_dates()
    out_path = args.out or os.path.join("data", "cash_prices_live_pilot.json")

    snapshots = []
    for check_in_str in dates:
        check_in = datetime.date.fromisoformat(check_in_str)
        check_out = (check_in + datetime.timedelta(days=args.nights)).isoformat()
        print(f"Fetching {args.slug} {check_in_str} -> {check_out} ...")
        try:
            data = fetch_resort_pricing(args.slug, check_in_str, check_out, args.adults, args.children)
        except Exception as e:
            print(f"  FAILED: {e}", file=sys.stderr)
            continue
        snapshot = summarize_response(data, check_in_str, check_out)
        flag = f" [date flagged: {','.join(snapshot['reasonCodes'])}]" if snapshot["unavailable"] else ""
        priced = sum(1 for r in snapshot["rooms"] if not r["unavailable"])
        sold_out = snapshot["roomCount"] - priced
        print(f"  -> {priced} priced, {sold_out} sold-out rooms (of {snapshot['roomCount']}){flag}")
        snapshots.append(snapshot)
        time.sleep(DELAY_BETWEEN_REQUESTS_SECONDS)

    result = {
        "resortSlug": args.slug,
        "adults": args.adults,
        "children": args.children,
        "nights": args.nights,
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "snapshots": snapshots,
    }

    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print(f"\nWrote {len(snapshots)} snapshots to {out_path}")


if __name__ == "__main__":
    main()
