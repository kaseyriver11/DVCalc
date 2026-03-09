// DVC Availability Data — extracted from DVC Field Guide charts
// Source: https://dvcfieldguide.com/availability-tables
// Values represent average days available (out of 7) at each booking window
// 7.0 = available every day, 0.0 = never available
//
// Periods: newYears, marathon (WDW only), presidents, easter,
//          summer, foodAndWine (WDW only), thanksgiving, christmas
// Windows: 11Mo (home resort), 7Mo (non-home), 5Mo, 3Mo, 1Mo

const AVAILABILITY_DATA = {
  "animalKingdomVillas": {
    "dsV": {
      "newYears": {
        "11Mo": 5.0,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 5.8,
        "7Mo": 0.2,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 6.4,
        "7Mo": 0.1,
        "5Mo": 0.0,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 6.6,
        "7Mo": 0.6,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.4
      },
      "summer": {
        "11Mo": 5.7,
        "7Mo": 0.5,
        "5Mo": 0.0,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "foodAndWine": {
        "11Mo": 5.8,
        "7Mo": 0.2,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "thanksgiving": {
        "11Mo": 5.8,
        "7Mo": 0.1,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 4.5,
        "7Mo": 0.0,
        "5Mo": 0.1,
        "3Mo": 0.1,
        "1Mo": 0.0
      }
    },
    "dsR": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 1.9,
        "5Mo": 0.3,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 4.4,
        "5Mo": 1.6,
        "3Mo": 0.6,
        "1Mo": 0.5
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.5,
        "5Mo": 1.6,
        "3Mo": 0.5,
        "1Mo": 0.3
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.3,
        "5Mo": 3.5,
        "3Mo": 1.8,
        "1Mo": 1.2
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 3.7,
        "3Mo": 1.8,
        "1Mo": 1.2
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 4.2,
        "5Mo": 1.2,
        "3Mo": 0.6,
        "1Mo": 0.5
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.6,
        "5Mo": 1.1,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 3.4,
        "5Mo": 1.6,
        "3Mo": 0.5,
        "1Mo": 0.3
      }
    },
    "dsSV": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.7,
        "5Mo": 0.1,
        "3Mo": 0.1,
        "1Mo": 0.2
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 5.1,
        "5Mo": 1.9,
        "3Mo": 0.4,
        "1Mo": 0.4
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.3,
        "5Mo": 1.7,
        "3Mo": 0.6,
        "1Mo": 0.3
      },
      "easter": {
        "11Mo": 6.8,
        "7Mo": 6.9,
        "5Mo": 3.8,
        "3Mo": 1.9,
        "1Mo": 1.4
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 4.5,
        "3Mo": 2.3,
        "1Mo": 1.4
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.1,
        "5Mo": 1.4,
        "3Mo": 0.6,
        "1Mo": 0.6
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.3,
        "5Mo": 2.0,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 5.4,
        "5Mo": 2.0,
        "3Mo": 0.7,
        "1Mo": 0.4
      }
    },
    "dsC": {
      "newYears": {
        "11Mo": 5.8,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 5.6,
        "7Mo": 0.1,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 5.3,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "easter": {
        "11Mo": 4.7,
        "7Mo": 0.1,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 4.9,
        "7Mo": 0.2,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 5.0,
        "7Mo": 0.1,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "thanksgiving": {
        "11Mo": 4.7,
        "7Mo": 0.1,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 5.6,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "oneV": {
      "newYears": {
        "11Mo": 6.0,
        "7Mo": 0.6,
        "5Mo": 0.3,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 6.3,
        "7Mo": 2.2,
        "5Mo": 1.4,
        "3Mo": 0.3,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 6.4,
        "7Mo": 2.8,
        "5Mo": 0.5,
        "3Mo": 0.6,
        "1Mo": 0.3
      },
      "easter": {
        "11Mo": 6.5,
        "7Mo": 3.1,
        "5Mo": 1.9,
        "3Mo": 1.1,
        "1Mo": 0.6
      },
      "summer": {
        "11Mo": 6.3,
        "7Mo": 3.5,
        "5Mo": 1.6,
        "3Mo": 1.0,
        "1Mo": 0.7
      },
      "foodAndWine": {
        "11Mo": 6.2,
        "7Mo": 2.8,
        "5Mo": 1.0,
        "3Mo": 0.6,
        "1Mo": 0.5
      },
      "thanksgiving": {
        "11Mo": 6.1,
        "7Mo": 0.7,
        "5Mo": 1.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 5.3,
        "7Mo": 1.6,
        "5Mo": 1.0,
        "3Mo": 0.1,
        "1Mo": 0.3
      }
    },
    "oneR": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 3.6,
        "5Mo": 0.7,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.5,
        "5Mo": 3.9,
        "3Mo": 1.8,
        "1Mo": 1.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 3.6,
        "3Mo": 1.8,
        "1Mo": 1.1
      },
      "easter": {
        "11Mo": 6.9,
        "7Mo": 7.0,
        "5Mo": 6.6,
        "3Mo": 5.1,
        "1Mo": 2.6
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.4,
        "3Mo": 4.5,
        "1Mo": 2.9
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 3.6,
        "3Mo": 2.1,
        "1Mo": 1.4
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 3.8,
        "5Mo": 2.6,
        "3Mo": 0.5,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 5.2,
        "5Mo": 2.6,
        "3Mo": 1.0,
        "1Mo": 1.0
      }
    },
    "oneSV": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 4.0,
        "5Mo": 0.5,
        "3Mo": 0.2,
        "1Mo": 0.2
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.4,
        "5Mo": 2.8,
        "3Mo": 1.3,
        "1Mo": 0.8
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.5,
        "5Mo": 3.0,
        "3Mo": 1.1,
        "1Mo": 0.9
      },
      "easter": {
        "11Mo": 6.8,
        "7Mo": 6.7,
        "5Mo": 5.5,
        "3Mo": 4.1,
        "1Mo": 2.8
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.8,
        "3Mo": 4.0,
        "1Mo": 2.5
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 6.5,
        "5Mo": 2.9,
        "3Mo": 1.6,
        "1Mo": 1.1
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 3.6,
        "5Mo": 2.0,
        "3Mo": 0.4,
        "1Mo": 0.2
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 5.9,
        "5Mo": 2.0,
        "3Mo": 1.0,
        "1Mo": 0.7
      }
    },
    "oneC": {
      "newYears": {
        "11Mo": 5.8,
        "7Mo": 0.7,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 6.1,
        "7Mo": 0.7,
        "5Mo": 0.5,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 5.9,
        "7Mo": 1.1,
        "5Mo": 0.1,
        "3Mo": 0.3,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 5.6,
        "7Mo": 3.7,
        "5Mo": 0.3,
        "3Mo": 0.4,
        "1Mo": 0.2
      },
      "summer": {
        "11Mo": 5.3,
        "7Mo": 2.0,
        "5Mo": 0.3,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "foodAndWine": {
        "11Mo": 5.0,
        "7Mo": 1.1,
        "5Mo": 0.1,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "thanksgiving": {
        "11Mo": 5.5,
        "7Mo": 0.1,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 5.2,
        "7Mo": 0.4,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.3
      }
    },
    "twoV": {
      "newYears": {
        "11Mo": 5.0,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 5.3,
        "7Mo": 0.1,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 6.0,
        "7Mo": 0.1,
        "5Mo": 0.0,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 6.4,
        "7Mo": 0.5,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 5.4,
        "7Mo": 0.3,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 5.6,
        "7Mo": 0.2,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "thanksgiving": {
        "11Mo": 5.6,
        "7Mo": 0.0,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 4.3,
        "7Mo": 0.0,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "twoR": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 1.6,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 4.8,
        "5Mo": 2.0,
        "3Mo": 0.8,
        "1Mo": 0.4
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.6,
        "5Mo": 2.0,
        "3Mo": 0.8,
        "1Mo": 0.7
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 4.3,
        "3Mo": 2.9,
        "1Mo": 1.9
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 3.8,
        "3Mo": 2.1,
        "1Mo": 1.4
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.0,
        "5Mo": 1.6,
        "3Mo": 1.0,
        "1Mo": 0.9
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.7,
        "5Mo": 1.5,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 3.1,
        "5Mo": 1.5,
        "3Mo": 0.4,
        "1Mo": 0.6
      }
    },
    "twoSV": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 3.3,
        "5Mo": 0.2,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 1.7,
        "3Mo": 0.7,
        "1Mo": 0.6
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.2,
        "5Mo": 2.3,
        "3Mo": 1.0,
        "1Mo": 0.8
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 5.0,
        "3Mo": 3.6,
        "1Mo": 2.5
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.2,
        "3Mo": 3.0,
        "1Mo": 1.8
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.9,
        "5Mo": 2.1,
        "3Mo": 1.1,
        "1Mo": 1.1
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 2.2,
        "5Mo": 1.8,
        "3Mo": 0.3,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 5.7,
        "5Mo": 1.8,
        "3Mo": 0.6,
        "1Mo": 0.3
      }
    },
    "twoC": {
      "newYears": {
        "11Mo": 5.3,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 5.4,
        "7Mo": 0.1,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 5.1,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 5.1,
        "7Mo": 0.1,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 4.2,
        "7Mo": 0.1,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 4.3,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "thanksgiving": {
        "11Mo": 4.7,
        "7Mo": 1.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 5.2,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "threeSV": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.5,
        "5Mo": 0.2,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 5.2,
        "5Mo": 1.2,
        "3Mo": 0.6,
        "1Mo": 0.6
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.3,
        "5Mo": 1.9,
        "3Mo": 1.4,
        "1Mo": 1.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 5.2,
        "3Mo": 4.2,
        "1Mo": 3.2
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.5,
        "5Mo": 3.7,
        "3Mo": 2.1,
        "1Mo": 1.6
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.7,
        "5Mo": 1.9,
        "3Mo": 1.4,
        "1Mo": 1.2
      },
      "thanksgiving": {
        "11Mo": 6.9,
        "7Mo": 3.3,
        "5Mo": 1.6,
        "3Mo": 0.6,
        "1Mo": 0.3
      },
      "christmas": {
        "11Mo": 6.9,
        "7Mo": 2.5,
        "5Mo": 1.6,
        "3Mo": 0.3,
        "1Mo": 0.1
      }
    },
    "threeR": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 3.1,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 6.4,
        "7Mo": 5.1,
        "5Mo": 1.4,
        "3Mo": 0.8,
        "1Mo": 0.3
      },
      "presidents": {
        "11Mo": 6.0,
        "7Mo": 5.3,
        "5Mo": 2.7,
        "3Mo": 1.2,
        "1Mo": 1.0
      },
      "easter": {
        "11Mo": 6.5,
        "7Mo": 6.4,
        "5Mo": 5.4,
        "3Mo": 4.4,
        "1Mo": 3.2
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 5.9,
        "5Mo": 3.7,
        "3Mo": 2.3,
        "1Mo": 1.2
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 2.0,
        "3Mo": 1.3,
        "1Mo": 0.9
      },
      "thanksgiving": {
        "11Mo": 6.2,
        "7Mo": 2.7,
        "5Mo": 1.4,
        "3Mo": 0.4,
        "1Mo": 0.7
      },
      "christmas": {
        "11Mo": 6.2,
        "7Mo": 1.9,
        "5Mo": 1.4,
        "3Mo": 0.1,
        "1Mo": 0.1
      }
    }
  },
  "aulani": {
    "hotelRoom": {
      "newYears": {
        "11Mo": 6.6,
        "7Mo": 0.6,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 6.8,
        "7Mo": 1.4,
        "5Mo": 0.4,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 5.4,
        "7Mo": 1.2,
        "5Mo": 0.2,
        "3Mo": 0.3,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 6.4,
        "7Mo": 0.8,
        "5Mo": 0.2,
        "3Mo": 0.1,
        "1Mo": 0.2
      },
      "thanksgiving": {
        "11Mo": 6.4,
        "7Mo": 0.8,
        "5Mo": 0.4,
        "3Mo": 0.8,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 5.5,
        "7Mo": 0.4,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.1
      }
    },
    "dsS": {
      "newYears": {
        "11Mo": 6.8,
        "7Mo": 1.3,
        "5Mo": 0.4,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 2.1,
        "5Mo": 0.4,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 3.2,
        "5Mo": 1.0,
        "3Mo": 0.6,
        "1Mo": 0.1
      },
      "summer": {
        "11Mo": 6.9,
        "7Mo": 1.7,
        "5Mo": 0.2,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 2.3,
        "5Mo": 0.3,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 5.8,
        "7Mo": 0.3,
        "5Mo": 0.7,
        "3Mo": 0.3,
        "1Mo": 0.0
      }
    },
    "dsI": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 3.0,
        "5Mo": 0.8,
        "3Mo": 0.4,
        "1Mo": 0.6
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 4.9,
        "5Mo": 1.4,
        "3Mo": 0.5,
        "1Mo": 0.2
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.1,
        "3Mo": 0.7,
        "1Mo": 1.2
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 5.1,
        "5Mo": 0.8,
        "3Mo": 0.3,
        "1Mo": 0.3
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 2.8,
        "5Mo": 1.2,
        "3Mo": 0.8,
        "1Mo": 2.3
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 1.7,
        "5Mo": 1.1,
        "3Mo": 1.2,
        "1Mo": 0.8
      }
    },
    "dsP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.7,
        "5Mo": 0.1,
        "3Mo": 0.1,
        "1Mo": 0.4
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 1.7,
        "3Mo": 0.4,
        "1Mo": 0.4
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 2.5,
        "3Mo": 1.0,
        "1Mo": 1.2
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 5.2,
        "5Mo": 0.7,
        "3Mo": 0.2,
        "1Mo": 0.2
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 3.1,
        "5Mo": 2.5,
        "3Mo": 2.1,
        "1Mo": 0.4
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 1.2,
        "5Mo": 1.0,
        "3Mo": 0.8,
        "1Mo": 0.3
      }
    },
    "dsO": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 3.2,
        "5Mo": 0.4,
        "3Mo": 0.3,
        "1Mo": 1.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 2.1,
        "3Mo": 0.8,
        "1Mo": 1.2
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.9,
        "3Mo": 2.0,
        "1Mo": 1.1
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.3,
        "5Mo": 0.9,
        "3Mo": 0.4,
        "1Mo": 0.4
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 4.1,
        "5Mo": 3.6,
        "3Mo": 2.5,
        "1Mo": 0.7
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 1.7,
        "5Mo": 1.1,
        "3Mo": 1.0,
        "1Mo": 0.8
      }
    },
    "oneS": {
      "newYears": {
        "11Mo": 6.1,
        "7Mo": 1.0,
        "5Mo": 0.3,
        "3Mo": 0.6,
        "1Mo": 1.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.2,
        "5Mo": 1.9,
        "3Mo": 0.6,
        "1Mo": 0.4
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 1.9,
        "3Mo": 1.4,
        "1Mo": 0.9
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 2.7,
        "5Mo": 0.8,
        "3Mo": 0.3,
        "1Mo": 0.2
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 2.9,
        "5Mo": 2.0,
        "3Mo": 2.0,
        "1Mo": 1.2
      },
      "christmas": {
        "11Mo": 6.4,
        "7Mo": 0.8,
        "5Mo": 1.0,
        "3Mo": 0.3,
        "1Mo": 0.4
      }
    },
    "oneI": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.7,
        "5Mo": 0.8,
        "3Mo": 1.2,
        "1Mo": 0.7
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.2,
        "5Mo": 3.0,
        "3Mo": 0.8,
        "1Mo": 1.3
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.0,
        "3Mo": 4.7,
        "1Mo": 3.4
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.5,
        "5Mo": 1.2,
        "3Mo": 0.8,
        "1Mo": 0.6
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 4.7,
        "5Mo": 3.3,
        "3Mo": 2.7,
        "1Mo": 1.6
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 2.6,
        "5Mo": 1.1,
        "3Mo": 1.1,
        "1Mo": 0.8
      }
    },
    "oneP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.8,
        "5Mo": 0.7,
        "3Mo": 0.3,
        "1Mo": 1.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 3.2,
        "3Mo": 0.9,
        "1Mo": 1.3
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 6.3,
        "3Mo": 4.0,
        "1Mo": 2.9
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.2,
        "5Mo": 1.3,
        "3Mo": 0.6,
        "1Mo": 0.6
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 4.7,
        "5Mo": 2.8,
        "3Mo": 3.0,
        "1Mo": 2.3
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 2.5,
        "5Mo": 1.0,
        "3Mo": 0.8,
        "1Mo": 0.8
      }
    },
    "oneO": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 3.2,
        "5Mo": 1.2,
        "3Mo": 1.2,
        "1Mo": 2.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.6,
        "3Mo": 2.0,
        "1Mo": 1.7
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 5.4,
        "1Mo": 3.9
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.2,
        "3Mo": 0.8,
        "1Mo": 0.6
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 6.4,
        "5Mo": 4.1,
        "3Mo": 2.8,
        "1Mo": 3.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 4.1,
        "5Mo": 1.1,
        "3Mo": 1.7,
        "1Mo": 1.0
      }
    },
    "twoS": {
      "newYears": {
        "11Mo": 6.2,
        "7Mo": 0.8,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.2
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 2.5,
        "5Mo": 0.8,
        "3Mo": 0.3,
        "1Mo": 0.2
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 3.2,
        "5Mo": 1.1,
        "3Mo": 0.5,
        "1Mo": 0.3
      },
      "summer": {
        "11Mo": 6.8,
        "7Mo": 1.4,
        "5Mo": 0.4,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "thanksgiving": {
        "11Mo": 6.8,
        "7Mo": 1.7,
        "5Mo": 1.0,
        "3Mo": 0.6,
        "1Mo": 0.3
      },
      "christmas": {
        "11Mo": 5.7,
        "7Mo": 0.3,
        "5Mo": 0.8,
        "3Mo": 0.1,
        "1Mo": 0.1
      }
    },
    "twoI": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.6,
        "5Mo": 0.5,
        "3Mo": 0.6,
        "1Mo": 0.9
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.4,
        "5Mo": 2.1,
        "3Mo": 0.6,
        "1Mo": 0.9
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 4.0,
        "3Mo": 2.8,
        "1Mo": 2.5
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 5.2,
        "5Mo": 0.9,
        "3Mo": 0.2,
        "1Mo": 0.3
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 2.9,
        "5Mo": 2.1,
        "3Mo": 1.5,
        "1Mo": 1.9
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 1.7,
        "5Mo": 1.1,
        "3Mo": 0.8,
        "1Mo": 0.7
      }
    },
    "twoP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.7,
        "5Mo": 0.5,
        "3Mo": 0.2,
        "1Mo": 0.6
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.0,
        "5Mo": 2.3,
        "3Mo": 0.7,
        "1Mo": 0.8
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 3.6,
        "3Mo": 2.9,
        "1Mo": 2.0
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 5.3,
        "5Mo": 0.9,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 3.2,
        "5Mo": 2.6,
        "3Mo": 2.2,
        "1Mo": 1.2
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 1.3,
        "5Mo": 1.1,
        "3Mo": 0.6,
        "1Mo": 0.2
      }
    },
    "twoO": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 3.2,
        "5Mo": 0.6,
        "3Mo": 0.7,
        "1Mo": 1.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 2.9,
        "3Mo": 1.1,
        "1Mo": 1.4
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.3,
        "3Mo": 4.2,
        "1Mo": 2.9
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.4,
        "5Mo": 1.0,
        "3Mo": 0.3,
        "1Mo": 0.4
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 4.6,
        "5Mo": 2.9,
        "3Mo": 2.5,
        "1Mo": 1.9
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 1.8,
        "5Mo": 1.1,
        "3Mo": 1.0,
        "1Mo": 0.4
      }
    },
    "threeS": {
      "newYears": {
        "11Mo": 0.1,
        "7Mo": 0.6,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 1.4,
        "7Mo": 1.8,
        "5Mo": 0.6,
        "3Mo": 0.1,
        "1Mo": 0.3
      },
      "easter": {
        "11Mo": 1.2,
        "7Mo": 0.1,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 0.7,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "thanksgiving": {
        "11Mo": 0.8,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "threeO": {
      "newYears": {
        "11Mo": 6.8,
        "7Mo": 3.2,
        "5Mo": 1.0,
        "3Mo": 0.7,
        "1Mo": 1.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.5,
        "5Mo": 3.1,
        "3Mo": 1.6,
        "1Mo": 2.2
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.9,
        "3Mo": 6.2,
        "1Mo": 4.1
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 2.4,
        "3Mo": 1.0,
        "1Mo": 0.7
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 3.0,
        "5Mo": 2.8,
        "3Mo": 2.7,
        "1Mo": 2.6
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 2.0,
        "5Mo": 1.1,
        "3Mo": 1.4,
        "1Mo": 0.4
      }
    }
  },
  "bayLakeTower": {
    "dsR": {
      "newYears": {
        "11Mo": 6.9,
        "7Mo": 1.2,
        "5Mo": 0.0,
        "3Mo": 0.1,
        "1Mo": 0.3
      },
      "marathon": {
        "11Mo": 6.8,
        "7Mo": 1.4,
        "5Mo": 0.3,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 6.8,
        "7Mo": 1.8,
        "5Mo": 0.5,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "easter": {
        "11Mo": 6.9,
        "7Mo": 3.6,
        "5Mo": 0.8,
        "3Mo": 0.7,
        "1Mo": 0.6
      },
      "summer": {
        "11Mo": 6.8,
        "7Mo": 3.2,
        "5Mo": 1.4,
        "3Mo": 0.6,
        "1Mo": 0.6
      },
      "foodAndWine": {
        "11Mo": 6.7,
        "7Mo": 2.0,
        "5Mo": 0.4,
        "3Mo": 0.1,
        "1Mo": 0.2
      },
      "thanksgiving": {
        "11Mo": 6.5,
        "7Mo": 1.4,
        "5Mo": 0.8,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 6.6,
        "7Mo": 0.7,
        "5Mo": 0.8,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "dsP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.1,
        "5Mo": 0.1,
        "3Mo": 0.3,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 1.7,
        "3Mo": 0.6,
        "1Mo": 0.5
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.5,
        "5Mo": 1.2,
        "3Mo": 0.4,
        "1Mo": 0.4
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.9,
        "3Mo": 1.7,
        "1Mo": 1.2
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 4.6,
        "3Mo": 1.9,
        "1Mo": 1.1
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.2,
        "5Mo": 1.3,
        "3Mo": 0.6,
        "1Mo": 0.7
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.9,
        "5Mo": 1.7,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 2.3,
        "5Mo": 1.7,
        "3Mo": 0.4,
        "1Mo": 0.4
      }
    },
    "dsTP": {
      "newYears": {
        "11Mo": 5.8,
        "7Mo": 2.1,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 3.0,
        "5Mo": 0.7,
        "3Mo": 0.1,
        "1Mo": 0.4
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 4.3,
        "5Mo": 0.4,
        "3Mo": 0.1,
        "1Mo": 0.2
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 1.9,
        "3Mo": 0.8,
        "1Mo": 0.5
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 2.5,
        "3Mo": 0.8,
        "1Mo": 0.5
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 3.6,
        "5Mo": 0.5,
        "3Mo": 0.1,
        "1Mo": 0.2
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 0.7,
        "5Mo": 1.1,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 6.4,
        "7Mo": 1.6,
        "5Mo": 1.1,
        "3Mo": 0.3,
        "1Mo": 0.0
      }
    },
    "oneR": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 1.4,
        "5Mo": 0.1,
        "3Mo": 0.3,
        "1Mo": 0.3
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 3.1,
        "5Mo": 1.0,
        "3Mo": 0.3,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 6.9,
        "7Mo": 3.0,
        "5Mo": 1.0,
        "3Mo": 0.1,
        "1Mo": 0.3
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 3.6,
        "5Mo": 1.9,
        "3Mo": 1.6,
        "1Mo": 1.0
      },
      "summer": {
        "11Mo": 6.8,
        "7Mo": 3.8,
        "5Mo": 2.1,
        "3Mo": 1.3,
        "1Mo": 0.8
      },
      "foodAndWine": {
        "11Mo": 6.9,
        "7Mo": 3.2,
        "5Mo": 0.9,
        "3Mo": 0.5,
        "1Mo": 0.5
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.1,
        "5Mo": 1.1,
        "3Mo": 0.3,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 6.9,
        "7Mo": 1.4,
        "5Mo": 1.1,
        "3Mo": 0.0,
        "1Mo": 0.3
      }
    },
    "oneP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.6,
        "5Mo": 0.1,
        "3Mo": 0.1,
        "1Mo": 0.3
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.0,
        "5Mo": 2.5,
        "3Mo": 0.8,
        "1Mo": 0.9
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.2,
        "3Mo": 1.0,
        "1Mo": 1.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.9,
        "3Mo": 3.6,
        "1Mo": 2.1
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.8,
        "3Mo": 3.4,
        "1Mo": 1.7
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 6.4,
        "5Mo": 2.5,
        "3Mo": 1.2,
        "1Mo": 1.1
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 3.1,
        "5Mo": 1.7,
        "3Mo": 0.4,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 4.6,
        "5Mo": 1.7,
        "3Mo": 0.8,
        "1Mo": 0.6
      }
    },
    "oneTP": {
      "newYears": {
        "11Mo": 6.6,
        "7Mo": 1.6,
        "5Mo": 0.1,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 4.7,
        "5Mo": 1.4,
        "3Mo": 0.4,
        "1Mo": 0.7
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.3,
        "5Mo": 1.0,
        "3Mo": 0.6,
        "1Mo": 0.4
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.9,
        "3Mo": 1.2,
        "1Mo": 0.7
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 4.6,
        "3Mo": 2.0,
        "1Mo": 0.8
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.2,
        "5Mo": 1.2,
        "3Mo": 0.5,
        "1Mo": 0.6
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 2.1,
        "5Mo": 1.6,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 6.9,
        "7Mo": 1.9,
        "5Mo": 1.6,
        "3Mo": 0.3,
        "1Mo": 0.3
      }
    },
    "twoR": {
      "newYears": {
        "11Mo": 6.8,
        "7Mo": 0.7,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 6.8,
        "7Mo": 1.2,
        "5Mo": 0.4,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 6.8,
        "7Mo": 1.6,
        "5Mo": 0.3,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "easter": {
        "11Mo": 6.8,
        "7Mo": 2.1,
        "5Mo": 1.2,
        "3Mo": 0.5,
        "1Mo": 0.2
      },
      "summer": {
        "11Mo": 6.7,
        "7Mo": 2.4,
        "5Mo": 1.1,
        "3Mo": 0.6,
        "1Mo": 0.3
      },
      "foodAndWine": {
        "11Mo": 6.5,
        "7Mo": 2.0,
        "5Mo": 0.5,
        "3Mo": 0.2,
        "1Mo": 0.2
      },
      "thanksgiving": {
        "11Mo": 6.5,
        "7Mo": 0.2,
        "5Mo": 0.2,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 6.2,
        "7Mo": 0.6,
        "5Mo": 0.2,
        "3Mo": 0.1,
        "1Mo": 0.0
      }
    },
    "twoP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 1.8,
        "5Mo": 0.1,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 5.6,
        "5Mo": 1.6,
        "3Mo": 0.6,
        "1Mo": 0.5
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 1.2,
        "3Mo": 0.5,
        "1Mo": 0.7
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 4.0,
        "3Mo": 1.9,
        "1Mo": 1.5
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 4.3,
        "3Mo": 1.8,
        "1Mo": 1.0
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.5,
        "5Mo": 1.5,
        "3Mo": 0.8,
        "1Mo": 0.8
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.8,
        "5Mo": 1.5,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 2.6,
        "5Mo": 1.5,
        "3Mo": 0.5,
        "1Mo": 0.2
      }
    },
    "twoTP": {
      "newYears": {
        "11Mo": 6.3,
        "7Mo": 1.5,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 4.2,
        "5Mo": 0.9,
        "3Mo": 0.3,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.4,
        "5Mo": 0.6,
        "3Mo": 0.4,
        "1Mo": 0.3
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 3.2,
        "3Mo": 1.3,
        "1Mo": 0.8
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 3.0,
        "3Mo": 1.1,
        "1Mo": 0.6
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 4.4,
        "5Mo": 0.9,
        "3Mo": 0.4,
        "1Mo": 0.4
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 0.9,
        "5Mo": 1.2,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 6.6,
        "7Mo": 1.8,
        "5Mo": 1.2,
        "3Mo": 0.1,
        "1Mo": 0.1
      }
    },
    "threeP": {
      "newYears": {
        "11Mo": 6.8,
        "7Mo": 1.0,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 4.6,
        "5Mo": 1.6,
        "3Mo": 0.7,
        "1Mo": 0.3
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.2,
        "5Mo": 2.2,
        "3Mo": 1.2,
        "1Mo": 1.1
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 3.6,
        "3Mo": 2.4,
        "1Mo": 2.0
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.1,
        "5Mo": 3.0,
        "3Mo": 1.7,
        "1Mo": 1.1
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 4.9,
        "5Mo": 1.6,
        "3Mo": 0.8,
        "1Mo": 0.8
      },
      "thanksgiving": {
        "11Mo": 6.9,
        "7Mo": 1.6,
        "5Mo": 1.7,
        "3Mo": 0.1,
        "1Mo": 0.3
      },
      "christmas": {
        "11Mo": 6.4,
        "7Mo": 1.6,
        "5Mo": 1.7,
        "3Mo": 0.3,
        "1Mo": 0.0
      }
    },
    "threeTP": {
      "newYears": {
        "11Mo": 6.3,
        "7Mo": 1.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 6.8,
        "7Mo": 3.8,
        "5Mo": 1.2,
        "3Mo": 0.4,
        "1Mo": 0.2
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.6,
        "5Mo": 2.0,
        "3Mo": 1.0,
        "1Mo": 1.2
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 4.9,
        "3Mo": 3.1,
        "1Mo": 1.4
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.3,
        "5Mo": 2.8,
        "3Mo": 1.9,
        "1Mo": 1.1
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.5,
        "5Mo": 1.9,
        "3Mo": 0.9,
        "1Mo": 0.8
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.9,
        "5Mo": 1.4,
        "3Mo": 0.3,
        "1Mo": 0.3
      },
      "christmas": {
        "11Mo": 6.5,
        "7Mo": 1.6,
        "5Mo": 1.4,
        "3Mo": 0.1,
        "1Mo": 0.0
      }
    }
  },
  "beachClubVillas": {
    "deluxeStudio": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 1.1,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.3
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 2.8,
        "5Mo": 0.3,
        "3Mo": 0.3,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 1.6,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 3.6,
        "5Mo": 0.3,
        "3Mo": 0.4,
        "1Mo": 0.2
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 4.9,
        "5Mo": 0.3,
        "3Mo": 0.0,
        "1Mo": 0.2
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 1.9,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 0.6,
        "5Mo": 1.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 3.1,
        "5Mo": 1.1,
        "3Mo": 0.3,
        "1Mo": 0.0
      }
    },
    "oneBedroom": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.6,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.1,
        "5Mo": 1.3,
        "3Mo": 0.6,
        "1Mo": 0.3
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.4,
        "5Mo": 1.0,
        "3Mo": 0.8,
        "1Mo": 0.5
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 2.2,
        "3Mo": 1.6,
        "1Mo": 1.2
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.2,
        "3Mo": 1.1,
        "1Mo": 0.8
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.1,
        "5Mo": 0.6,
        "3Mo": 0.5,
        "1Mo": 0.7
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 2.1,
        "5Mo": 2.1,
        "3Mo": 0.3,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 6.3,
        "5Mo": 2.1,
        "3Mo": 0.4,
        "1Mo": 1.0
      }
    },
    "twoBedroom": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 1.4,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 3.8,
        "5Mo": 0.8,
        "3Mo": 0.3,
        "1Mo": 0.3
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 3.2,
        "5Mo": 0.3,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 5.0,
        "5Mo": 0.7,
        "3Mo": 0.7,
        "1Mo": 0.7
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 0.6,
        "3Mo": 0.2,
        "1Mo": 0.3
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 3.0,
        "5Mo": 0.3,
        "3Mo": 0.1,
        "1Mo": 0.3
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 0.8,
        "5Mo": 1.3,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 3.2,
        "5Mo": 1.3,
        "3Mo": 0.3,
        "1Mo": 0.2
      }
    }
  },
  "boardwalkVillas": {
    "dsR": {
      "newYears": {
        "11Mo": 6.7,
        "7Mo": 0.7,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 6.7,
        "7Mo": 0.6,
        "5Mo": 0.2,
        "3Mo": 0.0,
        "1Mo": 0.2
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 1.4,
        "5Mo": 0.2,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 6.8,
        "7Mo": 2.0,
        "5Mo": 0.4,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 6.7,
        "7Mo": 2.3,
        "5Mo": 0.2,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "foodAndWine": {
        "11Mo": 6.4,
        "7Mo": 0.8,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "thanksgiving": {
        "11Mo": 6.4,
        "7Mo": 0.6,
        "5Mo": 0.3,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 1.2,
        "5Mo": 0.3,
        "3Mo": 0.0,
        "1Mo": 0.1
      }
    },
    "dsBP": {
      "newYears": {
        "11Mo": 6.8,
        "7Mo": 1.4,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.3
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 2.5,
        "5Mo": 0.5,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 2.5,
        "5Mo": 0.3,
        "3Mo": 0.1,
        "1Mo": 0.2
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 3.8,
        "5Mo": 0.9,
        "3Mo": 0.3,
        "1Mo": 0.7
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 4.9,
        "5Mo": 0.9,
        "3Mo": 0.3,
        "1Mo": 0.4
      },
      "foodAndWine": {
        "11Mo": 6.8,
        "7Mo": 2.0,
        "5Mo": 0.2,
        "3Mo": 0.1,
        "1Mo": 0.3
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 0.4,
        "5Mo": 0.8,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 2.4,
        "5Mo": 0.8,
        "3Mo": 0.1,
        "1Mo": 0.1
      }
    },
    "oneR": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.5,
        "5Mo": 0.2,
        "3Mo": 0.2,
        "1Mo": 0.3
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 4.6,
        "5Mo": 1.6,
        "3Mo": 0.5,
        "1Mo": 0.3
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 4.4,
        "5Mo": 0.8,
        "3Mo": 0.5,
        "1Mo": 0.6
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 2.6,
        "3Mo": 1.7,
        "1Mo": 1.1
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.5,
        "3Mo": 1.4,
        "1Mo": 1.0
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 3.6,
        "5Mo": 0.6,
        "3Mo": 0.5,
        "1Mo": 0.7
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 0.7,
        "5Mo": 1.9,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 6.0,
        "5Mo": 1.9,
        "3Mo": 0.4,
        "1Mo": 0.4
      }
    },
    "oneBP": {
      "newYears": {
        "11Mo": 6.9,
        "7Mo": 2.6,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.2
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 4.2,
        "5Mo": 1.1,
        "3Mo": 0.8,
        "1Mo": 0.5
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.0,
        "5Mo": 1.4,
        "3Mo": 0.6,
        "1Mo": 0.6
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.4,
        "5Mo": 2.5,
        "3Mo": 2.0,
        "1Mo": 1.3
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.5,
        "3Mo": 2.2,
        "1Mo": 1.4
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 3.8,
        "5Mo": 0.9,
        "3Mo": 0.5,
        "1Mo": 0.7
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.1,
        "5Mo": 1.9,
        "3Mo": 0.1,
        "1Mo": 0.3
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 3.7,
        "5Mo": 1.9,
        "3Mo": 0.4,
        "1Mo": 0.1
      }
    },
    "twoR": {
      "newYears": {
        "11Mo": 6.7,
        "7Mo": 0.6,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 6.7,
        "7Mo": 0.6,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 1.0,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 6.8,
        "7Mo": 2.0,
        "5Mo": 0.3,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 6.7,
        "7Mo": 2.3,
        "5Mo": 0.2,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 6.4,
        "7Mo": 0.7,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "thanksgiving": {
        "11Mo": 6.4,
        "7Mo": 0.0,
        "5Mo": 0.3,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 1.2,
        "5Mo": 0.3,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "twoBP": {
      "newYears": {
        "11Mo": 6.8,
        "7Mo": 1.2,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 2.2,
        "5Mo": 0.4,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 2.5,
        "5Mo": 0.2,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 3.8,
        "5Mo": 0.8,
        "3Mo": 0.2,
        "1Mo": 0.5
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 4.9,
        "5Mo": 0.9,
        "3Mo": 0.3,
        "1Mo": 0.3
      },
      "foodAndWine": {
        "11Mo": 6.8,
        "7Mo": 1.8,
        "5Mo": 0.2,
        "3Mo": 0.1,
        "1Mo": 0.2
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 0.3,
        "5Mo": 0.8,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 2.1,
        "5Mo": 0.8,
        "3Mo": 0.1,
        "1Mo": 0.1
      }
    },
    "threeBP": {
      "newYears": {
        "11Mo": 6.0,
        "7Mo": 1.2,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.3
      },
      "marathon": {
        "11Mo": 6.6,
        "7Mo": 2.2,
        "5Mo": 1.0,
        "3Mo": 0.4,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 3.2,
        "5Mo": 0.8,
        "3Mo": 0.7,
        "1Mo": 0.4
      },
      "easter": {
        "11Mo": 6.8,
        "7Mo": 5.5,
        "5Mo": 1.3,
        "3Mo": 1.0,
        "1Mo": 1.2
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 5.1,
        "5Mo": 1.4,
        "3Mo": 0.9,
        "1Mo": 0.7
      },
      "foodAndWine": {
        "11Mo": 6.8,
        "7Mo": 3.0,
        "5Mo": 0.7,
        "3Mo": 0.4,
        "1Mo": 0.6
      },
      "thanksgiving": {
        "11Mo": 6.6,
        "7Mo": 0.7,
        "5Mo": 1.1,
        "3Mo": 0.0,
        "1Mo": 0.3
      },
      "christmas": {
        "11Mo": 5.8,
        "7Mo": 1.4,
        "5Mo": 1.1,
        "3Mo": 0.0,
        "1Mo": 0.1
      }
    }
  },
  "boulderRidge": {
    "deluxeStudio": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 1.4,
        "5Mo": 0.0,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 2.8,
        "5Mo": 0.9,
        "3Mo": 0.6,
        "1Mo": 0.6
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 3.2,
        "5Mo": 0.4,
        "3Mo": 0.3,
        "1Mo": 0.4
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.4,
        "5Mo": 2.0,
        "3Mo": 1.0,
        "1Mo": 0.7
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.6,
        "5Mo": 2.1,
        "3Mo": 1.0,
        "1Mo": 0.6
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 3.2,
        "5Mo": 0.7,
        "3Mo": 0.4,
        "1Mo": 0.5
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 0.8,
        "5Mo": 0.6,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 1.9,
        "5Mo": 0.6,
        "3Mo": 0.1,
        "1Mo": 0.7
      }
    },
    "oneBedroom": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 4.9,
        "5Mo": 0.4,
        "3Mo": 0.0,
        "1Mo": 0.3
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 3.3,
        "3Mo": 1.4,
        "1Mo": 0.6
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 4.3,
        "3Mo": 1.9,
        "1Mo": 1.6
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.0,
        "3Mo": 5.7,
        "1Mo": 3.3
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 6.3,
        "1Mo": 3.7
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 3.5,
        "3Mo": 2.1,
        "1Mo": 1.7
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 2.0,
        "5Mo": 2.0,
        "3Mo": 0.3,
        "1Mo": 0.4
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 2.0,
        "3Mo": 1.2,
        "1Mo": 0.1
      }
    },
    "twoBedroom": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 1.5,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 4.2,
        "5Mo": 1.6,
        "3Mo": 0.8,
        "1Mo": 0.4
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 4.5,
        "5Mo": 1.2,
        "3Mo": 0.6,
        "1Mo": 0.7
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 3.4,
        "3Mo": 2.4,
        "1Mo": 1.6
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 3.6,
        "3Mo": 1.8,
        "1Mo": 1.2
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 4.3,
        "5Mo": 1.6,
        "3Mo": 1.0,
        "1Mo": 0.8
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.0,
        "5Mo": 1.0,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 2.5,
        "5Mo": 1.0,
        "3Mo": 0.1,
        "1Mo": 0.1
      }
    }
  },
  "fortWildernessCabins": {
    "cabin": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 0.0,
        "3Mo": 0.5,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.0,
        "3Mo": 1.0,
        "1Mo": 1.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 1.9,
        "3Mo": 1.3,
        "1Mo": 0.3
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    }
  },
  "copperCreek": {
    "deluxeStudio": {
      "newYears": {
        "11Mo": 6.8,
        "7Mo": 0.9,
        "5Mo": 0.0,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 2.0,
        "5Mo": 0.9,
        "3Mo": 0.3,
        "1Mo": 0.3
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 2.4,
        "5Mo": 0.3,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 3.6,
        "5Mo": 1.6,
        "3Mo": 0.7,
        "1Mo": 0.6
      },
      "summer": {
        "11Mo": 6.9,
        "7Mo": 4.8,
        "5Mo": 2.0,
        "3Mo": 0.9,
        "1Mo": 0.6
      },
      "foodAndWine": {
        "11Mo": 6.9,
        "7Mo": 2.0,
        "5Mo": 0.6,
        "3Mo": 0.4,
        "1Mo": 0.4
      },
      "thanksgiving": {
        "11Mo": 6.8,
        "7Mo": 0.3,
        "5Mo": 0.6,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 6.9,
        "7Mo": 1.2,
        "5Mo": 0.6,
        "3Mo": 0.2,
        "1Mo": 0.2
      }
    },
    "oneBedroom": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.2,
        "5Mo": 0.6,
        "3Mo": 0.6,
        "1Mo": 0.3
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 4.9,
        "5Mo": 2.5,
        "3Mo": 1.2,
        "1Mo": 0.7
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 2.3,
        "3Mo": 1.1,
        "1Mo": 1.4
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 5.5,
        "3Mo": 4.0,
        "1Mo": 2.6
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.4,
        "3Mo": 4.3,
        "1Mo": 2.5
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.2,
        "5Mo": 2.2,
        "3Mo": 1.1,
        "1Mo": 1.0
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 0.8,
        "5Mo": 1.9,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 1.7,
        "5Mo": 1.9,
        "3Mo": 0.8,
        "1Mo": 0.8
      }
    },
    "twoBedroom": {
      "newYears": {
        "11Mo": 6.9,
        "7Mo": 0.8,
        "5Mo": 0.1,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 3.5,
        "5Mo": 1.2,
        "3Mo": 0.4,
        "1Mo": 0.3
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 3.9,
        "5Mo": 0.9,
        "3Mo": 0.4,
        "1Mo": 0.5
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 5.3,
        "5Mo": 2.8,
        "3Mo": 1.6,
        "1Mo": 1.6
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 5.6,
        "5Mo": 2.6,
        "3Mo": 1.4,
        "1Mo": 0.9
      },
      "foodAndWine": {
        "11Mo": 6.9,
        "7Mo": 3.2,
        "5Mo": 1.2,
        "3Mo": 0.7,
        "1Mo": 0.7
      },
      "thanksgiving": {
        "11Mo": 6.9,
        "7Mo": 0.4,
        "5Mo": 0.8,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 1.1,
        "5Mo": 0.8,
        "3Mo": 0.2,
        "1Mo": 0.2
      }
    },
    "twoBedCabin": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 5.3,
        "5Mo": 0.4,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 3.0,
        "3Mo": 1.2,
        "1Mo": 1.4
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.0,
        "3Mo": 3.1,
        "1Mo": 1.6
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.8,
        "3Mo": 6.3,
        "1Mo": 5.8
      },
      "summer": {
        "11Mo": 6.9,
        "7Mo": 6.8,
        "5Mo": 6.7,
        "3Mo": 5.3,
        "1Mo": 3.1
      },
      "foodAndWine": {
        "11Mo": 6.9,
        "7Mo": 6.8,
        "5Mo": 3.8,
        "3Mo": 2.3,
        "1Mo": 1.5
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 3.8,
        "5Mo": 3.1,
        "3Mo": 0.7,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 5.4,
        "5Mo": 3.1,
        "3Mo": 1.2,
        "1Mo": 1.0
      }
    },
    "threeBedroom": {
      "newYears": {
        "11Mo": 6.9,
        "7Mo": 3.1,
        "5Mo": 0.0,
        "3Mo": 0.3,
        "1Mo": 0.3
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 1.4,
        "3Mo": 0.6,
        "1Mo": 0.6
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.0,
        "5Mo": 1.6,
        "3Mo": 1.2,
        "1Mo": 0.6
      },
      "easter": {
        "11Mo": 6.5,
        "7Mo": 6.1,
        "5Mo": 5.1,
        "3Mo": 3.1,
        "1Mo": 3.1
      },
      "summer": {
        "11Mo": 6.0,
        "7Mo": 5.8,
        "5Mo": 3.3,
        "3Mo": 2.1,
        "1Mo": 1.4
      },
      "foodAndWine": {
        "11Mo": 6.6,
        "7Mo": 5.2,
        "5Mo": 1.9,
        "3Mo": 1.1,
        "1Mo": 0.8
      },
      "thanksgiving": {
        "11Mo": 6.6,
        "7Mo": 2.0,
        "5Mo": 1.2,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 6.6,
        "7Mo": 1.6,
        "5Mo": 1.2,
        "3Mo": 0.4,
        "1Mo": 0.0
      }
    }
  },
  "grandCalifornian": {
    "deluxeStudio": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 3.7,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 1.6,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 4.3,
        "5Mo": 0.0,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 4.5,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 0.8,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 2.5,
        "5Mo": 1.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "oneBedroom": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 5.2,
        "5Mo": 0.3,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.5,
        "5Mo": 0.4,
        "3Mo": 0.1,
        "1Mo": 0.3
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.3,
        "5Mo": 0.4,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 3.6,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 6.3,
        "5Mo": 1.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "twoBedroom": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 4.6,
        "5Mo": 0.2,
        "3Mo": 0.1,
        "1Mo": 0.3
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 3.7,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 5.5,
        "5Mo": 0.7,
        "3Mo": 0.2,
        "1Mo": 0.2
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 5.3,
        "5Mo": 0.3,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 2.4,
        "5Mo": 0.0,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 4.5,
        "5Mo": 1.0,
        "3Mo": 0.2,
        "1Mo": 0.0
      }
    },
    "threeBedroom": {
      "newYears": {
        "11Mo": 6.6,
        "7Mo": 3.1,
        "5Mo": 0.3,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 5.6,
        "7Mo": 1.9,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 4.0,
        "5Mo": 0.7,
        "3Mo": 0.5,
        "1Mo": 0.4
      },
      "summer": {
        "11Mo": 6.7,
        "7Mo": 3.6,
        "5Mo": 0.2,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "thanksgiving": {
        "11Mo": 6.0,
        "7Mo": 0.8,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 6.5,
        "7Mo": 3.4,
        "5Mo": 0.4,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    }
  },
  "grandFloridian": {
    "dsR": {
      "newYears": {
        "11Mo": 6.6,
        "7Mo": 0.8,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 2.6,
        "5Mo": 0.3,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 2.2,
        "5Mo": 0.2,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 4.0,
        "5Mo": 1.9,
        "3Mo": 1.1,
        "1Mo": 0.3
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 4.7,
        "5Mo": 1.0,
        "3Mo": 0.5,
        "1Mo": 0.4
      },
      "foodAndWine": {
        "11Mo": 6.9,
        "7Mo": 2.8,
        "5Mo": 0.4,
        "3Mo": 0.2,
        "1Mo": 0.2
      },
      "thanksgiving": {
        "11Mo": 6.9,
        "7Mo": 0.1,
        "5Mo": 0.8,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 6.2,
        "7Mo": 1.6,
        "5Mo": 0.8,
        "3Mo": 0.3,
        "1Mo": 0.6
      }
    },
    "dsP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 1.0,
        "5Mo": 0.0,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 4.1,
        "5Mo": 0.8,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 3.0,
        "5Mo": 0.3,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 5.3,
        "5Mo": 1.6,
        "3Mo": 0.5,
        "1Mo": 0.3
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 1.6,
        "3Mo": 0.6,
        "1Mo": 0.3
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 3.3,
        "5Mo": 0.5,
        "3Mo": 0.2,
        "1Mo": 0.2
      },
      "thanksgiving": {
        "11Mo": 6.6,
        "7Mo": 0.8,
        "5Mo": 1.1,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 6.0,
        "7Mo": 2.0,
        "5Mo": 1.1,
        "3Mo": 0.3,
        "1Mo": 0.1
      }
    },
    "rsR": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.0,
        "5Mo": 0.3,
        "3Mo": 0.3,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 4.7,
        "5Mo": 0.4,
        "3Mo": 0.5,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 3.5,
        "5Mo": 0.7,
        "3Mo": 0.4,
        "1Mo": 0.4
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.5,
        "5Mo": 3.8,
        "3Mo": 2.0,
        "1Mo": 0.6
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 5.9,
        "5Mo": 1.9,
        "3Mo": 0.9,
        "1Mo": 0.6
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 4.3,
        "5Mo": 0.9,
        "3Mo": 0.6,
        "1Mo": 0.4
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 3.0,
        "5Mo": 2.2,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 3.5,
        "5Mo": 2.2,
        "3Mo": 0.5,
        "1Mo": 1.0
      }
    },
    "rsP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 3.7,
        "5Mo": 0.0,
        "3Mo": 0.5,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.2,
        "5Mo": 1.6,
        "3Mo": 0.8,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 1.0,
        "3Mo": 0.6,
        "1Mo": 0.5
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.4,
        "3Mo": 2.6,
        "1Mo": 1.0
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.6,
        "3Mo": 1.4,
        "1Mo": 1.3
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 2.0,
        "3Mo": 1.0,
        "1Mo": 0.7
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 3.3,
        "5Mo": 3.2,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 3.2,
        "3Mo": 1.4,
        "1Mo": 1.4
      }
    },
    "rsTP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 3.5,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.0,
        "5Mo": 1.0,
        "3Mo": 0.4,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 1.1,
        "3Mo": 0.3,
        "1Mo": 0.4
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.3,
        "3Mo": 1.1,
        "1Mo": 0.8
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.6,
        "3Mo": 1.5,
        "1Mo": 1.0
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 1.9,
        "3Mo": 0.8,
        "1Mo": 0.3
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.3,
        "5Mo": 2.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 2.0,
        "3Mo": 0.7,
        "1Mo": 0.5
      }
    },
    "oneR": {
      "newYears": {
        "11Mo": 6.9,
        "7Mo": 2.4,
        "5Mo": 0.3,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 4.9,
        "5Mo": 1.7,
        "3Mo": 0.4,
        "1Mo": 0.3
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.4,
        "5Mo": 1.2,
        "3Mo": 0.8,
        "1Mo": 0.4
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 3.9,
        "3Mo": 2.0,
        "1Mo": 1.1
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 4.5,
        "3Mo": 2.0,
        "1Mo": 0.7
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.6,
        "5Mo": 1.3,
        "3Mo": 0.6,
        "1Mo": 0.4
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.2,
        "5Mo": 1.6,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 6.5,
        "7Mo": 2.7,
        "5Mo": 1.6,
        "3Mo": 0.1,
        "1Mo": 0.0
      }
    },
    "oneP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.2,
        "5Mo": 0.3,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 5.9,
        "5Mo": 1.4,
        "3Mo": 0.3,
        "1Mo": 0.3
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.0,
        "5Mo": 1.0,
        "3Mo": 0.6,
        "1Mo": 0.4
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 4.7,
        "3Mo": 2.5,
        "1Mo": 0.8
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.1,
        "3Mo": 1.9,
        "1Mo": 0.7
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.9,
        "5Mo": 1.3,
        "3Mo": 0.6,
        "1Mo": 0.4
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.0,
        "5Mo": 2.0,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 6.5,
        "7Mo": 3.3,
        "5Mo": 2.0,
        "3Mo": 0.4,
        "1Mo": 0.1
      }
    },
    "twoR": {
      "newYears": {
        "11Mo": 6.6,
        "7Mo": 0.8,
        "5Mo": 0.1,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 3.5,
        "5Mo": 0.8,
        "3Mo": 0.3,
        "1Mo": 0.2
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 4.3,
        "5Mo": 0.7,
        "3Mo": 0.3,
        "1Mo": 0.2
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 5.3,
        "5Mo": 2.5,
        "3Mo": 1.0,
        "1Mo": 1.2
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 5.6,
        "5Mo": 2.1,
        "3Mo": 0.8,
        "1Mo": 0.5
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 4.0,
        "5Mo": 1.0,
        "3Mo": 0.4,
        "1Mo": 0.3
      },
      "thanksgiving": {
        "11Mo": 6.7,
        "7Mo": 0.7,
        "5Mo": 1.3,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 6.2,
        "7Mo": 1.9,
        "5Mo": 1.3,
        "3Mo": 0.1,
        "1Mo": 0.0
      }
    },
    "twoP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 1.1,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 4.8,
        "5Mo": 0.9,
        "3Mo": 0.3,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 4.0,
        "5Mo": 0.4,
        "3Mo": 0.3,
        "1Mo": 0.3
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.2,
        "5Mo": 2.5,
        "3Mo": 1.4,
        "1Mo": 0.8
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.4,
        "5Mo": 2.5,
        "3Mo": 0.9,
        "1Mo": 0.4
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 4.6,
        "5Mo": 0.8,
        "3Mo": 0.3,
        "1Mo": 0.2
      },
      "thanksgiving": {
        "11Mo": 6.8,
        "7Mo": 0.8,
        "5Mo": 1.8,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 6.2,
        "7Mo": 2.1,
        "5Mo": 1.8,
        "3Mo": 0.1,
        "1Mo": 0.1
      }
    },
    "threeP": {
      "newYears": {
        "11Mo": 6.1,
        "7Mo": 0.7,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 6.9,
        "7Mo": 3.8,
        "5Mo": 0.8,
        "3Mo": 0.4,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 4.7,
        "5Mo": 1.4,
        "3Mo": 0.5,
        "1Mo": 0.4
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.4,
        "5Mo": 2.6,
        "3Mo": 1.7,
        "1Mo": 2.6
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.1,
        "5Mo": 3.0,
        "3Mo": 1.6,
        "1Mo": 0.7
      },
      "foodAndWine": {
        "11Mo": 6.8,
        "7Mo": 5.1,
        "5Mo": 1.1,
        "3Mo": 0.6,
        "1Mo": 0.6
      },
      "thanksgiving": {
        "11Mo": 5.4,
        "7Mo": 0.6,
        "5Mo": 0.8,
        "3Mo": 0.0,
        "1Mo": 0.3
      },
      "christmas": {
        "11Mo": 5.5,
        "7Mo": 1.9,
        "5Mo": 0.8,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    }
  },
  "hiltonHead": {
    "deluxeStudio": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 5.2,
        "5Mo": 1.0,
        "3Mo": 1.1,
        "1Mo": 0.4
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.6,
        "5Mo": 2.8,
        "3Mo": 1.6,
        "1Mo": 0.6
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.2,
        "5Mo": 0.4,
        "3Mo": 0.4,
        "1Mo": 0.4
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 5.2,
        "5Mo": 0.8,
        "3Mo": 0.3,
        "1Mo": 0.1
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 5.7,
        "5Mo": 1.6,
        "3Mo": 1.1,
        "1Mo": 1.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 1.9,
        "3Mo": 0.4,
        "1Mo": 1.6
      }
    },
    "oneBedroom": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 6.6,
        "5Mo": 1.9,
        "3Mo": 0.8,
        "1Mo": 1.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.6,
        "5Mo": 3.3,
        "3Mo": 2.2,
        "1Mo": 1.9
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 1.1,
        "3Mo": 0.8,
        "1Mo": 0.3
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.5,
        "5Mo": 1.2,
        "3Mo": 0.7,
        "1Mo": 0.4
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 6.0,
        "5Mo": 1.7,
        "3Mo": 1.4,
        "1Mo": 0.6
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 1.9,
        "3Mo": 1.0,
        "1Mo": 0.8
      }
    },
    "twoBedroom": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.6,
        "3Mo": 1.9,
        "1Mo": 2.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.7,
        "3Mo": 5.8,
        "1Mo": 4.1
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.5,
        "3Mo": 2.0,
        "1Mo": 1.3
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 2.0,
        "3Mo": 1.0,
        "1Mo": 0.8
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 6.4,
        "5Mo": 2.1,
        "3Mo": 2.1,
        "1Mo": 1.4
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 4.4,
        "3Mo": 2.3,
        "1Mo": 1.6
      }
    },
    "threeBedroom": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 3.7,
        "5Mo": 0.8,
        "3Mo": 0.7,
        "1Mo": 0.6
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.4,
        "3Mo": 3.8,
        "1Mo": 2.5
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 5.6,
        "5Mo": 1.4,
        "3Mo": 1.4,
        "1Mo": 1.1
      },
      "summer": {
        "11Mo": 6.9,
        "7Mo": 3.3,
        "5Mo": 1.2,
        "3Mo": 0.6,
        "1Mo": 0.6
      },
      "thanksgiving": {
        "11Mo": 6.0,
        "7Mo": 3.6,
        "5Mo": 1.4,
        "3Mo": 1.2,
        "1Mo": 1.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 4.7,
        "5Mo": 2.3,
        "3Mo": 0.3,
        "1Mo": 0.4
      }
    }
  },
  "oldKeyWest": {
    "deluxeStudio": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 3.0,
        "5Mo": 0.4,
        "3Mo": 0.2,
        "1Mo": 0.2
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 4.5,
        "5Mo": 1.4,
        "3Mo": 0.7,
        "1Mo": 0.2
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 4.8,
        "5Mo": 1.4,
        "3Mo": 0.6,
        "1Mo": 0.6
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 5.7,
        "5Mo": 4.1,
        "3Mo": 3.0,
        "1Mo": 1.7
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.2,
        "5Mo": 4.2,
        "3Mo": 2.7,
        "1Mo": 1.2
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 4.7,
        "5Mo": 1.9,
        "3Mo": 0.9,
        "1Mo": 0.7
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 2.8,
        "5Mo": 2.3,
        "3Mo": 0.4,
        "1Mo": 0.2
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 5.2,
        "5Mo": 2.3,
        "3Mo": 1.2,
        "1Mo": 1.0
      }
    },
    "oneBedroom": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 5.3,
        "5Mo": 0.9,
        "3Mo": 0.5,
        "1Mo": 0.2
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.3,
        "5Mo": 3.5,
        "3Mo": 1.9,
        "1Mo": 1.2
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.2,
        "5Mo": 3.3,
        "3Mo": 1.6,
        "1Mo": 1.1
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 6.2,
        "3Mo": 4.6,
        "1Mo": 3.4
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.1,
        "3Mo": 4.8,
        "1Mo": 3.2
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 6.2,
        "5Mo": 3.8,
        "3Mo": 2.5,
        "1Mo": 1.6
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 3.7,
        "5Mo": 2.8,
        "3Mo": 0.8,
        "1Mo": 0.5
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 2.8,
        "3Mo": 1.6,
        "1Mo": 0.7
      }
    },
    "twoBedroom": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 3.1,
        "5Mo": 0.6,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 5.5,
        "5Mo": 3.0,
        "3Mo": 1.4,
        "1Mo": 1.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.7,
        "5Mo": 3.0,
        "3Mo": 1.9,
        "1Mo": 1.1
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.0,
        "5Mo": 4.8,
        "3Mo": 4.2,
        "1Mo": 2.4
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 4.8,
        "3Mo": 3.8,
        "1Mo": 2.3
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.6,
        "5Mo": 3.3,
        "3Mo": 2.2,
        "1Mo": 1.7
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 3.5,
        "5Mo": 2.4,
        "3Mo": 0.8,
        "1Mo": 0.4
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 4.9,
        "5Mo": 2.4,
        "3Mo": 1.4,
        "1Mo": 0.6
      }
    },
    "threeBedroom": {
      "newYears": {
        "11Mo": 6.0,
        "7Mo": 0.8,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 6.0,
        "7Mo": 1.9,
        "5Mo": 1.1,
        "3Mo": 0.8,
        "1Mo": 0.5
      },
      "presidents": {
        "11Mo": 6.0,
        "7Mo": 3.0,
        "5Mo": 1.3,
        "3Mo": 0.9,
        "1Mo": 0.9
      },
      "easter": {
        "11Mo": 6.3,
        "7Mo": 3.5,
        "5Mo": 2.3,
        "3Mo": 1.9,
        "1Mo": 1.8
      },
      "summer": {
        "11Mo": 6.2,
        "7Mo": 3.6,
        "5Mo": 1.8,
        "3Mo": 1.4,
        "1Mo": 1.0
      },
      "foodAndWine": {
        "11Mo": 5.9,
        "7Mo": 2.6,
        "5Mo": 1.4,
        "3Mo": 0.9,
        "1Mo": 1.0
      },
      "thanksgiving": {
        "11Mo": 5.6,
        "7Mo": 1.6,
        "5Mo": 1.0,
        "3Mo": 0.5,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 6.2,
        "7Mo": 1.3,
        "5Mo": 1.0,
        "3Mo": 0.3,
        "1Mo": 0.2
      }
    }
  },
  "polynesianVillas": {
    "dsR": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.1,
        "5Mo": 0.1,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 5.3,
        "5Mo": 1.1,
        "3Mo": 0.1,
        "1Mo": 0.4
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.0,
        "5Mo": 1.0,
        "3Mo": 0.4,
        "1Mo": 0.4
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 4.8,
        "3Mo": 2.6,
        "1Mo": 2.0
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 3.7,
        "3Mo": 1.3,
        "1Mo": 1.0
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.0,
        "5Mo": 0.8,
        "3Mo": 0.4,
        "1Mo": 0.5
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.0,
        "5Mo": 2.3,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 5.3,
        "5Mo": 2.3,
        "3Mo": 0.8,
        "1Mo": 1.1
      }
    },
    "dsP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.4,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 5.4,
        "5Mo": 1.6,
        "3Mo": 0.3,
        "1Mo": 0.6
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.7,
        "5Mo": 0.8,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.6,
        "3Mo": 1.6,
        "1Mo": 0.8
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 3.7,
        "3Mo": 1.1,
        "1Mo": 0.6
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 4.9,
        "5Mo": 0.8,
        "3Mo": 0.3,
        "1Mo": 0.3
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.1,
        "5Mo": 1.7,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 4.1,
        "5Mo": 1.7,
        "3Mo": 0.1,
        "1Mo": 0.4
      }
    },
    "twoBedBungalow": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 6.0,
        "5Mo": 0.7,
        "3Mo": 0.0,
        "1Mo": 0.3
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.3,
        "3Mo": 1.4,
        "1Mo": 0.8
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.8,
        "3Mo": 4.3,
        "1Mo": 2.3
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 6.7,
        "1Mo": 5.8
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.8,
        "3Mo": 5.5,
        "1Mo": 3.8
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 4.9,
        "3Mo": 3.2,
        "1Mo": 1.9
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 5.3,
        "5Mo": 3.6,
        "3Mo": 0.8,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 6.4,
        "5Mo": 3.6,
        "3Mo": 1.2,
        "1Mo": 0.7
      }
    },
    "duoR": {
      "newYears": {
        "11Mo": 6.0,
        "7Mo": 2.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 4.0,
        "5Mo": 0.0,
        "3Mo": 0.5,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.5,
        "5Mo": 1.0,
        "3Mo": 0.3,
        "1Mo": 0.5
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 1.0,
        "3Mo": 0.5,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 2.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "duoP": {
      "newYears": {
        "11Mo": 6.0,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 2.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 3.0,
        "5Mo": 1.2,
        "3Mo": 0.5,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 1.0,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 1.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 6.0,
        "7Mo": 2.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "duoPM": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.0,
        "5Mo": 0.0,
        "3Mo": 0.5,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 1.2,
        "3Mo": 0.7,
        "1Mo": 0.5
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 1.0,
        "3Mo": 0.3,
        "1Mo": 0.1
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 1.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 1.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "dsTwrR": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 1.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 2.5,
        "5Mo": 0.5,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.5,
        "5Mo": 1.0,
        "3Mo": 0.5,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 5.5,
        "5Mo": 0.6,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 2.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 2.0,
        "5Mo": 1.0,
        "3Mo": 0.0,
        "1Mo": 0.5
      }
    },
    "dsTwrP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 2.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.5,
        "5Mo": 0.3,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 5.1,
        "5Mo": 0.6,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 1.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "dsTP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.0,
        "5Mo": 1.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 5.0,
        "5Mo": 0.5,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 1.8,
        "3Mo": 1.0,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.6,
        "5Mo": 0.7,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 1.0,
        "5Mo": 1.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 3.0,
        "5Mo": 1.0,
        "3Mo": 1.0,
        "1Mo": 0.5
      }
    },
    "oneR": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 6.5,
        "7Mo": 2.5,
        "5Mo": 0.5,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.0,
        "5Mo": 0.7,
        "3Mo": 0.7,
        "1Mo": 0.5
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 3.4,
        "5Mo": 0.8,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 3.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "oneP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 1.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 2.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 4.5,
        "5Mo": 1.8,
        "3Mo": 0.5,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 4.6,
        "5Mo": 0.6,
        "3Mo": 0.5,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 5.5,
        "7Mo": 0.0,
        "5Mo": 1.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 6.5,
        "7Mo": 5.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "oneTP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.5,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.5,
        "3Mo": 1.4,
        "1Mo": 1.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 0.8,
        "3Mo": 0.6,
        "1Mo": 0.3
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 2.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.0,
        "5Mo": 0.0,
        "3Mo": 1.0,
        "1Mo": 0.0
      }
    },
    "twoR": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 6.5,
        "7Mo": 1.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 4.5,
        "5Mo": 0.3,
        "3Mo": 0.5,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 2.7,
        "5Mo": 0.4,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 6.5,
        "7Mo": 2.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "twoP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 2.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 4.5,
        "5Mo": 0.3,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 3.9,
        "5Mo": 0.3,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 5.5,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 6.5,
        "7Mo": 1.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "twoTP": {
      "newYears": {
        "11Mo": 6.5,
        "7Mo": 1.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 6.8,
        "7Mo": 2.8,
        "5Mo": 0.2,
        "3Mo": 0.2,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.5,
        "5Mo": 1.1,
        "3Mo": 0.5,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 5.2,
        "5Mo": 0.6,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "summer": {
        "11Mo": 6.5,
        "7Mo": 0.5,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 5.5,
        "7Mo": 3.0,
        "5Mo": 0.5,
        "3Mo": 0.5,
        "1Mo": 0.0
      }
    },
    "penthouseP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 2.5,
        "5Mo": 0.5,
        "3Mo": 0.5,
        "1Mo": 0.3
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 4.0,
        "5Mo": 0.7,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 6.6,
        "7Mo": 5.5,
        "5Mo": 0.6,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "penthouseTP": {
      "newYears": {
        "11Mo": 6.0,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 6.5,
        "7Mo": 1.4,
        "5Mo": 0.5,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 4.0,
        "7Mo": 3.5,
        "5Mo": 0.7,
        "3Mo": 0.0,
        "1Mo": 1.0
      },
      "easter": {
        "11Mo": 5.5,
        "7Mo": 3.9,
        "5Mo": 0.8,
        "3Mo": 0.3,
        "1Mo": 0.1
      },
      "summer": {
        "11Mo": 4.5,
        "7Mo": 1.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 1.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    }
  },
  "rivieraResort": {
    "towerStudio": {
      "newYears": {
        "11Mo": 6.7,
        "7Mo": 0.6,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.2
      },
      "marathon": {
        "11Mo": 6.8,
        "7Mo": 1.0,
        "5Mo": 0.5,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 6.8,
        "7Mo": 1.3,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 3.1,
        "5Mo": 0.5,
        "3Mo": 0.5,
        "1Mo": 0.3
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 4.2,
        "5Mo": 0.8,
        "3Mo": 0.5,
        "1Mo": 0.3
      },
      "foodAndWine": {
        "11Mo": 6.9,
        "7Mo": 1.0,
        "5Mo": 0.2,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 0.1,
        "5Mo": 1.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 6.8,
        "7Mo": 2.8,
        "5Mo": 1.0,
        "3Mo": 0.2,
        "1Mo": 0.2
      }
    },
    "dsR": {
      "newYears": {
        "11Mo": 6.8,
        "7Mo": 0.3,
        "5Mo": 0.2,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 1.9,
        "5Mo": 0.5,
        "3Mo": 0.2,
        "1Mo": 0.2
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 2.7,
        "5Mo": 0.3,
        "3Mo": 0.1,
        "1Mo": 0.2
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 3.7,
        "5Mo": 0.6,
        "3Mo": 0.7,
        "1Mo": 0.2
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 3.1,
        "5Mo": 1.1,
        "3Mo": 0.5,
        "1Mo": 0.3
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 1.7,
        "5Mo": 0.5,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 0.3,
        "5Mo": 1.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 2.1,
        "5Mo": 1.0,
        "3Mo": 0.3,
        "1Mo": 0.0
      }
    },
    "dsP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 1.7,
        "5Mo": 0.2,
        "3Mo": 0.2,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 4.4,
        "5Mo": 1.2,
        "3Mo": 0.5,
        "1Mo": 0.5
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 5.7,
        "5Mo": 0.7,
        "3Mo": 0.5,
        "1Mo": 0.3
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 3.2,
        "3Mo": 1.3,
        "1Mo": 0.6
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 3.7,
        "3Mo": 1.4,
        "1Mo": 0.7
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 4.5,
        "5Mo": 1.1,
        "3Mo": 0.5,
        "1Mo": 0.3
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.6,
        "5Mo": 1.9,
        "3Mo": 0.2,
        "1Mo": 0.2
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 4.8,
        "5Mo": 1.9,
        "3Mo": 0.5,
        "1Mo": 0.5
      }
    },
    "oneR": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.7,
        "5Mo": 0.3,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 5.9,
        "5Mo": 2.1,
        "3Mo": 1.1,
        "1Mo": 0.3
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.3,
        "5Mo": 2.4,
        "3Mo": 0.9,
        "1Mo": 0.6
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.3,
        "3Mo": 2.6,
        "1Mo": 1.4
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 4.9,
        "3Mo": 2.4,
        "1Mo": 1.1
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.7,
        "5Mo": 1.9,
        "3Mo": 1.0,
        "1Mo": 0.6
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.6,
        "5Mo": 2.0,
        "3Mo": 0.5,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 5.1,
        "5Mo": 2.0,
        "3Mo": 0.5,
        "1Mo": 0.5
      }
    },
    "oneP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 5.4,
        "5Mo": 0.5,
        "3Mo": 0.2,
        "1Mo": 0.3
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.9,
        "3Mo": 1.3,
        "1Mo": 1.2
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.7,
        "3Mo": 2.0,
        "1Mo": 1.6
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.6,
        "3Mo": 4.5,
        "1Mo": 3.1
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 5.1,
        "1Mo": 2.8
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 3.4,
        "3Mo": 1.9,
        "1Mo": 1.1
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 4.3,
        "5Mo": 3.2,
        "3Mo": 0.6,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 6.6,
        "5Mo": 3.2,
        "3Mo": 1.3,
        "1Mo": 0.8
      }
    },
    "twoR": {
      "newYears": {
        "11Mo": 6.9,
        "7Mo": 0.8,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 2.3,
        "5Mo": 0.8,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 2.9,
        "5Mo": 0.7,
        "3Mo": 0.3,
        "1Mo": 0.3
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 4.8,
        "5Mo": 1.9,
        "3Mo": 0.9,
        "1Mo": 0.5
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 4.5,
        "5Mo": 1.7,
        "3Mo": 0.8,
        "1Mo": 0.5
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 2.5,
        "5Mo": 0.8,
        "3Mo": 0.3,
        "1Mo": 0.3
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.0,
        "5Mo": 1.2,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 2.7,
        "5Mo": 1.2,
        "3Mo": 0.4,
        "1Mo": 0.1
      }
    },
    "twoP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.4,
        "5Mo": 0.1,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 5.6,
        "5Mo": 1.8,
        "3Mo": 0.6,
        "1Mo": 0.4
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.3,
        "5Mo": 1.6,
        "3Mo": 0.8,
        "1Mo": 0.8
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 4.5,
        "3Mo": 3.0,
        "1Mo": 1.6
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 4.5,
        "3Mo": 2.0,
        "1Mo": 0.9
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 5.6,
        "5Mo": 1.8,
        "3Mo": 0.8,
        "1Mo": 0.6
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 2.1,
        "5Mo": 1.6,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 5.5,
        "5Mo": 1.6,
        "3Mo": 0.4,
        "1Mo": 0.2
      }
    },
    "threeBedroom": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 3.6,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.6,
        "5Mo": 1.4,
        "3Mo": 0.5,
        "1Mo": 0.3
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.5,
        "3Mo": 1.3,
        "1Mo": 1.4
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.1,
        "3Mo": 4.0,
        "1Mo": 2.9
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.6,
        "3Mo": 2.0,
        "1Mo": 0.9
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 6.5,
        "5Mo": 2.0,
        "3Mo": 1.0,
        "1Mo": 1.0
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 3.3,
        "5Mo": 1.4,
        "3Mo": 0.3,
        "1Mo": 0.5
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 3.8,
        "5Mo": 1.4,
        "3Mo": 0.3,
        "1Mo": 0.0
      }
    }
  },
  "saratogaSprings": {
    "dsS": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 4.7,
        "5Mo": 1.2,
        "3Mo": 0.6,
        "1Mo": 0.8
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.4,
        "5Mo": 4.3,
        "3Mo": 2.2,
        "1Mo": 1.3
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.5,
        "5Mo": 4.6,
        "3Mo": 1.4,
        "1Mo": 0.8
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.7,
        "3Mo": 5.1,
        "1Mo": 3.2
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.9,
        "3Mo": 5.8,
        "1Mo": 3.7
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 6.6,
        "5Mo": 3.7,
        "3Mo": 2.1,
        "1Mo": 1.6
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 3.1,
        "5Mo": 3.7,
        "3Mo": 0.6,
        "1Mo": 0.4
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 3.7,
        "3Mo": 2.1,
        "1Mo": 1.9
      }
    },
    "dsP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 4.9,
        "5Mo": 1.1,
        "3Mo": 0.7,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 4.7,
        "3Mo": 2.4,
        "1Mo": 1.2
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.6,
        "3Mo": 1.3,
        "1Mo": 1.2
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.1,
        "3Mo": 5.3,
        "1Mo": 3.7
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 6.5,
        "1Mo": 4.1
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 3.8,
        "3Mo": 2.2,
        "1Mo": 1.9
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 4.3,
        "5Mo": 3.7,
        "3Mo": 0.8,
        "1Mo": 0.3
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 3.7,
        "3Mo": 2.3,
        "1Mo": 1.9
      }
    },
    "oneS": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.5,
        "3Mo": 1.1,
        "1Mo": 0.6
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.8,
        "3Mo": 3.8,
        "1Mo": 2.6
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 3.6,
        "1Mo": 2.2
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 6.7,
        "1Mo": 5.8
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 6.8,
        "1Mo": 5.4
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.0,
        "3Mo": 4.7,
        "1Mo": 3.0
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 6.3,
        "5Mo": 5.6,
        "3Mo": 1.9,
        "1Mo": 1.4
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.6,
        "3Mo": 3.0,
        "1Mo": 2.1
      }
    },
    "oneP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.1,
        "3Mo": 1.0,
        "1Mo": 0.6
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.1,
        "3Mo": 4.3,
        "1Mo": 2.6
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 4.4,
        "1Mo": 2.6
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 6.8,
        "1Mo": 6.2
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 6.9,
        "1Mo": 5.9
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.0,
        "3Mo": 4.7,
        "1Mo": 3.5
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.3,
        "3Mo": 2.0,
        "1Mo": 1.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.3,
        "3Mo": 3.7,
        "1Mo": 1.9
      }
    },
    "twoS": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 5.2,
        "5Mo": 1.2,
        "3Mo": 0.6,
        "1Mo": 0.2
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 4.9,
        "3Mo": 2.9,
        "1Mo": 1.9
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 5.3,
        "3Mo": 2.5,
        "1Mo": 1.8
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.3,
        "3Mo": 5.9,
        "1Mo": 4.6
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 6.3,
        "1Mo": 4.7
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 4.7,
        "3Mo": 3.3,
        "1Mo": 2.5
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 4.7,
        "5Mo": 3.7,
        "3Mo": 1.0,
        "1Mo": 0.8
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 3.7,
        "3Mo": 2.0,
        "1Mo": 1.1
      }
    },
    "twoP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 5.3,
        "5Mo": 1.2,
        "3Mo": 0.6,
        "1Mo": 0.3
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 5.1,
        "3Mo": 3.0,
        "1Mo": 1.7
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.0,
        "3Mo": 2.3,
        "1Mo": 2.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.5,
        "3Mo": 6.0,
        "1Mo": 5.0
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 6.7,
        "1Mo": 5.0
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 4.8,
        "3Mo": 3.5,
        "1Mo": 2.7
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 3.7,
        "3Mo": 0.9,
        "1Mo": 0.7
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 3.7,
        "3Mo": 2.2,
        "1Mo": 1.4
      }
    },
    "treehouse": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 4.9,
        "5Mo": 0.7,
        "3Mo": 0.6,
        "1Mo": 0.0
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 4.9,
        "3Mo": 3.0,
        "1Mo": 2.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.1,
        "3Mo": 4.3,
        "1Mo": 3.1
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 6.6,
        "5Mo": 6.8,
        "3Mo": 6.5,
        "1Mo": 6.2
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 6.1,
        "1Mo": 4.3
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.6,
        "3Mo": 4.3,
        "1Mo": 3.3
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 3.4,
        "3Mo": 1.4,
        "1Mo": 0.8
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 3.4,
        "3Mo": 0.8,
        "1Mo": 0.4
      }
    },
    "threeS": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 3.2,
        "5Mo": 0.6,
        "3Mo": 0.4,
        "1Mo": 0.8
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.6,
        "5Mo": 3.6,
        "3Mo": 2.0,
        "1Mo": 1.6
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.7,
        "3Mo": 3.7,
        "1Mo": 2.8
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.7,
        "3Mo": 6.1,
        "1Mo": 5.8
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.0,
        "3Mo": 4.8,
        "1Mo": 4.1
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 4.6,
        "3Mo": 3.5,
        "1Mo": 2.7
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 5.3,
        "5Mo": 1.7,
        "3Mo": 1.4,
        "1Mo": 0.8
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 4.8,
        "5Mo": 1.7,
        "3Mo": 1.1,
        "1Mo": 0.7
      }
    },
    "threeP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.6,
        "5Mo": 0.4,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "marathon": {
        "11Mo": 7.0,
        "7Mo": 6.6,
        "5Mo": 2.9,
        "3Mo": 2.2,
        "1Mo": 1.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.4,
        "3Mo": 3.6,
        "1Mo": 2.7
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.8,
        "3Mo": 6.6,
        "1Mo": 5.6
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.9,
        "3Mo": 4.3,
        "1Mo": 3.7
      },
      "foodAndWine": {
        "11Mo": 7.0,
        "7Mo": 6.7,
        "5Mo": 4.7,
        "3Mo": 3.3,
        "1Mo": 2.7
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 3.7,
        "5Mo": 2.0,
        "3Mo": 1.2,
        "1Mo": 0.3
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 2.0,
        "3Mo": 0.6,
        "1Mo": 1.2
      }
    }
  },
  "veroBeach": {
    "innStandard": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 4.0,
        "3Mo": 2.5,
        "1Mo": 1.9
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.7,
        "3Mo": 3.7,
        "1Mo": 2.3
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 6.5,
        "3Mo": 4.3,
        "1Mo": 1.6
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.0,
        "3Mo": 2.0,
        "1Mo": 1.1
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.3,
        "3Mo": 2.5,
        "1Mo": 2.1
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 3.8,
        "1Mo": 2.5
      }
    },
    "innOcean": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.7,
        "3Mo": 1.9,
        "1Mo": 1.1
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.5,
        "3Mo": 1.9,
        "1Mo": 0.9
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 4.0,
        "3Mo": 2.5,
        "1Mo": 0.6
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.1,
        "3Mo": 0.9,
        "1Mo": 0.7
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.5,
        "3Mo": 1.7,
        "1Mo": 1.2
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 4.8,
        "3Mo": 3.1,
        "1Mo": 1.2
      }
    },
    "deluxeStudio": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 4.6,
        "3Mo": 2.0,
        "1Mo": 2.7
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 5.1,
        "3Mo": 3.3,
        "1Mo": 1.9
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 4.3,
        "1Mo": 1.3
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 4.3,
        "3Mo": 1.7,
        "1Mo": 0.6
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.7,
        "3Mo": 2.1,
        "1Mo": 1.9
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 7.0,
        "3Mo": 3.6,
        "1Mo": 2.0
      }
    },
    "oneBedroom": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 6.9,
        "5Mo": 2.3,
        "3Mo": 1.2,
        "1Mo": 1.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.4,
        "3Mo": 1.4,
        "1Mo": 1.4
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.9,
        "3Mo": 2.6,
        "1Mo": 1.4
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 1.6,
        "3Mo": 0.6,
        "1Mo": 0.5
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.0,
        "3Mo": 1.6,
        "1Mo": 1.2
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.3,
        "3Mo": 1.1,
        "1Mo": 1.4
      }
    },
    "twoBedroom": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 1.9,
        "3Mo": 1.3,
        "1Mo": 0.9
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.7,
        "3Mo": 1.4,
        "1Mo": 1.2
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.8,
        "3Mo": 2.2,
        "1Mo": 0.9
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 1.3,
        "3Mo": 0.4,
        "1Mo": 0.2
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 5.9,
        "5Mo": 2.2,
        "3Mo": 1.6,
        "1Mo": 1.4
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.0,
        "3Mo": 1.2,
        "1Mo": 1.1
      }
    },
    "beachCottage": {
      "newYears": {
        "11Mo": 6.9,
        "7Mo": 4.0,
        "5Mo": 0.7,
        "3Mo": 0.1,
        "1Mo": 0.7
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.0,
        "5Mo": 1.4,
        "3Mo": 0.9,
        "1Mo": 0.9
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 5.6,
        "5Mo": 1.6,
        "3Mo": 1.0,
        "1Mo": 0.2
      },
      "summer": {
        "11Mo": 6.9,
        "7Mo": 3.3,
        "5Mo": 0.6,
        "3Mo": 0.2,
        "1Mo": 0.1
      },
      "thanksgiving": {
        "11Mo": 6.9,
        "7Mo": 2.5,
        "5Mo": 0.7,
        "3Mo": 0.7,
        "1Mo": 0.3
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 1.7,
        "5Mo": 1.6,
        "3Mo": 0.4,
        "1Mo": 0.6
      }
    }
  },
  "disneylandHotel": {
    "duoS": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.5,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 3.7,
        "5Mo": 0.2,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 0.2,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 0.1,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 1.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.6
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 3.0,
        "5Mo": 3.5,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "duoP": {
      "newYears": {
        "11Mo": 6.5,
        "7Mo": 1.4,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 4.0,
        "5Mo": 0.3,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 5.8,
        "5Mo": 0.5,
        "3Mo": 0.2,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 5.1,
        "5Mo": 0.2,
        "3Mo": 0.1,
        "1Mo": 0.2
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 0.5,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 3.0,
        "5Mo": 3.5,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "gardenDuo": {
      "newYears": {
        "11Mo": 5.5,
        "7Mo": 1.4,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 5.8,
        "7Mo": 1.4,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 6.8,
        "7Mo": 4.1,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 6.3,
        "7Mo": 2.5,
        "5Mo": 0.1,
        "3Mo": 0.1,
        "1Mo": 0.0
      },
      "thanksgiving": {
        "11Mo": 6.3,
        "7Mo": 1.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 5.7,
        "7Mo": 1.4,
        "5Mo": 1.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "dsS": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 2.5,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.3
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 6.2,
        "5Mo": 0.0,
        "3Mo": 0.2,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 0.6,
        "3Mo": 0.0,
        "1Mo": 0.3
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 0.4,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 4.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 5.0,
        "5Mo": 3.5,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "dsP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 5.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 0.5,
        "3Mo": 0.2,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 2.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 6.8,
        "5Mo": 0.3,
        "3Mo": 0.1,
        "1Mo": 0.1
      },
      "thanksgiving": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 7.0,
        "5Mo": 3.5,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "gardenDS": {
      "newYears": {
        "11Mo": 5.0,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 6.5,
        "7Mo": 3.2,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 3.5,
        "5Mo": 0.5,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 6.2,
        "7Mo": 1.5,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "thanksgiving": {
        "11Mo": 6.7,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 1.4,
        "5Mo": 0.5,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "oneP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 2.5,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 4.0,
        "5Mo": 0.3,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 6.9,
        "7Mo": 1.5,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "thanksgiving": {
        "11Mo": 6.3,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    },
    "twoP": {
      "newYears": {
        "11Mo": 7.0,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "presidents": {
        "11Mo": 7.0,
        "7Mo": 3.1,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.1
      },
      "easter": {
        "11Mo": 7.0,
        "7Mo": 5.3,
        "5Mo": 0.2,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "summer": {
        "11Mo": 7.0,
        "7Mo": 1.9,
        "5Mo": 0.1,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "thanksgiving": {
        "11Mo": 6.5,
        "7Mo": 0.0,
        "5Mo": 0.0,
        "3Mo": 0.0,
        "1Mo": 0.0
      },
      "christmas": {
        "11Mo": 7.0,
        "7Mo": 0.0,
        "5Mo": 0.2,
        "3Mo": 0.0,
        "1Mo": 0.0
      }
    }
  }
};
