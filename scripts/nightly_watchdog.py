#!/usr/bin/env python3
"""
Nightly freshness watchdog + morning digest email.

Checks whether any of DVC Companion's manually-maintained data sources have
changed since the last run, refreshes a rotating slice of live Disney cash
pricing, and emails a one-shot summary via Resend. Never writes to data.js /
resort_investment.js / dues_historical.js -- only its own state file
(data/.watchdog_state.json) and data/cash_prices_live.json (the live-pricing
time series, which is designed to be appended to repeatedly -- see
build_live_cash_rates.py's own docstring), so a bad parse here can never
corrupt data someone's making a real purchase or trip decision from. See
docs/nightly_pipeline_plan.md for the full design and why each check works
the way it does.

Env vars:
    RESEND_API_KEY   -- required to actually send the email; without it,
                        the script still runs and prints the report to
                        stdout (useful for local testing).
    DIGEST_TO_EMAIL  -- required to send; the report's only recipient.
    DIGEST_FROM      -- optional, defaults to "DVC Companion <digest@dvccompanion.com>".

Usage:
    python3 scripts/nightly_watchdog.py
"""

import hashlib
import html as html_lib
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(__file__))
from build_live_cash_rates import RESORT_CONFIGS  # noqa: E402

STATE_FILE = os.path.join(os.path.dirname(__file__), "..", "data", ".watchdog_state.json")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

# DFB republishes their Disney World Calendar PDF roughly every 3-4 weeks
# (10 editions -- v26.1 through v26.10 -- surfaced across the first ~8.5
# months of 2026). See check_dfb_calendar_freshness() for why this is a
# time-based reminder instead of a scrapable-link check like
# check_points_chart_pdfs().
DFB_EVENTS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "disney_events.js")
DFB_CONSTRUCTION_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "resort_construction.js")
DFB_STALENESS_DAYS = 21

# Pages checked by content-hash diff, for sources with no numbers worth
# reading automatically. Dues and direct prices are read as numbers instead
# (check_dues(), check_direct_prices()), since a raw "page changed" flag on
# them fired on every promo edit and new post with nothing to do.
HASH_WATCHED_PAGES = {
    "mousesavers_hub_2027": "https://www.mousesavers.com/2027-disney-world-room-rates-season-dates/",
    "fidelity_blog": "https://www.fidelityrealestate.com/blog/",
}
# A change on these is worth knowing but never needs action by itself.
FYI_HASH_PAGES = {"fidelity_blog": "new post(s) on the Fidelity blog -- optional read"}

DUES_URL = "https://www.dvcresalemarket.com/buying/annual-dues/"
DIRECT_PRICES_URL = "https://dvcnews.com/dvc-program-menu/financial/pricing-a-promotions"
DATA_JS = os.path.join(os.path.dirname(__file__), "..", "data", "data.js")
INVESTMENT_JS = os.path.join(os.path.dirname(__file__), "..", "data", "resort_investment.js")
# The dues year data.js's DUES_PER_POINT holds. Bump it when the new year's
# dues go into data.js, so a newer column on the dues page reads as news.
APP_DUES_YEAR = 2026

# Resort id -> a name fragment both source pages use (case-insensitive).
RESORT_NAME_KEYS = {
    "animalKingdomVillas": "animal kingdom",
    "aulani": "aulani",
    "bayLakeTower": "bay lake",
    "beachClubVillas": "beach club",
    "boardwalkVillas": "boardwalk",
    "boulderRidge": "boulder ridge",
    "copperCreek": "copper creek",
    "fortWildernessCabins": "fort wilderness",
    "disneylandHotel": "disneyland hotel",
    "grandCalifornian": "grand californian",
    "grandFloridian": "grand floridian",
    "hiltonHead": "hilton head",
    "oldKeyWest": "old key west",
    "polynesianVillas": "polynesian",
    "rivieraResort": "riviera",
    "saratogaSprings": "saratoga",
    "veroBeach": "vero beach",
}

# Disney Collection charts (points at non-DVC hotels) sit on the same
# points-chart page as DVC's own. The app doesn't use them, so a new one
# is noted, not flagged.
NON_DVC_CHART_RE = re.compile(
    r"Tokyo|Hong-Kong|Hollywood-Hotel|Explorers-Lodge|Newport-Bay|Hotel-New-York|Cheyenne|"
    r"Santa-Fe|Sequoia|Davy-Crocket|Disneyland-Hotel-(?:Apr|Jan)|Disney-Collection|-TAT-",
    re.IGNORECASE,
)

PDF_CONTENT_API = "https://disneyvacationclub.disney.go.com/api/v1/content?url=/vacation-planning/points-charts&format=raw"

# Same URL + publishable anon key already embedded client-side in auth.js
# (Supabase anon keys are meant to be public -- RLS is the real boundary).
# Reusing it here means checking banking-reminder health needs no new
# GitHub Actions secret. reminder_run_log is public-readable by design
# (see db/migrations/017_add_reminder_run_log.sql) specifically so this
# script can read it with nothing more privileged than that.
REMINDER_SUPABASE_URL = "https://afqhmtqwjtjkjahepqxv.supabase.co"
REMINDER_SUPABASE_ANON_KEY = "sb_publishable_moCeyHUFBzY6dKmQjHY9kw_4w2Pho3k"
# The cron fires daily at 13:00 UTC (docs/phase5_deployment.md); 30h of
# slack catches a genuinely missed day without false-alarming on normal
# run-time jitter.
REMINDER_RUN_STALE_HOURS = 30


def http_get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read()


# Rotating ad banners on these content sites change on every single load
# (confirmed on dvcnews.com -- a Joomla banner module swaps images/links
# per request) and would make a raw content hash false-positive every
# night for no real reason. Best-effort regex stripping, not a real HTML
# parser (kept dependency-free on purpose) -- won't catch every source of
# noise on every site, so the first week or two of real runs is worth
# watching for any watchdog that still flags "changed" on consecutive
# nights with nothing actually different when you look.
_SCRIPT_STYLE_RE = re.compile(rb"<(script|style)\b.*?</\1>", re.DOTALL | re.IGNORECASE)
_COMMENT_RE = re.compile(rb"<!--.*?-->", re.DOTALL)
# No \b word boundaries around "banner"/"advert" -- real class names are
# often compound tokens like "mod-banners__item" or "banneritem" where
# "banner" is a substring, not a standalone word, so a strict \bbanner\b
# silently fails to match either (confirmed against dvcnews.com's actual
# markup while building this).
_BANNER_DIV_RE = re.compile(
    rb'<div[^>]*class="[^"]*(?:banner|advert)[^"]*"[^>]*>.*?</div>',
    re.DOTALL | re.IGNORECASE,
)
# Cloudflare rewrites pages behind it with per-request randomized artifacts,
# unrelated to real content changes but guaranteed to differ on every fetch:
# a `data-cf-modified-<hash>-` attribute (Rocket Loader), and its email
# obfuscation cipher (a *deliberately* different hex string every request,
# by design, to defeat exactly this kind of scraping).
_CF_MODIFIED_RE = re.compile(rb'data-cf-modified-[a-f0-9-]+="[^"]*"')
_CF_EMAIL_RE = re.compile(
    rb'<a href="/cdn-cgi/l/email-protection#[a-f0-9]+">.*?</a>',
    re.DOTALL | re.IGNORECASE,
)
_CF_EMAIL_SPAN_RE = re.compile(
    rb'<span class="__cf_email__" data-cfemail="[a-f0-9]+">.*?</span>',
    re.DOTALL | re.IGNORECASE,
)
# Forms (newsletter signups, contact forms) are interactive widgets, never
# the actual content being watched for changes -- and commonly carry their
# own anti-spam randomization (honeypot fields, timing tokens) that would
# otherwise look like a content change on every single fetch.
_FORM_RE = re.compile(rb"<form\b.*?</form>", re.DOTALL | re.IGNORECASE)


def stabilize_content(html_bytes):
    stripped = _SCRIPT_STYLE_RE.sub(b"", html_bytes)
    stripped = _COMMENT_RE.sub(b"", stripped)
    stripped = _CF_MODIFIED_RE.sub(b"", stripped)
    stripped = _CF_EMAIL_RE.sub(b"", stripped)
    stripped = _CF_EMAIL_SPAN_RE.sub(b"", stripped)
    stripped = _FORM_RE.sub(b"", stripped)
    # Banner divs can nest other divs, so a single non-greedy regex pass
    # under-strips nested cases -- run it a few times to mop up the rest.
    for _ in range(3):
        stripped = _BANNER_DIV_RE.sub(b"", stripped)
    return stripped


def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"pageHashes": {}, "knownPdfUrls": [], "lastFlaggedUndercoverTouristYear": None}


def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, sort_keys=True)
        f.write("\n")


def check_page_hashes(state, results):
    for key, url in HASH_WATCHED_PAGES.items():
        try:
            body = stabilize_content(http_get(url))
            new_hash = hashlib.sha256(body).hexdigest()
            old_hash = state["pageHashes"].get(key)
            if old_hash is None:
                results.append(("ok", f"{key}: first check, baseline recorded"))
            elif old_hash != new_hash:
                if key in FYI_HASH_PAGES:
                    results.append(("ok", f"FYI: {FYI_HASH_PAGES[key]} -- {url}"))
                else:
                    results.append(("review", f"{key}: page content changed since last check -- {url}"))
            else:
                results.append(("ok", f"{key}: unchanged"))
            state["pageHashes"][key] = new_hash
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
            results.append(("error", f"{key}: fetch failed -- {e}"))


# ---- Dues and direct prices, read as numbers ----
def page_text(html_bytes):
    """Visible text of a page: scripts/styles dropped, tags to spaces,
    entities decoded, whitespace collapsed."""
    s = html_bytes.decode("utf-8", errors="ignore")
    s = re.sub(r"<(script|style)\b.*?</\1>", " ", s, flags=re.DOTALL | re.IGNORECASE)
    s = html_lib.unescape(re.sub(r"<[^>]+>", " ", s))
    s = html_lib.unescape(s)  # some pages double-encode (&amp;amp;)
    return re.sub(r"\s+", " ", s)


def resort_id_for(name):
    low = name.lower()
    for rid, key in RESORT_NAME_KEYS.items():
        if key in low:
            return rid
    return None


def app_values(path, pattern):
    """{resortId: number} from a data file, via a regex with two groups."""
    with open(path, "r", encoding="utf-8") as f:
        return {m.group(1): float(m.group(2)) for m in re.finditer(pattern, f.read())}


def parse_dues_page(html_bytes):
    """(year, {resortId: dues}) from the dues table's newest "YYYY Annual
    Dues" column, or (None, {}) if the table can't be read."""
    s = html_bytes.decode("utf-8", errors="ignore")
    table = re.search(r"<table\b.*?</table>", s, flags=re.DOTALL | re.IGNORECASE)
    if not table:
        return None, {}
    rows = re.findall(r"<tr\b.*?</tr>", table.group(0), flags=re.DOTALL | re.IGNORECASE)
    cells = [[page_text(c.encode()).strip() for c in re.findall(r"<t[dh]\b.*?</t[dh]>", r, flags=re.DOTALL | re.IGNORECASE)] for r in rows]
    if not cells:
        return None, {}
    header = cells[0]
    years = [(i, int(m.group(1))) for i, h in enumerate(header) if (m := re.search(r"(20\d\d)\s+Annual Dues", h))]
    if not years:
        return None, {}
    col, year = max(years, key=lambda x: x[1])
    dues = {}
    for row in cells[1:]:
        if len(row) <= col:
            continue
        rid = resort_id_for(row[0])
        m = re.search(r"\$\s*(\d+(?:\.\d+)?)", row[col])
        if rid and m:
            dues[rid] = float(m.group(1))
    return year, dues


def parse_direct_prices(html_bytes):
    """{resortId: $/pt} from DVC News' "<Resort> (Ownership end ...) $NNN"
    lines. The first mention wins (the page repeats itself in metadata)."""
    text = page_text(html_bytes)
    prices = {}
    for m in re.finditer(r"\(Ownership end[^)]*\)\s*\$(\d{2,4})", text):
        # The resort named closest before "(Ownership end" (names can hold
        # their own parentheses, e.g. "Aulani ... (Hawaii)").
        before = text[max(0, m.start() - 140):m.start()].lower()
        hits = [(before.rfind(key), rid) for rid, key in RESORT_NAME_KEYS.items() if key in before]
        if not hits:
            continue
        rid = max(hits)[1]
        if rid not in prices:
            prices[rid] = float(m.group(1))
    return prices


def compare_numbers(label, page, app, fmt):
    """Mismatch lines for resorts both sides have."""
    return [f"{rid}: app {fmt(app[rid])}, page {fmt(v)}" for rid, v in sorted(page.items())
            if rid in app and abs(app[rid] - v) > 0.004]


def check_dues(state, results):
    try:
        year, dues = parse_dues_page(http_get(DUES_URL))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
        results.append(("error", f"dues: fetch failed -- {e}"))
        return
    if len(dues) < 15:
        results.append(("review", f"dues: couldn't read the dues table ({len(dues)} of 17 resorts) -- check the page by hand: {DUES_URL}"))
        return
    if year > APP_DUES_YEAR:
        listed = ", ".join(f"{rid} ${v:.2f}" for rid, v in sorted(dues.items()))
        results.append(("review", f"dues: {year} dues are posted -- update DUES_PER_POINT in data/data.js (and APP_DUES_YEAR here): {listed}"))
        return
    app = app_values(DATA_JS, r"(?m)^\s*(\w+):\s*(\d+\.\d+),\s*$")
    diffs = compare_numbers("dues", dues, app, lambda v: f"${v:.2f}")
    if diffs:
        results.append(("review", f"dues: {len(diffs)} resort(s) differ from the app -- " + "; ".join(diffs)))
    else:
        results.append(("ok", f"dues: {year} dues match the app for all {len(dues)} resorts"))


def check_direct_prices(state, results):
    try:
        prices = parse_direct_prices(http_get(DIRECT_PRICES_URL))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
        results.append(("error", f"direct prices: fetch failed -- {e}"))
        return
    if len(prices) < 15:
        results.append(("review", f"direct prices: couldn't read DVC News' price list ({len(prices)} of 17 resorts) -- check the page by hand: {DIRECT_PRICES_URL}"))
        return
    app = app_values(INVESTMENT_JS, r"(\w+):\s*\{[^}]*directPricePerPoint:\s*(\d+(?:\.\d+)?)")
    diffs = compare_numbers("direct", prices, app, lambda v: f"${v:.0f}")
    if diffs:
        results.append(("review", f"direct prices: {len(diffs)} resort(s) differ from the app -- update directPricePerPoint in data/resort_investment.js: " + "; ".join(diffs)))
    else:
        results.append(("ok", f"direct prices: match the app for all {len(prices)} resorts"))


def find_pdf_urls(obj, urls):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == "href" and isinstance(v, str) and ".pdf" in v.lower():
                urls.append(v)
            find_pdf_urls(v, urls)
    elif isinstance(obj, list):
        for item in obj:
            find_pdf_urls(item, urls)


def check_points_chart_pdfs(state, results):
    try:
        body = http_get(PDF_CONTENT_API)
        data = json.loads(body)
        urls = []
        find_pdf_urls(data, urls)
        known = set(state.get("knownPdfUrls", []))
        new_urls = [u for u in urls if u not in known]
        if not known:
            results.append(("ok", f"points chart PDFs: first check, {len(urls)} baseline URLs recorded"))
        elif new_urls:
            dvc = [u for u in new_urls if not NON_DVC_CHART_RE.search(u)]
            other = len(new_urls) - len(dvc)
            if dvc:
                joined = "; ".join(dvc[:5])
                results.append(("review", f"points chart PDFs: {len(dvc)} new DVC chart(s) found -- {joined}"))
            if other:
                results.append(("ok", f"points chart PDFs: {other} new Disney Collection chart(s), not used by the app"))
        else:
            results.append(("ok", "points chart PDFs: no new charts"))
        state["knownPdfUrls"] = urls
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError) as e:
        results.append(("error", f"points chart PDFs: fetch/parse failed -- {e}"))


def _extract_transcribed_date(path):
    """Pulls the 'Transcribed <date>' comment already at the top of
    disney_events.js/resort_construction.js -- the source-of-truth for
    when each was last checked against the DFB PDF, so there's no separate
    date to keep in sync in watchdog state."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            head = f.read(2000)
    except FileNotFoundError:
        return None
    idx = head.find("Transcribed")
    if idx == -1:
        return None
    m = re.search(r"\d{4}-\d{2}-\d{2}", head[idx:idx + 200])
    return m.group(0) if m else None


def check_dfb_calendar_freshness(state, results):
    # Can't do a scrapable-link check like check_points_chart_pdfs() above --
    # confirmed 2026-09-14 that https://www.disneyfoodblog.com/wdwcalendar
    # never contains a real .pdf URL in its static HTML; the actual download
    # link is only generated after an email-gate form submit (a lead-gen
    # plugin's own placeholder example text -- "Jane-Doe.pdf" -- is the only
    # thing that string-matches ".pdf" on the page). So instead: a
    # time-based reminder off the "Transcribed <date>" comment already in
    # both files DFB data feeds, since DFB republishes roughly every 3-4
    # weeks and there's no other reliable automated signal.
    import datetime
    dates = [d for d in (
        _extract_transcribed_date(DFB_EVENTS_FILE),
        _extract_transcribed_date(DFB_CONSTRUCTION_FILE),
    ) if d]
    if not dates:
        results.append((
            "error",
            "DFB calendar freshness: couldn't find a 'Transcribed' date comment in "
            "data/disney_events.js or data/resort_construction.js",
        ))
        return

    oldest = min(dates)
    age_days = (datetime.date.today() - datetime.date.fromisoformat(oldest)).days

    if age_days >= DFB_STALENESS_DAYS:
        results.append((
            "review",
            f"DFB calendar data: {age_days} days since last transcribed ({oldest}). DFB "
            f"typically republishes their Disney World Calendar PDF every 3-4 weeks -- "
            f"https://www.disneyfoodblog.com/wdwcalendar (email-gated, so this can't check "
            f"the PDF itself automatically). Worth re-reading the latest edition and "
            f"updating data/disney_events.js and data/resort_construction.js if there's a "
            f"newer one.",
        ))
    else:
        results.append(("ok", f"DFB calendar data: last transcribed {oldest}, {age_days} days ago"))


def check_undercover_tourist_season(state, results):
    # The site 403s plain HTTP requests -- there's no live signal a script
    # can check. Instead, a one-time-per-year seasonal nudge: Undercover
    # Tourist has historically published next year's calendar by mid-fall,
    # so flag once starting Nov 15, remembered in state so it doesn't repeat
    # every night for weeks.
    import datetime
    today = datetime.date.today()
    if today.month == 12 or (today.month == 11 and today.day >= 15):
        target_year = today.year + 1
        if state.get("lastFlaggedUndercoverTouristYear") != target_year:
            results.append((
                "review",
                f"Undercover Tourist: {target_year}'s crowd calendar has likely published -- "
                f"needs a real browser session to re-scrape (site blocks plain HTTP requests), "
                f"see docs/undercovertourist.md",
            ))
            state["lastFlaggedUndercoverTouristYear"] = target_year
        else:
            results.append(("ok", f"Undercover Tourist: {target_year} already flagged this season"))
    else:
        results.append(("ok", "Undercover Tourist: not yet in the seasonal check window"))


# Tier 1: live Disney cash pricing genuinely has new data every night, but
# hitting all 15 supported resorts every single run would be both wasteful
# and impolite scraping for data that doesn't need refreshing that often at
# the per-resort level. Instead: a rotation, a fixed batch each night,
# cycling through the full resort list over ~5 nights. Reuses
# build_live_cash_rates.py exactly as-is (as a subprocess, not reimplemented)
# -- see docs/nightly_pipeline_plan.md's Phase 2 section for why.
PRICING_ROTATION_BATCH_SIZE = 3


def check_live_pricing(state, results):
    resort_ids = sorted(RESORT_CONFIGS)
    idx = state.get("pricingRotationIndex", 0) % len(resort_ids)
    batch = [resort_ids[(idx + i) % len(resort_ids)] for i in range(PRICING_ROTATION_BATCH_SIZE)]
    state["pricingRotationIndex"] = (idx + PRICING_ROTATION_BATCH_SIZE) % len(resort_ids)

    script_path = os.path.join(os.path.dirname(__file__), "build_live_cash_rates.py")
    try:
        proc = subprocess.run(
            [sys.executable, script_path, "--resort", *batch],
            capture_output=True, text=True, timeout=900,
        )
    except subprocess.TimeoutExpired:
        results.append(("error", f"live pricing: timed out sampling {', '.join(batch)}"))
        return

    output = proc.stdout + proc.stderr
    failed_lines = [l.strip() for l in output.splitlines() if "FAILED" in l]
    skipped_lines = [l.strip() for l in output.splitlines() if "SKIPPED" in l]
    # A FAILED(year) line fires every time the *preferred* year 404s before
    # falling back to the other year -- confirmed normal, expected behavior
    # for far-future date-ranges outside Disney's ~400-450 day booking
    # horizon (see docs/live_pricing_plan.md's own pilot findings). Only
    # treat a failure as worth reviewing if its error text is something
    # OTHER than that well-understood 404 pattern -- a genuinely different
    # exception (timeout, JSON shape change, KeyError) is the real signal.
    unexpected_failures = [l for l in failed_lines if "404" not in l]

    if proc.returncode != 0:
        tail = failed_lines[:3] or output.strip().splitlines()[-3:]
        results.append(("error", f"live pricing: script exited {proc.returncode} for {', '.join(batch)} -- {'; '.join(tail)}"))
    elif unexpected_failures:
        results.append(("review", f"live pricing: {len(unexpected_failures)} unexpected fetch failure(s) sampling {', '.join(batch)} -- {unexpected_failures[0]}"))
    else:
        note = f", {len(skipped_lines)} date-range(s) with no data this run (booking horizon/sold out, expected)" if skipped_lines else ""
        results.append(("ok", f"live pricing: refreshed {', '.join(batch)}{note}"))

    build_live_pricing_summary(results)


LIVE_PRICING_JSON = os.path.join(os.path.dirname(__file__), "..", "data", "cash_prices_live.json")
LIVE_PRICING_SUMMARY_JS = os.path.join(os.path.dirname(__file__), "..", "data", "cash_prices_live_summary.js")


def build_live_pricing_summary(results):
    """Regenerates the lightweight client-facing summary from the full
    cash_prices_live.json every night, regardless of which resorts were
    just refreshed -- cheap (pure JSON transform, no network), and keeps
    the summary in sync with the full file's cumulative state rather than
    just tonight's batch. Strips each bucket's raw `history` array (kept
    in the full file for time-series analysis) down to just what the app
    needs to display -- average, last-checked price/date, sample count --
    so the file the browser downloads stays small and bounded no matter
    how much history accumulates server-side over time.
    """
    try:
        with open(LIVE_PRICING_JSON, "r", encoding="utf-8") as f:
            full = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        results.append(("error", f"live pricing summary: couldn't read {LIVE_PRICING_JSON} -- {e}"))
        return

    summary = {}
    for resort_id, resort_data in full.items():
        periods_out = []
        for p in resort_data.get("periods", []):
            room_types_out = {}
            for room_type, day_types in p.get("roomTypes", {}).items():
                room_types_out[room_type] = {
                    day_type: {
                        "average": bucket.get("average"),
                        "lastChecked": bucket.get("lastChecked"),
                        "lastCheckedAt": bucket.get("lastCheckedAt"),
                        "sampleCount": bucket.get("sampleCount"),
                    }
                    for day_type, bucket in day_types.items()
                }
            if room_types_out:
                periods_out.append({
                    "rangeStart": p.get("rangeStart"),
                    "rangeEnd": p.get("rangeEnd"),
                    "yearUsed": p.get("yearUsed"),
                    "roomTypes": room_types_out,
                })
        if periods_out:
            summary[resort_id] = {"periods": periods_out}

    js = (
        "// Auto-generated nightly by scripts/nightly_watchdog.py from data/cash_prices_live.json.\n"
        "// Stripped of raw sample history (kept there for time-series analysis) -- this file\n"
        "// only carries what the app displays: average, last-checked price/date, and sample\n"
        "// count per (resort, sampled date-range, room type, day type). See\n"
        "// docs/nightly_pipeline_plan.md and getLiveCashRate() in data.js.\n"
        f"const CASH_PRICES_LIVE = {json.dumps(summary, indent=2)};\n"
    )
    with open(LIVE_PRICING_SUMMARY_JS, "w", encoding="utf-8") as f:
        f.write(js)


def check_banking_reminders(state, results):
    """Reads reminder_run_log (public-readable, see
    db/migrations/017_add_reminder_run_log.sql) to confirm the
    send-banking-reminders Edge Function's daily pg_cron job is both
    firing and succeeding. That function's own {sent, skipped, errors}
    response only ever reaches pg_net's fire-and-forget caller -- without
    this check there's no way to notice a cron job that silently stopped
    firing, or a run that's failing for everyone, until an owner misses a
    real deadline."""
    import datetime
    url = (
        f"{REMINDER_SUPABASE_URL}/rest/v1/reminder_run_log"
        "?select=run_at,sent,skipped,error_count,errors"
        "&order=run_at.desc&limit=1"
    )
    req = urllib.request.Request(url, headers={
        "apikey": REMINDER_SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {REMINDER_SUPABASE_ANON_KEY}",
        "User-Agent": UA,
    })
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            rows = json.loads(resp.read())
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError) as e:
        results.append(("error", f"banking reminders: couldn't reach reminder_run_log to check -- {e}"))
        return

    if not rows:
        results.append((
            "error",
            "banking reminders: no runs recorded yet in reminder_run_log -- has the "
            "daily cron been scheduled? see docs/phase5_deployment.md step 7",
        ))
        return

    row = rows[0]
    run_at = datetime.datetime.fromisoformat(row["run_at"].replace("Z", "+00:00"))
    age_hours = (datetime.datetime.now(datetime.timezone.utc) - run_at).total_seconds() / 3600

    if age_hours > REMINDER_RUN_STALE_HOURS:
        results.append((
            "error",
            f"banking reminders: last run was {age_hours:.0f}h ago ({run_at.date()}) -- "
            f"expected daily, the pg_cron job may have stopped firing",
        ))
    elif row["error_count"] > 0:
        first_error = (row.get("errors") or ["(no detail)"])[0]
        results.append((
            "review",
            f"banking reminders: last run ({run_at.date()}) had {row['error_count']} "
            f"error(s) -- {first_error}",
        ))
    else:
        results.append((
            "ok",
            f"banking reminders: last run {run_at.date()} -- sent {row['sent']}, "
            f"skipped {row['skipped']}, no errors",
        ))


def severity_of(results):
    statuses = {r[0] for r in results}
    if "error" in statuses:
        return "error"
    if "review" in statuses:
        return "review"
    return "ok"


def build_email_html(results, severity):
    order = {"error": 0, "review": 1, "ok": 2}
    sorted_results = sorted(results, key=lambda r: order[r[0]])
    icon = {"error": "&#128308;", "review": "&#9888;&#65039;", "ok": "&#9989;"}
    rows = "".join(
        f'<li><strong>{icon[status]}</strong> {detail}</li>' for status, detail in sorted_results
    )
    return f"""
    <div style="font-family:sans-serif;font-size:14px;color:#222;">
      <h2 style="margin-bottom:4px;">DVC Companion Nightly Check</h2>
      <ul style="padding-left:18px;line-height:1.6;">{rows}</ul>
      <p style="color:#999;font-size:12px;margin-top:20px;">
        Freshness watchdogs only -- nothing here auto-updates data.js,
        resort_investment.js, or dues_historical.js. See
        docs/nightly_pipeline_plan.md.
      </p>
    </div>
    """


def send_email(subject, html):
    """Returns None on success, or an error-detail string on failure --
    never raises, so a Resend problem shows up as one more report line
    instead of crashing the whole run before the state file gets saved."""
    api_key = os.environ.get("RESEND_API_KEY")
    to_email = os.environ.get("DIGEST_TO_EMAIL")
    from_email = os.environ.get("DIGEST_FROM", "DVC Companion <digest@dvccompanion.com>")
    if not api_key or not to_email:
        print("[nightly_watchdog] RESEND_API_KEY/DIGEST_TO_EMAIL not set -- skipping send, printing report instead:\n")
        print(html)
        return None
    payload = json.dumps({"from": from_email, "to": to_email, "subject": subject, "html": html}).encode()
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            # Without this, urllib's default "Python-urllib/3.x" User-Agent
            # gets blocked by Cloudflare (in front of api.resend.com) before
            # the request ever reaches Resend's own auth logic -- confirmed
            # by a Cloudflare "error code: 1010" response, not a Resend one.
            "User-Agent": UA,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            print(f"[nightly_watchdog] Resend response: {resp.status}")
            return None
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "ignore")
        detail = f"Resend send failed: HTTP {e.code} -- {body}"
        print(f"[nightly_watchdog] {detail}")
        return detail
    except (urllib.error.URLError, TimeoutError) as e:
        detail = f"Resend send failed: {e}"
        print(f"[nightly_watchdog] {detail}")
        return detail


def main():
    state = load_state()
    results = []

    check_points_chart_pdfs(state, results)
    check_page_hashes(state, results)
    check_dues(state, results)
    check_direct_prices(state, results)
    check_dfb_calendar_freshness(state, results)
    check_undercover_tourist_season(state, results)
    check_live_pricing(state, results)
    check_banking_reminders(state, results)

    severity = severity_of(results)
    subject = {
        "ok": "✅ DVC Companion nightly check — all clear",
        "review": f"⚠️ DVC Companion nightly check — {sum(1 for r in results if r[0] == 'review')} item(s) need review",
        "error": "\U0001f534 DVC Companion nightly check — pipeline error",
    }[severity]

    html = build_email_html(results, severity)
    send_error = send_email(subject, html)
    if send_error:
        # Can't retroactively fix the email that just failed to send, but
        # this makes sure the failure still shows up in the run's own
        # printed output and exit code, not just silently swallowed.
        results.append(("error", send_error))
        severity = severity_of(results)
    save_state(state)

    print(f"[nightly_watchdog] severity={severity}")
    for status, detail in results:
        print(f"  [{status}] {detail}")

    # Non-zero exit on hard errors so GitHub Actions marks the run failed,
    # which triggers its own built-in failure notification as a backup net
    # even if the Resend send itself is what's broken.
    sys.exit(1 if severity == "error" else 0)


if __name__ == "__main__":
    main()
