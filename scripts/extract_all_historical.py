#!/usr/bin/env python3
"""
Extract DVC points chart data from all resort PDFs.
Generates a JavaScript file that pushes historical entries onto RESORTS[].

Usage:
    python3 scripts/extract_all_historical.py pdfs/
    python3 scripts/extract_all_historical.py pdfs/ --resort blt
    python3 scripts/extract_all_historical.py pdfs/ --max-year 2027
"""

import pdfplumber
import re
import json
import sys
import os
import argparse

# ─── Constants ────────────────────────────────────────────────────────────────

MONTH_MAP = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Sept': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
    'June': '06',
}

# Named period definitions (WDW 2016–2020, GCV pre-2021)
NAMED_PERIODS = {
    'ADVENTURE': {'name': 'Adventure', 'color': '#4CAF50'},
    'CHOICE':    {'name': 'Choice',    'color': '#9C27B0'},
    'DREAM':     {'name': 'Dream',     'color': '#2196F3'},
    'MAGIC':     {'name': 'Magic',     'color': '#FF9800'},
    'PREMIER':   {'name': 'Premier',   'color': '#F44336'},
}

# Unnamed period name/color assignments by period count
UNNAMED_SCHEMES = {
    3: [
        {'name': 'Value',   'color': '#4CAF50'},
        {'name': 'Peak',    'color': '#FF9800'},
        {'name': 'Premier', 'color': '#F44336'},
    ],
    4: [
        {'name': 'Value',   'color': '#4CAF50'},
        {'name': 'Regular', 'color': '#2196F3'},
        {'name': 'Peak',    'color': '#FF9800'},
        {'name': 'Premier', 'color': '#F44336'},
    ],
    5: [
        {'name': 'Value',    'color': '#4CAF50'},
        {'name': 'Regular',  'color': '#2196F3'},
        {'name': 'Choice',   'color': '#9C27B0'},
        {'name': 'Peak',     'color': '#FF9800'},
        {'name': 'Premier',  'color': '#F44336'},
    ],
    6: [
        {'name': 'Adventure', 'color': '#4CAF50'},
        {'name': 'Dream',     'color': '#2196F3'},
        {'name': 'Choice',    'color': '#9C27B0'},
        {'name': 'Select',    'color': '#FF9800'},
        {'name': 'Premier',   'color': '#E91E63'},
        {'name': 'Holiday',   'color': '#F44336'},
    ],
    7: [
        {'name': 'Adventure', 'color': '#4CAF50'},
        {'name': 'Dream',     'color': '#2196F3'},
        {'name': 'Choice',    'color': '#9C27B0'},
        {'name': 'Select',    'color': '#FF9800'},
        {'name': 'Preferred', 'color': '#00BCD4'},
        {'name': 'Premier',   'color': '#E91E63'},
        {'name': 'Holiday',   'color': '#F44336'},
    ],
}

# ─── Resort Configurations ───────────────────────────────────────────────────
# Each resort maps column_count → (room_ids, room_types)
# room_ids: JS property names matching data.js
# room_types: list of (id, display_name, sleeps)

RESORT_CONFIGS = {
    'akv': {
        'id': 'animalKingdomVillas',
        'name': "Disney's Animal Kingdom Villas",
        'room_configs': {
            14: {
                'ids': ['dsV', 'dsR', 'dsSV', 'dsC', 'oneV', 'oneR', 'oneSV', 'oneC',
                        'twoV', 'twoR', 'twoSV', 'twoC', 'threeR', 'threeSV'],
                'types': [
                    ('dsV',    'Deluxe Studio - Value',                  4),
                    ('dsR',    'Deluxe Studio - Resort View',            4),
                    ('dsSV',   'Deluxe Studio - Savanna View',           4),
                    ('dsC',    'Deluxe Studio - Club Concierge',         4),
                    ('oneV',   'One-Bedroom Villa - Value',              5),
                    ('oneR',   'One-Bedroom Villa - Resort View',        5),
                    ('oneSV',  'One-Bedroom Villa - Savanna View',       5),
                    ('oneC',   'One-Bedroom Villa - Club Concierge',     5),
                    ('twoV',   'Two-Bedroom Villa - Value',              9),
                    ('twoR',   'Two-Bedroom Villa - Resort View',        9),
                    ('twoSV',  'Two-Bedroom Villa - Savanna View',       9),
                    ('twoC',   'Two-Bedroom Villa - Club Concierge',     9),
                    ('threeR', 'Three-Bedroom Grand Villa - Resort View',12),
                    ('threeSV','Three-Bedroom Grand Villa - Savanna View',12),
                ],
            },
        },
    },
    'blt': {
        'id': 'bayLakeTower',
        'name': "Bay Lake Tower at Disney's Contemporary Resort",
        'room_configs': {
            11: {
                'ids': ['dsR', 'dsP', 'dsTP', 'oneR', 'oneP', 'oneTP',
                        'twoR', 'twoP', 'twoTP', 'threeP', 'threeTP'],
                'types': [
                    ('dsR',    'Deluxe Studio - Resort View',           4),
                    ('dsP',    'Deluxe Studio - Preferred View',        4),
                    ('dsTP',   'Deluxe Studio - Theme Park View',       4),
                    ('oneR',   'One-Bedroom Villa - Resort View',       5),
                    ('oneP',   'One-Bedroom Villa - Preferred View',    5),
                    ('oneTP',  'One-Bedroom Villa - Theme Park View',   5),
                    ('twoR',   'Two-Bedroom Villa - Resort View',       9),
                    ('twoP',   'Two-Bedroom Villa - Preferred View',    9),
                    ('twoTP',  'Two-Bedroom Villa - Theme Park View',   9),
                    ('threeP', 'Three-Bedroom Grand Villa - Preferred View', 12),
                    ('threeTP','Three-Bedroom Grand Villa - Theme Park View', 12),
                ],
            },
        },
    },
    'bcv': {
        'id': 'beachClubVillas',
        'name': "Disney's Beach Club Villas",
        'room_configs': {
            3: {
                'ids': ['deluxeStudio', 'oneBedroom', 'twoBedroom'],
                'types': [
                    ('deluxeStudio', 'Deluxe Studio',       5),
                    ('oneBedroom',   'One-Bedroom Villa',    4),
                    ('twoBedroom',   'Two-Bedroom Villa',    8),
                ],
            },
        },
    },
    'bwv': {
        'id': 'boardwalkVillas',
        'name': "Disney's BoardWalk Villas",
        'room_configs': {
            7: {
                'ids': ['dsR', 'dsBP', 'oneR', 'oneBP', 'twoR', 'twoBP', 'threeBP'],
                'types': [
                    ('dsR',    'Deluxe Studio - Resort View',               5),
                    ('dsBP',   'Deluxe Studio - Boardwalk/Preferred',       5),
                    ('oneR',   'One-Bedroom Villa - Resort View',           4),
                    ('oneBP',  'One-Bedroom Villa - Boardwalk/Preferred',   4),
                    ('twoR',   'Two-Bedroom Villa - Resort View',           9),
                    ('twoBP',  'Two-Bedroom Villa - Boardwalk/Preferred',   9),
                    ('threeBP','Three-Bedroom Grand Villa - Boardwalk/Preferred', 12),
                ],
            },
        },
    },
    'brv': {
        'id': 'boulderRidge',
        'name': "Boulder Ridge Villas at Disney's Wilderness Lodge",
        'room_configs': {
            3: {
                'ids': ['deluxeStudio', 'oneBedroom', 'twoBedroom'],
                'types': [
                    ('deluxeStudio', 'Deluxe Studio',       5),
                    ('oneBedroom',   'One-Bedroom Villa',    4),
                    ('twoBedroom',   'Two-Bedroom Villa',    8),
                ],
            },
        },
    },
    'ccv': {
        'id': 'copperCreek',
        'name': "Copper Creek Villas & Cabins at Disney's Wilderness Lodge",
        'room_configs': {
            5: {
                'ids': ['deluxeStudio', 'oneBedroom', 'twoBedroom', 'threeBedroom', 'twoBedCabin'],
                'types': [
                    ('deluxeStudio', 'Deluxe Studio',          4),
                    ('oneBedroom',   'One-Bedroom Villa',      4),
                    ('twoBedroom',   'Two-Bedroom Villa',      8),
                    ('threeBedroom', 'Three-Bedroom Grand Villa', 12),
                    ('twoBedCabin',  'Two-Bedroom Cabin',      8),
                ],
            },
        },
    },
    'cfw': {
        'id': 'fortWildernessCabins',
        'name': "The Cabins at Disney's Fort Wilderness Resort",
        'room_configs': {
            1: {
                'ids': ['cabin'],
                'types': [('cabin', 'Cabin', 6)],
            },
        },
    },
    'gcv': {
        'id': 'grandCalifornian',
        'name': "The Villas at Disney's Grand Californian Hotel & Spa",
        'room_configs': {
            4: {
                'ids': ['deluxeStudio', 'oneBedroom', 'twoBedroom', 'threeBedroom'],
                'types': [
                    ('deluxeStudio', 'Deluxe Studio',          4),
                    ('oneBedroom',   'One-Bedroom Villa',      5),
                    ('twoBedroom',   'Two-Bedroom Villa',      9),
                    ('threeBedroom', 'Three-Bedroom Grand Villa', 12),
                ],
            },
        },
    },
    'vgf': {
        'id': 'grandFloridian',
        'name': "The Villas at Disney's Grand Floridian Resort & Spa",
        'room_configs': {
            # Pre-2022: no Resort Studio, Standard/Lake views
            7: {
                'ids': ['dsR', 'dsP', 'oneR', 'oneP', 'twoR', 'twoP', 'threeP'],
                'types': [
                    ('dsR',    'Deluxe Studio - Resort View',           5),
                    ('dsP',    'Deluxe Studio - Preferred View',        5),
                    ('oneR',   'One-Bedroom Villa - Resort View',       5),
                    ('oneP',   'One-Bedroom Villa - Preferred View',    5),
                    ('twoR',   'Two-Bedroom Villa - Resort View',       9),
                    ('twoP',   'Two-Bedroom Villa - Preferred View',    9),
                    ('threeP', 'Three-Bedroom Grand Villa - Preferred View', 12),
                ],
            },
            # 2022+: added Resort Studio and Theme Park view
            10: {
                'ids': ['rsR', 'rsP', 'rsTP', 'dsR', 'dsP', 'oneR', 'oneP', 'twoR', 'twoP', 'threeP'],
                'types': [
                    ('rsR',    'Resort Studio - Resort View',           5),
                    ('rsP',    'Resort Studio - Preferred View',        5),
                    ('rsTP',   'Resort Studio - Theme Park View',       5),
                    ('dsR',    'Deluxe Studio - Resort View',           5),
                    ('dsP',    'Deluxe Studio - Preferred View',        5),
                    ('oneR',   'One-Bedroom Villa - Resort View',       5),
                    ('oneP',   'One-Bedroom Villa - Preferred View',    5),
                    ('twoR',   'Two-Bedroom Villa - Resort View',       9),
                    ('twoP',   'Two-Bedroom Villa - Preferred View',    9),
                    ('threeP', 'Three-Bedroom Grand Villa - Preferred View', 12),
                ],
            },
        },
    },
    'hhi': {
        'id': 'hiltonHead',
        'name': "Disney's Hilton Head Island Resort",
        'room_configs': {
            4: {
                'ids': ['deluxeStudio', 'oneBedroom', 'twoBedroom', 'threeBedroom'],
                'types': [
                    ('deluxeStudio', 'Deluxe Studio',          4),
                    ('oneBedroom',   'One-Bedroom Villa',      5),
                    ('twoBedroom',   'Two-Bedroom Villa',      9),
                    ('threeBedroom', 'Three-Bedroom Grand Villa', 12),
                ],
            },
        },
    },
    'okw': {
        'id': 'oldKeyWest',
        'name': "Disney's Old Key West Resort",
        'room_configs': {
            4: {
                'ids': ['deluxeStudio', 'oneBedroom', 'twoBedroom', 'threeBedroom'],
                'types': [
                    ('deluxeStudio', 'Deluxe Studio',          4),
                    ('oneBedroom',   'One-Bedroom Villa',      5),
                    ('twoBedroom',   'Two-Bedroom Villa',      9),
                    ('threeBedroom', 'Three-Bedroom Grand Villa', 12),
                ],
            },
        },
    },
    'pvb': {
        'id': 'polynesianVillas',
        'name': "Disney's Polynesian Villas & Bungalows",
        'room_configs': {
            # Pre-2024: just DS (Standard/Lake) + Bungalow
            3: {
                'ids': ['dsR', 'dsP', 'twoBedBungalow'],
                'types': [
                    ('dsR',           'Deluxe Studio - Resort View',   5),
                    ('dsP',           'Deluxe Studio - Preferred View', 5),
                    ('twoBedBungalow','Two-Bedroom Bungalow',          8),
                ],
            },
            # 2024+: added Island Tower rooms (17 PDF cols → 15 unique IDs)
            17: {
                'ids': ['dsR', 'dsP', 'twoBedBungalow',
                        'duoR', 'duoP', 'duoPM',
                        'dsR', 'dsP', 'dsTP',  # tower DS (R/P duplicate original)
                        'oneR', 'oneP', 'oneTP',
                        'twoR', 'twoP', 'twoTP',
                        'penthouseP', 'penthouseTP'],
                'types': [
                    ('dsR',           'Deluxe Studio - Resort View',              5),
                    ('dsP',           'Deluxe Studio - Preferred View',           5),
                    ('dsTP',          'Deluxe Studio - Theme Park View (Tower)',   4),
                    ('twoBedBungalow','Two-Bedroom Bungalow',                     8),
                    ('duoR',          'Duo Studio - Resort View (Tower)',          2),
                    ('duoP',          'Duo Studio - Preferred View (Tower)',       2),
                    ('duoPM',         'Duo Studio - Premium View (Tower)',         2),
                    ('oneR',          'One-Bedroom Villa - Resort View (Tower)',   5),
                    ('oneP',          'One-Bedroom Villa - Preferred View (Tower)',5),
                    ('oneTP',         'One-Bedroom Villa - Theme Park View (Tower)',5),
                    ('twoR',          'Two-Bedroom Villa - Resort View (Tower)',   9),
                    ('twoP',          'Two-Bedroom Villa - Preferred View (Tower)',9),
                    ('twoTP',         'Two-Bedroom Villa - Theme Park View (Tower)',9),
                    ('penthouseP',    'Two-Bedroom Penthouse - Preferred (Tower)', 8),
                    ('penthouseTP',   'Two-Bedroom Penthouse - Theme Park (Tower)',8),
                ],
            },
        },
    },
    'riv': {
        'id': 'rivieraResort',
        'name': "Disney's Riviera Resort",
        'room_configs': {
            8: {
                'ids': ['towerStudio', 'dsR', 'dsP', 'oneR', 'oneP', 'twoR', 'twoP', 'threeBedroom'],
                'types': [
                    ('towerStudio',  'Tower Studio',                     2),
                    ('dsR',          'Deluxe Studio - Resort View',      5),
                    ('dsP',          'Deluxe Studio - Preferred View',   5),
                    ('oneR',         'One-Bedroom Villa - Resort View',  5),
                    ('oneP',         'One-Bedroom Villa - Preferred View',5),
                    ('twoR',         'Two-Bedroom Villa - Resort View',  9),
                    ('twoP',         'Two-Bedroom Villa - Preferred View',9),
                    ('threeBedroom', 'Three-Bedroom Grand Villa',        12),
                ],
            },
        },
    },
    'ssr': {
        'id': 'saratogaSprings',
        'name': "Disney's Saratoga Springs Resort & Spa",
        'room_configs': {
            # 2016: No Standard/Preferred split, Treehouse before Grand Villa
            5: {
                'ids': ['deluxeStudio', 'oneBedroom', 'twoBedroom', 'treehouse', 'threeBedroom'],
                'types': [
                    ('deluxeStudio', 'Deluxe Studio',                  4),
                    ('oneBedroom',   'One-Bedroom Villa',              5),
                    ('twoBedroom',   'Two-Bedroom Villa',              9),
                    ('treehouse',    'Three-Bedroom Treehouse Villa',  9),
                    ('threeBedroom', 'Three-Bedroom Grand Villa',      12),
                ],
            },
            # 2017+: Standard/Preferred views
            9: {
                'ids': ['dsS', 'dsP', 'oneS', 'oneP', 'twoS', 'twoP', 'threeS', 'threeP', 'treehouse'],
                'types': [
                    ('dsS',       'Deluxe Studio - Standard',          4),
                    ('dsP',       'Deluxe Studio - Preferred',         4),
                    ('oneS',      'One-Bedroom Villa - Standard',      5),
                    ('oneP',      'One-Bedroom Villa - Preferred',     5),
                    ('twoS',      'Two-Bedroom Villa - Standard',      9),
                    ('twoP',      'Two-Bedroom Villa - Preferred',     9),
                    ('threeS',    'Three-Bedroom Grand Villa - Standard',12),
                    ('threeP',    'Three-Bedroom Grand Villa - Preferred',12),
                    ('treehouse', 'Three-Bedroom Treehouse Villa',     9),
                ],
            },
        },
    },
    'aul': {
        'id': 'aulani',
        'name': "Aulani, Disney Vacation Club Villas, Ko Olina, Hawai'i",
        'flat_rate': True,  # SUN—SAT format (same rate all days)
        'room_configs': {
            15: {
                'ids': ['hotelRoom', 'dsS', 'dsI', 'dsP', 'dsO',
                        'oneS', 'oneI', 'oneP', 'oneO',
                        'twoS', 'twoI', 'twoP', 'twoO',
                        'threeS', 'threeO'],
                'types': [
                    ('hotelRoom', 'Hotel Room',                          4),
                    ('dsS',       'Deluxe Studio - Standard',            4),
                    ('dsI',       'Deluxe Studio - Island Gardens',      4),
                    ('dsP',       'Deluxe Studio - Poolside Gardens',    4),
                    ('dsO',       'Deluxe Studio - Ocean View',          4),
                    ('oneS',      'One-Bedroom Villa - Standard',        5),
                    ('oneI',      'One-Bedroom Villa - Island Gardens',  5),
                    ('oneP',      'One-Bedroom Villa - Poolside Gardens',5),
                    ('oneO',      'One-Bedroom Villa - Ocean View',      5),
                    ('twoS',      'Two-Bedroom Villa - Standard',        9),
                    ('twoI',      'Two-Bedroom Villa - Island Gardens',  9),
                    ('twoP',      'Two-Bedroom Villa - Poolside Gardens',9),
                    ('twoO',      'Two-Bedroom Villa - Ocean View',      9),
                    ('threeS',    'Three-Bedroom Grand Villa - Standard',12),
                    ('threeO',    'Three-Bedroom Grand Villa - Ocean View',12),
                ],
            },
        },
    },
    'vbr': {
        'id': 'veroBeach',
        'name': "Disney's Vero Beach Resort",
        'room_configs': {
            6: {
                'ids': ['innStandard', 'deluxeStudio', 'innOcean', 'oneBedroom', 'twoBedroom', 'beachCottage'],
                'types': [
                    ('innStandard',  'Deluxe Inn Room - Standard View', 4),
                    ('deluxeStudio', 'Deluxe Studio',                   4),
                    ('innOcean',     'Deluxe Inn Room - Ocean View',    4),
                    ('oneBedroom',   'One-Bedroom Villa',               5),
                    ('twoBedroom',   'Two-Bedroom Villa',               9),
                    ('beachCottage', 'Three-Bedroom Beach Cottage',     12),
                ],
            },
        },
    },
    'vdh': {
        'id': 'disneylandHotel',
        'name': "The Villas at Disneyland Hotel",
        'room_configs': {
            9: {
                'ids': ['duoS', 'duoP', 'dsS', 'dsP', 'oneP', 'twoP', 'threeP', 'gardenDuo', 'gardenDS'],
                'types': [
                    ('duoS',      'Duo Studio - Standard',         2),
                    ('duoP',      'Duo Studio - Preferred',        2),
                    ('dsS',       'Deluxe Studio - Standard',      4),
                    ('dsP',       'Deluxe Studio - Preferred',     4),
                    ('oneP',      'One-Bedroom Villa - Preferred', 5),
                    ('twoP',      'Two-Bedroom Villa - Preferred', 9),
                    ('threeP',    'Three-Bedroom Grand Villa - Preferred', 12),
                    ('gardenDuo', 'Garden Room - Duo Studio',      2),
                    ('gardenDS',  'Garden Room - Deluxe Studio',   4),
                ],
            },
            # Fallback if VDH has 7 columns in some year (no Garden rooms)
            7: {
                'ids': ['duoS', 'duoP', 'dsS', 'dsP', 'oneP', 'twoP', 'threeP'],
                'types': [
                    ('duoS',   'Duo Studio - Standard',         2),
                    ('duoP',   'Duo Studio - Preferred',        2),
                    ('dsS',    'Deluxe Studio - Standard',      4),
                    ('dsP',    'Deluxe Studio - Preferred',     4),
                    ('oneP',   'One-Bedroom Villa - Preferred', 5),
                    ('twoP',   'Two-Bedroom Villa - Preferred', 9),
                    ('threeP', 'Three-Bedroom Grand Villa - Preferred', 12),
                ],
            },
        },
    },
}


# ─── PDF Text Extraction ─────────────────────────────────────────────────────

def extract_text(pdf_path):
    """Extract all text from a PDF, with normalization."""
    with pdfplumber.open(pdf_path) as pdf:
        text = '\n'.join(p.extract_text() or '' for p in pdf.pages)

    # Normalize spaced-out text artifacts (e.g., "F R I — S A T" → "FRI—SAT")
    text = re.sub(r'F\s*R\s*I\s*[—–\-]\s*S\s*A\s*T', 'FRI—SAT', text)
    text = re.sub(r'S\s*U\s*N\s*[—–\-]\s*T\s*H\s*U', 'SUN—THU', text)
    text = re.sub(r'S\s*U\s*N\s*[—–\-]\s*S\s*A\s*T', 'SUN—SAT', text)
    text = re.sub(r'W\s*E\s*E\s*K\s*L\s*Y', 'WEEKLY', text)

    # Normalize "F RI—SAT" → "FRI—SAT"
    text = re.sub(r'F\s+RI[—–\-]SAT', 'FRI—SAT', text)

    return text


# ─── Date Parsing ─────────────────────────────────────────────────────────────

def find_dates(text, year):
    """Find all date ranges in text. Returns list of {start, end} dicts."""
    results = []
    used = []

    # 1) Cross-month ranges: "Oct 1—Nov 22" or "Oct 1 - Nov 22"
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

    # 2) Same-month ranges: "Jan 1—31" or "Jan 1 - 31"
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
    for m in re.finditer(r'([A-Z][a-z]{2,3})\s+(\d{1,2})(?=\s|$|[,;])', text):
        if any(s <= m.start() < e for s, e in used):
            continue
        mo, d = m.group(1), int(m.group(2))
        if mo in MONTH_MAP and 1 <= d <= 31:
            results.append({
                'start': f'{year}-{MONTH_MAP[mo]}-{d:02d}',
                'end':   f'{year}-{MONTH_MAP[mo]}-{d:02d}'
            })
            used.append((m.start(), m.end()))

    return sorted(results, key=lambda d: d['start'])


# ─── Chart Parsing ────────────────────────────────────────────────────────────

def parse_chart(text, year, flat_rate=False):
    """
    Parse points chart text into structured period data.

    Returns list of period dicts:
      { name, color, sunThu: [nums], friSat: [nums], dateRanges: [...] }
    """
    lines = text.strip().split('\n')

    # Detect rate line format
    is_flat = flat_rate or bool(re.search(r'SUN[—–\-]SAT', text))

    # Find all rate-keyword lines
    entries = []
    for i, line in enumerate(lines):
        if re.search(r'SUN[—–\-]THU', line):
            entries.append(('sun', i, line))
        elif re.search(r'FRI[—–\-]SAT', line):
            entries.append(('fri', i, line))
        elif re.search(r'SUN[—–\-]SAT', line):
            entries.append(('sunsat', i, line))
        elif re.search(r'WEEKLY\s+\d', line):
            entries.append(('wk', i, line))

    # Group into periods
    periods = []
    idx = 0
    while idx < len(entries):
        entry_type = entries[idx][0]

        if entry_type == 'sunsat':
            # Flat rate (Aulani): SUN—SAT + WEEKLY
            sunsat_line_idx = entries[idx][1]
            sunsat_line = entries[idx][2]

            # Find block boundary (next SUN—SAT)
            next_line_idx = len(lines)
            for j in range(idx + 1, len(entries)):
                if entries[j][0] == 'sunsat':
                    next_line_idx = entries[j][1]
                    break

            block_text = '\n'.join(lines[sunsat_line_idx:next_line_idx])

            # Extract numbers
            match = re.search(r'SAT\s+([\d\s]+)', sunsat_line)
            nums = [int(x) for x in match.group(1).split()] if match else []

            # Check for named period
            period_name, period_color = None, None
            for key, val in NAMED_PERIODS.items():
                if key in sunsat_line:
                    period_name = val['name']
                    period_color = val['color']
                    break

            date_ranges = find_dates(block_text, year)

            periods.append({
                'name': period_name,
                'color': period_color,
                'sunThu': nums,
                'friSat': nums,  # same as sunThu for flat rate
                'dateRanges': date_ranges,
            })

            idx += 2  # skip WEEKLY

        elif entry_type == 'sun':
            # Standard: SUN—THU + FRI—SAT + WEEKLY
            sun_line_idx = entries[idx][1]
            sun_line = entries[idx][2]

            # Find block boundary (next SUN—THU or SUN—SAT)
            next_line_idx = len(lines)
            for j in range(idx + 1, len(entries)):
                if entries[j][0] in ('sun', 'sunsat'):
                    next_line_idx = entries[j][1]
                    break

            block_text = '\n'.join(lines[sun_line_idx:next_line_idx])

            # Extract SUN—THU numbers
            sun_match = re.search(r'THU\s+([\d\s]+)', sun_line)
            sun_nums = [int(x) for x in sun_match.group(1).split()] if sun_match else []

            # Extract FRI—SAT numbers
            fri_nums = []
            if idx + 1 < len(entries) and entries[idx + 1][0] == 'fri':
                fri_match = re.search(r'SAT\s+([\d\s]+)', entries[idx + 1][2])
                fri_nums = [int(x) for x in fri_match.group(1).split()] if fri_match else []

            # Check for named period
            period_name, period_color = None, None
            for key, val in NAMED_PERIODS.items():
                if key in sun_line:
                    period_name = val['name']
                    period_color = val['color']
                    break

            date_ranges = find_dates(block_text, year)

            periods.append({
                'name': period_name,
                'color': period_color,
                'sunThu': sun_nums,
                'friSat': fri_nums,
                'dateRanges': date_ranges,
            })

            idx += 3  # skip fri and wk

        else:
            idx += 1

    # Assign names to unnamed periods
    if not any(p['name'] for p in periods):
        scheme = UNNAMED_SCHEMES.get(len(periods))
        if scheme:
            for i, p in enumerate(periods):
                p['name'] = scheme[i]['name']
                p['color'] = scheme[i]['color']
        else:
            for i, p in enumerate(periods):
                p['name'] = f'Period {i + 1}'
                p['color'] = '#888888'

    return periods


# ─── JS Code Generation ──────────────────────────────────────────────────────

def format_rates_obj(nums, room_ids):
    """Format a rates dict as a JS object string, deduplicating IDs."""
    seen = {}
    for i in range(min(len(nums), len(room_ids))):
        rid = room_ids[i]
        if rid not in seen:
            seen[rid] = nums[i]
    return '{ ' + ', '.join(f'{k}:{v}' for k, v in seen.items()) + ' }'


def generate_js(all_data):
    """
    Generate complete data_historical.js content.

    all_data: dict of resort_key → { config, years: { year: periods } }
    """
    lines = []
    lines.append('// DVC Points Data — All Resorts (Historical)')
    lines.append('// Auto-extracted from official DVC PDFs via scripts/extract_all_historical.py')
    lines.append('// Source: https://dvcfieldguide.com/point-archive')
    lines.append('//')
    lines.append('// This file pushes historical resort entries onto the RESORTS array.')
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

    for resort_key in sorted(all_data.keys()):
        resort_data = all_data[resort_key]
        config = resort_data['config']
        years = resort_data['years']

        if not years:
            continue

        resort_id = config['id']
        resort_name = config['name']

        lines.append(f'// {"=" * 70}')
        lines.append(f'// {resort_name}')
        lines.append(f'// {"=" * 70}')
        lines.append('')

        for year in sorted(years.keys()):
            periods = years[year]
            num_periods = len(periods)

            # Detect column count from first period's sunThu
            num_cols = len(periods[0]['sunThu']) if periods else 0
            room_config = config['room_configs'].get(num_cols)
            if not room_config:
                lines.append(f'// SKIPPED {year}: {num_cols} columns not configured')
                lines.append('')
                continue

            room_ids = room_config['ids']
            room_types = room_config['types']

            var_name = f'{resort_key.upper()}_{year}'

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
            lines.append(f'  id: "{resort_id}",')

            # Escape quotes in name
            safe_name = resort_name.replace('"', '\\"')
            lines.append(f'  name: "{safe_name}",')
            lines.append(f'  year: {year},')
            lines.append('  roomTypes: [')
            # Deduplicate room types (for PVB with repeated IDs)
            seen_ids = set()
            for rid, rname, sleeps in room_types:
                if rid not in seen_ids:
                    safe_rname = rname.replace('"', '\\"')
                    lines.append(f'    {{ id: "{rid}", name: "{safe_rname}", sleeps: {sleeps} }},')
                    seen_ids.add(rid)
            lines.append('  ],')

            lines.append(f'  travelPeriods: buildPeriods({var_name}, [')
            for p in periods:
                sun_str = format_rates_obj(p['sunThu'], room_ids)
                fri_str = format_rates_obj(p['friSat'], room_ids)
                lines.append(f'    {{ sunThu: {sun_str},')
                lines.append(f'      friSat: {fri_str} }},')
            lines.append('  ]),')
            lines.append('});')
            lines.append('')

    lines.append(f'// {"=" * 70}')
    lines.append('// Deduplicate')
    lines.append(f'// {"=" * 70}')
    lines.append('')
    lines.append('// data.js already defines 2026/2027 entries, and those carry cash rates that')
    lines.append('// the PDF archive has no source for. This file re-emits the same years, so keep')
    lines.append('// the first entry for each (id, year) pair — data.js loads first, so it wins,')
    lines.append('// and the resort dropdowns stop listing every resort twice.')
    lines.append('(function dedupeResorts() {')
    lines.append('  const seen = new Set();')
    lines.append('  const unique = RESORTS.filter((r) => {')
    lines.append('    const key = r.id + "|" + r.year;')
    lines.append('    if (seen.has(key)) return false;')
    lines.append('    seen.add(key);')
    lines.append('    return true;')
    lines.append('  });')
    lines.append('  RESORTS.length = 0;')
    lines.append('  RESORTS.push(...unique);')
    lines.append('})();')
    lines.append('')

    return '\n'.join(lines)


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Extract DVC points from PDFs')
    parser.add_argument('pdf_dir', nargs='?', default='pdfs',
                        help='Directory containing resort PDF subdirectories')
    parser.add_argument('--resort', type=str, default=None,
                        help='Process only this resort (e.g., blt)')
    parser.add_argument('--min-year', type=int, default=2016,
                        help='Minimum year to process (default: 2016)')
    parser.add_argument('--max-year', type=int, default=2025,
                        help='Maximum year to process (default: 2025)')
    parser.add_argument('--json', action='store_true',
                        help='Also output JSON debug file')
    args = parser.parse_args()

    all_data = {}
    total_errors = []

    resorts_to_process = [args.resort] if args.resort else sorted(RESORT_CONFIGS.keys())

    for resort_key in resorts_to_process:
        if resort_key not in RESORT_CONFIGS:
            print(f'ERROR: Unknown resort "{resort_key}"', file=sys.stderr)
            continue

        config = RESORT_CONFIGS[resort_key]
        flat_rate = config.get('flat_rate', False)
        archive_dir = os.path.join(args.pdf_dir, f'{resort_key}_archive')

        if not os.path.isdir(archive_dir):
            print(f'SKIP {resort_key}: directory not found ({archive_dir})', file=sys.stderr)
            continue

        years_data = {}

        for year in range(args.min_year, args.max_year + 1):
            pdf_path = os.path.join(archive_dir, f'{resort_key}_{year}.pdf')
            if not os.path.exists(pdf_path):
                continue

            text = extract_text(pdf_path)
            if not text.strip():
                print(f'SKIP {resort_key} {year}: image-based PDF', file=sys.stderr)
                continue

            periods = parse_chart(text, year, flat_rate=flat_rate)

            if not periods:
                print(f'WARN {resort_key} {year}: no periods found', file=sys.stderr)
                continue

            # Auto-detect column count from first period
            num_cols = len(periods[0]['sunThu'])
            room_config = config['room_configs'].get(num_cols)

            if not room_config:
                print(f'ERROR {resort_key} {year}: {num_cols} columns not in config '
                      f'(expected {list(config["room_configs"].keys())})', file=sys.stderr)
                total_errors.append(f'{resort_key} {year}: {num_cols} cols unexpected')
                continue

            expected_cols = num_cols
            room_ids = room_config['ids']

            # Validate
            ok = True
            for i, p in enumerate(periods):
                if len(p['sunThu']) != expected_cols:
                    msg = f'{resort_key} {year} period {i} ({p["name"]}): {len(p["sunThu"])} sunThu (expected {expected_cols})'
                    print(f'ERROR: {msg}', file=sys.stderr)
                    total_errors.append(msg)
                    ok = False
                if len(p['friSat']) != expected_cols:
                    msg = f'{resort_key} {year} period {i} ({p["name"]}): {len(p["friSat"])} friSat (expected {expected_cols})'
                    print(f'ERROR: {msg}', file=sys.stderr)
                    total_errors.append(msg)
                    ok = False
                if not p['dateRanges']:
                    print(f'WARN  {resort_key} {year} period {i} ({p["name"]}): no date ranges', file=sys.stderr)

            status = 'OK' if ok else 'ERRORS'
            print(f'{resort_key} {year}: {len(periods)} periods, {expected_cols} cols [{status}]', file=sys.stderr)
            years_data[year] = periods

        all_data[resort_key] = {
            'config': config,
            'years': years_data,
        }

    if total_errors:
        print(f'\n{len(total_errors)} error(s) found. Review output carefully.', file=sys.stderr)

    # Output JSON debug file
    if args.json:
        json_path = os.path.join(args.pdf_dir, 'all_historical.json')
        # Convert to serializable format
        json_data = {}
        for rk, rd in all_data.items():
            json_data[rk] = {str(y): periods for y, periods in rd['years'].items()}
        with open(json_path, 'w') as f:
            json.dump(json_data, f, indent=2)
        print(f'\nJSON written to {json_path}', file=sys.stderr)

    # Output JS
    print(generate_js(all_data))


if __name__ == '__main__':
    main()
