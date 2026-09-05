// Real-world purchase price and contract-length data for the Contract
// Value page ("which resort should I buy" comparison). NOT derived from
// data.js's own points/cash data -- these are market prices (fluctuate
// monthly) and legal contract facts (fixed), sourced separately and
// needing separate periodic refreshing.
//
// Resale prices: Fidelity Real Estate's July 2026 average price/point
// report (https://www.fidelityrealestate.com/blog/july-2026-average-dvc-resale-price-per-point/),
// except Fort Wilderness Cabins, which has almost no resale trading
// history yet (contract sales only opened Feb 2024) -- its $135/pt
// reflects the one known transaction reported by DVC Resale Market
// (https://www.dvcresalemarket.com/blog/first-cabins-at-fort-wilderness-dvc-resale-contract/),
// which itself later fell through, so treat this one figure as a rough
// signal, not a market average.
//
// Direct prices: DVCNews's current pricing page
// (https://dvcnews.com/dvc-program-menu/financial/pricing-a-promotions).
//
// Both price sets are volatile and not auto-refreshed here -- re-check
// these sources periodically the same way dues_historical.js and
// cash_value_index.js get periodic manual updates. See
// INVESTMENT_DATA_AS_OF below for when this was last pulled.
//
// Contract expiration: real, publicly documented DVC deed-expiration
// dates, cross-checked against multiple independent sources (DVC Resale
// Market, Fidelity, DVC Market, DVC Shop) 2026-09-05. Old Key West is a
// special case -- it has both an original 2042 expiration and a
// commonly-traded "extended" 2057 variant from a real past extension
// program members could opt into. Defaults to the shorter/original 2042
// date (the more conservative assumption), since which variant a
// specific resale contract carries isn't knowable without checking that
// contract's own deed -- see okwExtendedExpirationYear for the other
// option.
const INVESTMENT_DATA_AS_OF = "2026-09-05";

const RESORT_INVESTMENT_DATA = {
  oldKeyWest:           { resalePricePerPoint: 92.18,  directPricePerPoint: 215, contractExpirationYear: 2042, okwExtendedExpirationYear: 2057 },
  boardwalkVillas:      { resalePricePerPoint: 123.36, directPricePerPoint: 240, contractExpirationYear: 2042 },
  beachClubVillas:      { resalePricePerPoint: 140.14, directPricePerPoint: 275, contractExpirationYear: 2042 },
  boulderRidge:         { resalePricePerPoint: 103.02, directPricePerPoint: 215, contractExpirationYear: 2042 },
  hiltonHead:           { resalePricePerPoint: 64.52,  directPricePerPoint: 165, contractExpirationYear: 2042 },
  veroBeach:            { resalePricePerPoint: 51.44,  directPricePerPoint: 150, contractExpirationYear: 2042 },
  saratogaSprings:      { resalePricePerPoint: 101.76, directPricePerPoint: 215, contractExpirationYear: 2054 },
  animalKingdomVillas:  { resalePricePerPoint: 112.38, directPricePerPoint: 215, contractExpirationYear: 2057 },
  bayLakeTower:         { resalePricePerPoint: 141.34, directPricePerPoint: 275, contractExpirationYear: 2060 },
  grandCalifornian:     { resalePricePerPoint: 260.80, directPricePerPoint: 330, contractExpirationYear: 2060 },
  aulani:               { resalePricePerPoint: 98.00,  directPricePerPoint: 243, contractExpirationYear: 2062 },
  grandFloridian:       { resalePricePerPoint: 165.96, directPricePerPoint: 265, contractExpirationYear: 2064 },
  polynesianVillas:     { resalePricePerPoint: 165.40, directPricePerPoint: 243, contractExpirationYear: 2066 },
  copperCreek:          { resalePricePerPoint: 140.00, directPricePerPoint: 255, contractExpirationYear: 2068 },
  rivieraResort:        { resalePricePerPoint: 120.04, directPricePerPoint: 243, contractExpirationYear: 2070 },
  disneylandHotel:      { resalePricePerPoint: 147.76, directPricePerPoint: 248, contractExpirationYear: 2074 },
  fortWildernessCabins: { resalePricePerPoint: 135.00, directPricePerPoint: 243, contractExpirationYear: 2075 },
};
