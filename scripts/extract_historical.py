#!/usr/bin/env python3
"""
Extract DVC points chart data from PDFs (all years).

Parses AKV (Animal Kingdom Villas) PDFs from 2016-2027 and outputs
a JavaScript file (data_historical.js) that pushes entries onto RESORTS[].

Usage:
    python3 scripts/extract_historical.py pdfs/akv_archive/
"""

import pdfplumber
import re
import json
import sys
import os

MONTH_MAP = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Sept': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
}

# AKV has 14 columns: 4 DS views + 4 1BR views + 4 2BR views + 2 3BR views
AKV_ROOM_IDS = [
    'dsV', 'dsR', 'dsSV', 'dsC',
    'oneV', 'oneR', 'oneSV', 'oneC',
    'twoV', 'twoR', 'twoSV', 'twoC',
    'threeR', 'threeSV'
]

# 5-period named charts (2016-2020)
NAMED_PERIODS = {
    'ADVENTURE': {'name': 'Adventure', 'color': '#4CAF50'},
    'CHOICE':    {'name': 'Choice',    'color': '#9C27B0'},
    'DREAM':     {'name': 'Dream',     'color': '#2196F3'},
    'MAGIC':     {'name': 'Magic',     'color': '#FF9800'},
    'PREMIER':   {'name': 'Premier',   'color': '#F44336'},
}

# 7-period unnamed charts (2021+) — assigned by cost tier (cheapest→most expensive)
UNNAMED_7 = [
    {'name': 'Adventure', 'color': '#4CAF50'},
    {'name': 'Dream',     'color': '#2196F3'},
    {'name': 'Choice',    'color': '#9C27B0'},
    {'name': 'Select',    'color': '#FF9800'},
    {'name': 'Preferred', 'color': '#00BCD4'},
    {'name': 'Premier',   'color': '#E91E63'},
    {'name': 'Holiday',   'color': '#F44336'},
]

# Room type display names vary by year (Standard View → Resort View in 2026)
def akv_room_types(year):
    view_name = 'Resort View' if year >= 2026 else 'Standard View'
    return [
        ('dsV',    'Deluxe Studio - Value',                         4),
        ('dsR',    f'Deluxe Studio - {view_name}',                  4),
        ('dsSV',   'Deluxe Studio - Savanna View',                  4),
        ('dsC',    'Deluxe Studio - Club Concierge',                4),
        ('oneV',   'One-Bedroom Villa - Value',                     5),
        ('oneR',   f'One-Bedroom Villa - {view_name}',              5),
        ('oneSV',  'One-Bedroom Villa - Savanna View',              5),
        ('oneC',   'One-Bedroom Villa - Club Concierge',            5),
        ('twoV',   'Two-Bedroom Villa - Value',                     9),
        ('twoR',   f'Two-Bedroom Villa - {view_name}',              9),
        ('twoSV',  'Two-Bedroom Villa - Savanna View',              9),
        ('twoC',   'Two-Bedroom Villa - Club Concierge',            9),
        ('threeR', f'Three-Bedroom Grand Villa - {view_name}',     12),
        ('threeSV','Three-Bedroom Grand Villa - Savanna View',     12),
    ]


def extract_text(pdf_path):
    """Extract all text from a PDF file."""
    with pdfplumber.open(pdf_path) as pdf:
        return '\n'.join(p.extract_text() or '' for p in pdf.pages)


def find_dates(text, year):
    """Find all date ranges in a text string. Returns list of {start, end} dicts."""
    results = []
    used = []  # (start_pos, end_pos) of already-matched spans

    # 1) Cross-month ranges: "Oct 1—Nov 22"
    for m in re.finditer(
        r'([A-Z][a-z]{2,3})\s+(\d{1,2})\s*[—–\-]\s*([A-Z][a-z]{2,3})\s+(\d{1,2})', text
    ):
        m1, d1, m2, d2 = m.group(1), int(m.group(2)), m.group(3), int(m.group(4))
        if m1 in MONTH_MAP and m2 in MONTH_MAP:
            results.append({
                'start': f'{year}-{MONTH_MAP[m1]}-{d1:02d}',
                'end':   f'{year}-{MONTH_MAP[m2]}-{d2:02d}'
            })
            used.append((m.start(), m.end()))

    # 2) Same-month ranges: "Jan 1—31"
    for m in re.finditer(
        r'([A-Z][a-z]{2,3})\s+(\d{1,2})\s*[—–\-]\s*(\d{1,2})', text
    ):
        if any(s <= m.start() and m.end() <= e for s, e in used):
            continue
        mo, d1, d2 = m.group(1), int(m.group(2)), int(m.group(3))
        if mo in MONTH_MAP and d2 <= 31:
            results.append({
                'start': f'{year}-{MONTH_MAP[mo]}-{d1:02d}',
                'end':   f'{year}-{MONTH_MAP[mo]}-{d2:02d}'
            })
            used.append((m.start(), m.end()))

    # 3) Single days: "Nov 30"
    for m in re.finditer(r'([A-Z][a-z]{2,3})\s+(\d{1,2})(?=\s|$)', text):
        if any(s <= m.start() < e for s, e in used):
            continue
        mo, d = m.group(1), int(m.group(2))
        if mo in MONTH_MAP and 1 <= d <= 31:
            results.append({
                'start': f'{year}-{MONTH_MAP[mo]}-{d:02d}',
                'end':   f'{year}-{MONTH_MAP[mo]}-{d:02d}'
            })
            used.append((m.start(), m.end()))

    return results


def parse_chart(text, year):
    """Parse points chart text into structured period data."""
    lines = text.strip().split('\n')

    # Find all rate-keyword lines
    entries = []
    for i, line in enumerate(lines):
        if re.search(r'SUN[—–\-]THU', line):
            entries.append(('sun', i, line))
        elif re.search(r'FRI[—–\-]SAT', line):
            entries.append(('fri', i, line))
        elif re.search(r'WEEKLY\s+\d', line):
            entries.append(('wk', i, line))

    # Group into triples and extract data
    periods = []
    idx = 0
    while idx < len(entries):
        if entries[idx][0] != 'sun':
            idx += 1
            continue

        sun_line_idx = entries[idx][1]
        sun_line = entries[idx][2]

        # Find the next SUN line (start of next period) for block boundary
        next_sun_line_idx = len(lines)
        for j in range(idx + 1, len(entries)):
            if entries[j][0] == 'sun':
                next_sun_line_idx = entries[j][1]
                break

        # Collect the block text (all lines from this SUN to next SUN)
        block_text = '\n'.join(lines[sun_line_idx:next_sun_line_idx])

        # Extract SUN—THU numbers
        sun_match = re.search(r'THU\s+([\d\s]+)', sun_line)
        sun_nums = [int(x) for x in sun_match.group(1).split()][:14] if sun_match else []

        # Extract FRI—SAT numbers
        fri_nums = []
        if idx + 1 < len(entries) and entries[idx + 1][0] == 'fri':
            fri_match = re.search(r'SAT\s+([\d\s]+)', entries[idx + 1][2])
            fri_nums = [int(x) for x in fri_match.group(1).split()][:14] if fri_match else []

        # Extract period name (5-period charts have "ADVENTURE SEASON" etc.)
        period_name = None
        period_color = None
        for key, val in NAMED_PERIODS.items():
            if key in sun_line:
                period_name = val['name']
                period_color = val['color']
                break

        # Extract date ranges from entire block, sorted by start date
        date_ranges = sorted(find_dates(block_text, year), key=lambda d: d['start'])

        periods.append({
            'name': period_name,
            'color': period_color,
            'sunThu': sun_nums,
            'friSat': fri_nums,
            'dateRanges': date_ranges,
        })

        idx += 3  # skip past fri and wk

    # Assign names to unnamed periods (7-period charts)
    if not any(p['name'] for p in periods):
        defaults = UNNAMED_7 if len(periods) == 7 else None
        if defaults:
            for i, p in enumerate(periods):
                p['name'] = defaults[i]['name']
                p['color'] = defaults[i]['color']
        else:
            for i, p in enumerate(periods):
                p['name'] = f'Period {i + 1}'
                p['color'] = '#888888'

    return periods


def format_rates_obj(nums, room_ids):
    """Format a rates dict as a JS object string."""
    pairs = []
    for i in range(min(len(nums), len(room_ids))):
        pairs.append(f'{room_ids[i]}:{nums[i]}')
    return '{ ' + ', '.join(pairs) + ' }'


def generate_js(all_years):
    """Generate data_historical.js content."""
    min_year = min(all_years.keys())
    max_year = max(all_years.keys())
    lines = []
    lines.append(f'// DVC Points Data — Animal Kingdom Villas ({min_year}-{max_year})')
    lines.append('// Auto-extracted from official DVC PDFs via scripts/extract_historical.py')
    lines.append('// Source: https://dvcfieldguide.com/point-archive')
    lines.append('//')
    lines.append('// This file pushes AKV resort entries onto the RESORTS array.')
    lines.append('// Include after data.js in index.html.')
    lines.append('')
    lines.append('// Generic period builder — combines period definitions with rate arrays.')
    lines.append('// Supports optional cashRates as third argument.')
    lines.append('function buildPeriods(periodDefs, rates, cashRates) {')
    lines.append('  return periodDefs.map((def, i) => {')
    lines.append('    const period = { ...def, rates: rates[i] };')
    lines.append('    if (cashRates && cashRates[i]) period.cashRates = cashRates[i];')
    lines.append('    return period;')
    lines.append('  });')
    lines.append('}')
    lines.append('')

    for year in sorted(all_years.keys()):
        periods = all_years[year]
        num_periods = len(periods)
        var_name = f'WDW_{year}'
        room_types = akv_room_types(year)

        lines.append(f'// === {year} — {num_periods} travel periods ===')
        lines.append(f'const {var_name} = [')
        for p in periods:
            dr_parts = []
            for d in p['dateRanges']:
                dr_parts.append(f'{{ start: "{d["start"]}", end: "{d["end"]}" }}')
            dr_str = ', '.join(dr_parts)
            lines.append(f'  {{ name: "{p["name"]}", color: "{p["color"]}", dateRanges: [{dr_str}] }},')
        lines.append('];')
        lines.append('')

        lines.append('RESORTS.push({')
        lines.append('  id: "animalKingdomVillas",')
        lines.append("  name: \"Disney's Animal Kingdom Villas\",")
        lines.append(f'  year: {year},')
        lines.append('  roomTypes: [')
        for rid, rname, sleeps in room_types:
            lines.append(f'    {{ id: "{rid}", name: "{rname}", sleeps: {sleeps} }},')
        lines.append('  ],')
        lines.append(f'  travelPeriods: buildPeriods({var_name}, [')
        for p in periods:
            sun_str = format_rates_obj(p['sunThu'], AKV_ROOM_IDS)
            fri_str = format_rates_obj(p['friSat'], AKV_ROOM_IDS)
            lines.append(f'    {{ sunThu: {sun_str},')
            lines.append(f'      friSat: {fri_str} }},')
        lines.append('  ]),')
        lines.append('});')
        lines.append('')

    return '\n'.join(lines)


def main():
    pdf_dir = sys.argv[1] if len(sys.argv) > 1 else 'pdfs/akv_archive'
    all_years = {}
    errors = []

    for year in range(2016, 2028):
        pdf_path = os.path.join(pdf_dir, f'akv_{year}.pdf')
        if not os.path.exists(pdf_path):
            print(f'SKIP {year}: file not found ({pdf_path})', file=sys.stderr)
            continue

        text = extract_text(pdf_path)
        if not text.strip():
            print(f'SKIP {year}: image-based PDF (no extractable text)', file=sys.stderr)
            continue

        periods = parse_chart(text, year)

        # Validate
        ok = True
        for i, p in enumerate(periods):
            if len(p['sunThu']) != 14:
                msg = f'{year} period {i} ({p["name"]}): {len(p["sunThu"])} sunThu values (expected 14)'
                print(f'ERROR: {msg}', file=sys.stderr)
                errors.append(msg)
                ok = False
            if len(p['friSat']) != 14:
                msg = f'{year} period {i} ({p["name"]}): {len(p["friSat"])} friSat values (expected 14)'
                print(f'ERROR: {msg}', file=sys.stderr)
                errors.append(msg)
                ok = False
            if not p['dateRanges']:
                msg = f'{year} period {i} ({p["name"]}): no date ranges'
                print(f'WARN:  {msg}', file=sys.stderr)

        status = 'OK' if ok else 'ERRORS'
        print(f'{year}: {len(periods)} periods [{status}]', file=sys.stderr)
        all_years[year] = periods

    if errors:
        print(f'\n{len(errors)} error(s) found. Review output carefully.', file=sys.stderr)

    # Also output JSON for debugging
    json_path = os.path.join(os.path.dirname(pdf_dir), 'akv_historical.json')
    with open(json_path, 'w') as f:
        json.dump(all_years, f, indent=2)
    print(f'\nJSON written to {json_path}', file=sys.stderr)

    # Output JS to stdout
    print(generate_js(all_years))


if __name__ == '__main__':
    main()
