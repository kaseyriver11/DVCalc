# DVC Math — Gap Plan

Sourced 2026-09-22 from ~1,480 r/dvcmember posts (27 math-related RSS searches, deduped, keyword-classified, sampled). Counts are directional — they reflect which searches were run, and RSS carries no upvote data.

## Most common "DVC math" questions

| # | Question family | ~Posts | Covered today |
|---|---|---|---|
| 1 | Banking / borrowing / use-year mechanics | 365 | Ledger, Holding, Smart Draw, point moves, health banner |
| 2 | "How many points do I need?" | 280 | `suggest.html` (inverse direction only) |
| 3 | True cost per point (all-in, loaded/stripped, discounting) | 250 | `contractvalue.html` Cost/Pt/Year with dues growth |
| 4 | "Is it worth it?" / break-even vs cash | 160 | Cost Comparison tile; breakeven vs renting |
| 5 | In-stay point optimization | 215 | Calendar, split stays, trip rail |
| 6 | Resale vs direct premium | 165 | Direct-premium caption |
| 7 | Dues growth & hidden costs | 160 | `averageDuesPerPoint()` |
| 8 | Rental economics | 140 | Rental rate slider |
| 9 | Shortfall math (OTU vs transfer vs add-on) | — | Nothing |
| 10 | Expiration / resale value | 120 | `sellAtEnd` residual, net of broker fee |

## Step 0 — Housekeeping
- [x] Commit in-flight work so each feature below diffs cleanly (6a1c9a1)
- [x] Verify DVC rules before encoding them — see "Verified rules" below
- [x] Fix CLAUDE.md row #5's stale Holding description (60-day rebook clock → 60-day booking window)

## Phase 1 — Quick wins on existing surfaces
**1. Bank/borrow decision help** (Q1) — `account.html`, `app.js` Smart Draw, `dvc-ledger.js`
- [x] "Which points does this use?" — already existed (Smart Draw's per-bucket lines)
- [x] "If you cancel by {date}" outcome line — `cancellationOutcome()` + `buildCancelOutcomeHTML()`
- [x] Bank-first advice for stays past the banking deadline — `shouldSuggestBankFirst()`
- [x] Leftover-points finder on the ledger's expiring state — `dvc-leftover-points.js` + `buildLeftoverStaysHTML()`
- [x] Tests — `tests/dvc-ledger.test.js`, `tests/leftover-points.test.js`

**2. Discounted-cash comparison** (Q4) — `contractvalue.html` Adjust assumptions
- [ ] "Typical cash discount you get (%)" input, default 0, feeding Cash Ratio

**3. Rental net-to-owner** (Q8) — `app.js` rental tile
- [ ] "You'd keep ~$X after broker fees" (shared broker-fee constant)

## Phase 2 — The two big builds
**4. Contract Size Planner** (Q2)
- [ ] Pure module `dvc-contract-size.js`: recurring trips (resort/room/month/nights/every N years) → points/year needed, bank/borrow schedule, chart-inflation buffer
- [ ] UI as a "Figure it out from my trips" helper in `contractvalue.html` step 2, filling Target Point Budget
- [ ] Tests incl. the canonical "230 every 2 yrs + 50 every yr" case

**5. Resale Listing Evaluator** (Q3)
- [ ] "Evaluate a listing" mode in `contractvalue.html` reusing `computeRow()` — price/pt, points/yr, current + next UY points remaining, closing, dues; expiration auto-filled
- [ ] Outputs: effective $/pt after loaded/stripped adjustment, upfront cash, Cost/Pt/Year, vs resort resale baseline
- [ ] Optional discount-rate toggle

## Phase 3 — Deeper
**6. Personal break-even + opportunity cost** (Q4) — builds on #4
- [ ] Trip pattern × discounted cash vs ownership → break-even years
- [ ] "Invest instead at X%" assumption

**7. Shortfall Solver** (Q9) — Smart Draw when a stay exceeds available
- [ ] Rank borrow / OTU / transfer-in / rent / trim a night by $/pt

**8. Perk valuation** (Q6, lowest priority)
- [ ] Optional user-entered $/yr for direct perks, default $0

## Phase 4 — Spend, rent, keep or sell (added 2026-09-24)
From a second community pass (DISboards, TouringPlans, DVCinfo, DVC Fan, broker calculators), filtered against this doc.

**Two $/pt numbers, never mixed (fixed 2026-09-24):** the $30 **value per point** prices points against Disney's cash price (Cash Ratio, Membership Value). The $20 **rental price per point** prices renting (calendar rental tile, Resort Comparison's Rental Cost, Contract Value's Breakeven Horizon, renting points out). Both are kinds of `dvc-point-value.js`. Commit 3cb4c15 had moved every rental figure to $30 by mistake.

- [x] **A. Use or rent?** — `dvc-rental.js` `useOrRent()`; a line under the calendar's Cost Comparison tiles. (Also covers #3 above once broker net lands in B.)
- [x] **B. Points or Cash? page** (`pointsorcash.html`) — spend points on a cruise / Adventures by Disney / Disney Collection hotel or any cash booking: $/pt vs renting out vs value per point, with contract eligibility when signed in; renting points out: income at the $20 rental price (broker-payout note), points to cover each contract's dues. No after-tax estimate (one "rental income is taxable" note).
- [x] **C. Keep or sell** — card beside Exit Equity on `trips.html`: net sale today vs remaining years' value (points × value/pt × usage − dues) + resale at the deed's end. Resale curve shared with Contract Value.
- [x] **D. Financing** — `dvc-financing.js` (amortization); "Financed?" in Contract Value's Adjust assumptions; "Estimate from my loan" helper on Add/Edit Contract filling `financing_interest_paid`.

**Considered and skipped:**
- Transfer expiring points out at a market $/pt — DVC doesn't allow compensation for transfers (see Verified rules); pricing it would coach a rules violation.
- Which use year for a second contract — a buying question; folded into the Contract Size Planner (#4).
- Resale ROFR risk % — unverified, needs monthly upkeep. At most a no-number note on the Listing Evaluator (#5).
- Tax-deductible share of dues, after-tax rental income — tax advice, per-resort upkeep, few users.

## Cross-cutting
- 390px verification, empty + completed states (guardrail #6); forms 1-column (guardrail #1)
- Tooltip copy 1–2 sentences
- CLAUDE.md section per shipped feature

**Order:** 0 → 1 → 4 → 5 → 2/3 → 6 → 7 → 8

## Verified rules (2026-09-22)

Primary source: Disney's own [On-Line Booking Terms & Conditions](https://cdn1.parksmedia.wdprapps.disney.com/media/dvc/DVC-Terms-and-Conditions-2025-5-15-25.pdf) (effective 2025-06-01). Secondary sources noted inline.

**Cancel / modify outcomes (T&C, verbatim-level):**
- **31+ days before check-in:** cancel → all points (incl. borrowed) restored to *the Use Year the reservation falls in*. Modify cheaper → the difference returns to that same Use Year. Whether they're then bankable depends only on whether that UY's banking deadline has passed.
- **1–30 days before check-in:** all points → Holding Account (in the reservation's UY). Modify cheaper → the difference stays in Holding.
- **Check-in day:** cancel → forfeited; modify cheaper → difference forfeited.
- **Banked points** used on a canceled reservation never return to their original UY — they stay in the UY they were banked into (31+ days) or go to Holding (≤30 days).

**Holding Account:** cannot be banked or borrowed; usable until the end of the current Use Year, for DVC Resort stays **booked no more than 60 days before check-in**. The 60 days is an advance-booking window, *not* a rebook-within-60-days-of-cancellation clock. (Uncommitted `dvc-ledger.js`/`app.js`/`account.html` already reflect this correctly with a test; **CLAUDE.md's Future Features row #5 still describes the old 60-day-rebook clock and `points_holding_entered_at` — needs a doc fix.**)

**Banking (T&C):** current UY → next UY only, once, same Home Resort; final; banked points can't be borrowed or transferred; must be banked *before* the reservation that uses them is made; expire at the end of the UY they were banked into. Deadline = end of month 8 of the UY.

**Point order on a reservation:** online tool draws banked/borrowed before current-year points, across contracts in the order selected ([DVCinfo](https://dvcinfo.com/forum/threads/reservations-with-banked-points.11241/), [planDisney](https://plandisney.disney.go.com/question/banked-points-used-first-making-reservation-530159/)); owner has some control at booking. Member Services uses current-year first when borrowing is involved. → UI copy should say "typically," not assert one fixed order.

**Borrowing:** up to 100% of next UY's allotment (already in `dvc-ledger.js`); final.

**Transfers between members:** one transfer in *or* out per membership per Use Year; current, banked, and borrowed points may now be transferred; transferred points keep their original UY ([DVC Resale Market](https://www.dvcresalemarket.com/blog/dvc-revises-rules-for-point-transfers/), [DVC Fan](https://dvcfan.com/general-dvc/disney-vacation-club-updates-transfer-rules-more-flexibility-for-members/)). ⚠️ Brokers list transfer points at ~$20–21/pt ([DVC Store](https://www.dvcstore.com/points-for-transfer/)), but DVC's rules say members may not receive compensation for transfers, and the 2026 "commercial use" definition tightened rentals. **Open decision for Shortfall Solver (#7):** show "transfer in" as an option without a market price, or omit it.

**One-Time Use points:** $20/pt + tax = **$22.50/pt** since 2026-03-23; **max 24/yr**; Membership Magic Beyond ($99) makes 12 of them BOGO ([DVCNews](https://dvcnews.com/dvc-program-menu/policies-a-procedures/dvc-policy-news/6371-price-increase-for-disney-vacation-club-one-time-use-points-in-march-2026), [DVC Resale Market](https://www.dvcresalemarket.com/blog/here-are-the-pros-and-cons-of-membership-magic-2026/)). Reportedly bookable only ≤7 months from check-in (secondary source only — confirm before encoding).
