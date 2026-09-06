#!/usr/bin/env python3
"""
Nightly freshness watchdog + morning digest email.

Checks whether any of DVCalc's manually-maintained data sources have
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
    DIGEST_FROM      -- optional, defaults to "DVCalc <digest@dvcalc.app>".

Usage:
    python3 scripts/nightly_watchdog.py
"""

import hashlib
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

# Pages checked by content-hash diff. No structured API exists for any of
# these -- a hash diff is the cheapest reliable "did this change" signal
# without attempting to parse and risk misreading an actual number.
HASH_WATCHED_PAGES = {
    "dvcresalemarket_dues": "https://www.dvcresalemarket.com/buying/annual-dues/",
    "mousesavers_hub_2027": "https://www.mousesavers.com/2027-disney-world-room-rates-season-dates/",
    "dvcnews_pricing": "https://dvcnews.com/dvc-program-menu/financial/pricing-a-promotions",
    "fidelity_blog": "https://www.fidelityrealestate.com/blog/",
}

PDF_CONTENT_API = "https://disneyvacationclub.disney.go.com/api/v1/content?url=/vacation-planning/points-charts&format=raw"


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
                results.append(("review", f"{key}: page content changed since last check -- {url}"))
            else:
                results.append(("ok", f"{key}: unchanged"))
            state["pageHashes"][key] = new_hash
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
            results.append(("error", f"{key}: fetch failed -- {e}"))


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
            joined = "; ".join(new_urls[:5])
            results.append(("review", f"points chart PDFs: {len(new_urls)} new PDF(s) found -- {joined}"))
        else:
            results.append(("ok", "points chart PDFs: no new charts"))
        state["knownPdfUrls"] = urls
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError) as e:
        results.append(("error", f"points chart PDFs: fetch/parse failed -- {e}"))


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
      <h2 style="margin-bottom:4px;">DVCalc Nightly Check</h2>
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
    from_email = os.environ.get("DIGEST_FROM", "DVCalc <digest@dvcalc.app>")
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
    check_undercover_tourist_season(state, results)
    check_live_pricing(state, results)

    severity = severity_of(results)
    subject = {
        "ok": "✅ DVCalc nightly check — all clear",
        "review": f"⚠️ DVCalc nightly check — {sum(1 for r in results if r[0] == 'review')} item(s) need review",
        "error": "\U0001f534 DVCalc nightly check — pipeline error",
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
