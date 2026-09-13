// Disney World Special Events Calendar (festivals, hard-ticket parties,
// runDisney weekends, seasonal windows)
// Source: Disney Food Blog's "DFB Disney World Calendar" (v26.10)
// https://www.disneyfoodblog.com/disney-world-calendar/
// Transcribed 2026-09-13. Only events with an explicit date range stated in
// the guide's monthly write-ups are included — anything the guide itself
// marked "TBD" or "dates not confirmed" was left out rather than guessed.
//
// category: "festival" (EPCOT festivals — the whole run, standard park hours),
//           "hardTicketEvent" (separately-ticketed evening event — runs on
//           SELECT NIGHTS within the range, not every night),
//           "runDisney" (race weekend — expect early mornings & elevated crowds),
//           "seasonal" (general resort-wide atmosphere, not a discrete event),
//           "singleDay" (a specific calendar date)
//
// approxDates: true means the range was inferred from the guide's day-by-day
// calendar grid rather than stated as prose text — treat the edges as
// give-or-take a few days.
const DISNEY_EVENTS = [
  {
    name: "EPCOT International Food & Wine Festival",
    category: "festival",
    park: "EPCOT",
    startDate: "2026-08-27",
    endDate: "2026-11-21",
    description: "Global marketplaces, culinary demos, and concerts around World Showcase.",
  },
  {
    name: "Mickey's Not-So-Scary Halloween Party",
    category: "hardTicketEvent",
    park: "Magic Kingdom",
    startDate: "2026-08-07",
    endDate: "2026-10-31",
    description: "Separately-ticketed evening party with trick-or-treating, a parade, and fireworks. Select nights only.",
  },
  {
    name: "H2O Glow After Hours",
    category: "hardTicketEvent",
    park: "Typhoon Lagoon",
    startDate: "2026-06-02",
    endDate: "2026-09-05",
    description: "Separately-ticketed nighttime water park event. Select nights only.",
  },
  {
    name: "Disney Wine & Dine Half Marathon Weekend",
    category: "runDisney",
    park: "EPCOT",
    startDate: "2026-10-22",
    endDate: "2026-10-25",
    approxDates: true,
    description: "runDisney race weekend — expect elevated crowds and early park mornings around EPCOT.",
  },
  {
    name: "EPCOT International Festival of the Holidays",
    category: "festival",
    park: "EPCOT",
    startDate: "2026-11-27",
    endDate: "2026-12-30",
    approxDates: true,
    description: "Holiday kitchens, Candlelight Processional, and the Holidays Around the World showcase.",
  },
  {
    name: "Mickey's Very Merry Christmas Party",
    category: "hardTicketEvent",
    park: "Magic Kingdom",
    startDate: "2026-11-06",
    endDate: "2026-12-22",
    approxDates: true,
    description: "Separately-ticketed holiday party with a parade, fireworks, and snow on Main Street. Select nights only.",
  },
  {
    name: "Disney Jollywood Nights",
    category: "hardTicketEvent",
    park: "Hollywood Studios",
    startDate: "2026-11-02",
    endDate: "2026-12-20",
    approxDates: true,
    description: "Separately-ticketed villains-themed evening event at Hollywood Studios. Select nights only.",
  },
  {
    name: "Holiday Season in Disney World",
    category: "seasonal",
    park: "All Parks & Resorts",
    startDate: "2026-11-06",
    endDate: "2027-01-04",
    approxDates: true,
    description: "Resort-wide decorations, entertainment, and holiday treats even outside the ticketed parties.",
  },
  {
    name: "Thanksgiving Day",
    category: "singleDay",
    park: "All Parks",
    startDate: "2026-11-26",
    endDate: "2026-11-26",
    description: "Look for specialty Thanksgiving eats at table-service restaurants.",
  },
  {
    name: "New Year's Eve Fireworks",
    category: "singleDay",
    park: "Magic Kingdom / EPCOT / Hollywood Studios",
    startDate: "2026-12-31",
    endDate: "2026-12-31",
    description: "Extended evenings with major fireworks displays to ring in the new year.",
  },
  {
    name: "EPCOT International Festival of the Arts",
    category: "festival",
    park: "EPCOT",
    startDate: "2027-01-15",
    endDate: "2027-03-01",
    description: "Visual, culinary, and performing arts showcase with Figment-themed treats and artist exhibits.",
  },
  {
    name: "Walt Disney World Marathon Weekend",
    category: "runDisney",
    park: "Magic Kingdom / EPCOT",
    startDate: "2027-01-07",
    endDate: "2027-01-11",
    approxDates: true,
    description: "runDisney race weekend — expect elevated crowds and early park mornings.",
  },
  {
    name: "runDisney Disney Princess Half Marathon Weekend",
    category: "runDisney",
    park: "EPCOT",
    startDate: "2027-02-25",
    endDate: "2027-03-01",
    approxDates: true,
    description: "runDisney race weekend — expect elevated crowds and early park mornings around EPCOT.",
  },
  {
    name: "EPCOT International Flower & Garden Festival",
    category: "festival",
    park: "EPCOT",
    startDate: "2027-03-10",
    endDate: "2027-05-31",
    description: "Topiaries, garden marketplaces, and the Garden Rocks concert series around World Showcase.",
  },
  {
    name: "runDisney Springtime Surprise Weekend",
    category: "runDisney",
    park: "EPCOT",
    startDate: "2027-04-08",
    endDate: "2027-04-11",
    approxDates: true,
    description: "runDisney race weekend — expect elevated crowds and early park mornings around EPCOT.",
  },
  {
    name: "May the 4th / Star Wars Day",
    category: "singleDay",
    park: "Hollywood Studios",
    startDate: "2027-05-04",
    endDate: "2027-05-04",
    description: "Star Wars-themed snacks, merch, and character appearances.",
  },
];

// Returns the events active on a given "YYYY-MM-DD" date, sorted with
// hard-ticket/single-day events first (the most date-specific, highest-signal
// ones) ahead of the broader festival/seasonal windows.
const EVENT_CATEGORY_ORDER = { singleDay: 0, hardTicketEvent: 1, runDisney: 2, festival: 3, seasonal: 4 };
function getEventsForDate(dateStr) {
  return DISNEY_EVENTS
    .filter((e) => e.startDate <= dateStr && dateStr <= e.endDate)
    .sort((a, b) => EVENT_CATEGORY_ORDER[a.category] - EVENT_CATEGORY_ORDER[b.category]);
}
