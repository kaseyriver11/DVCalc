# DVC Companion: Owner UI/UX Review

Review date: September 21, 2026  
Status: Review complete. UX-01 through UX-14 implemented and verified locally. All migrations through 023 are applied in Supabase (confirmed September 22 with `db/check_migrations.sql`). All 14 original findings are resolved locally; the database handoff below is complete; the changes shipped to production on September 22. The summary below supersedes historical recommendations where the owner clarified the intended behavior.

## Changes completed: #1–#14

Updated September 22, 2026. This is the handoff summary for a fresh session.

| Issue | What changed | Result for an owner |
| --- | --- | --- |
| **#1 — Calendar deductions and trip logging** | Removed Apply to Trip/Apply Split and their ledger deductions. Log This Trip opens a new, prefilled Log a Trip form. Added complete point-source attribution across owned contracts and outside points; membership value uses the owned share. Refined the number cards, resort/room pickers, and point-source cards for mobile. | Saved itineraries describe possibilities; recorded bookings account for points actually used. Neither saving an itinerary nor logging a trip silently changes the point ledger. These remain separate workflows. |
| **#2 — Correct use year for a stay** | Calendar selects each contract's use year from the stay dates, labels the applicable cycle, and separates nights crossing a use-year boundary. Changed dates or balances invalidate old allocation previews. | A future stay uses the appropriate year's balance, not today's. Missing balances now require owner input under #5. |
| **#3 — Eligible funding only** | Itinerary comparison allocates points by contract, use year, resort eligibility, and stay segment without reusing the same balance. Shows funding sources, booking-window limits, missing balances, and holding-point review states. | A pooled portfolio total can no longer make a restricted or underfunded stay appear covered. Coverage is a planning assessment, not room availability or a booking. |
| **#4 — Reliable point attention** | Home and My Contracts share deadline calculations and prioritize actual banking/expiry dates, including banked, borrowed, and holding points. Links select the relevant contract. Successful ledger saves refresh warnings. | Earlier expiry wins over a later banking deadline. Holding points expire at use-year end; their 60-day rule is an advance booking window, not a countdown from entering holding. |
| **#5 — Owner-entered starting balances** | After adding a contract, a mobile sheet asks “What points do you have left?” with this/next use-year cards, actual dates, large point inputs, a full-allotment shortcut, optional point details, and persistent Save/Later buttons. Either year can be skipped. | Annual allotment is never assumed to be available. Zero is a real balance; blank is unknown. A 200-point contract can start with 0 this year and 100 next year without reconstructing already-spent borrowing. |
| **#6 — Record point movements** | Added Record banking, Record borrowing, and Adjust balance actions to the contract ledger. Movement sheets preview both years and save them together with a durable retry reference. Adjustment previews a correction to one year only. | Owners can record moves completed with Disney without manually editing two years, or correct a balance without inventing a movement. |
| **#7 — Consistent ownership value** | Home and Membership Value now use one shared model and the same saved assumptions. Both identify logged owner-funded stay value separately from projected value. Assumption saves are serialized and failed saves show a retryable preview state. | Both screens agree on the payback estimate, costs, recorded value, and percentage. Changing the projection baseline does not change logged stay value. |
| **#8 — Truthful push status** | Replaced the push toggle with Unavailable because this build has no configured sender. Removed permission requests and pending-subscription enrollment. Saving preferences clears stale enabled/pending flags. | Owners cannot mistake browser permission or an old setting for working push reminders. Email and in-app choices remain independent. |
| **#9 — Keep the comparison selection** | Compare passes explicit resort, room, check-in, and check-out values to Calendar. Calendar opens the selected month without requiring a previous visit. Split-stay comparisons identify the segment being replaced. | Starting from Home keeps the chosen stay. Round trips use the latest dates, and replacing one split segment preserves the others. |
| **#10 — Recover failed balance saves** | Balance cards distinguish last confirmed amounts from proposals, mark unsaved/unconfirmed entries, and expose Retry save and Discard edits. Confirmed partial saves become the new baseline; unchanged years are not rewritten. | A failed 10 → 30 edit leaves guidance based on 10. Owners can retry or discard local edits without mistaking them for stored balances or undoing a completed save. |
| **#11 — Edit versus copy** | Reopening a saved itinerary retains its identity and name. Save Changes updates it; Save as Copy creates a separate record. Booking As is saved and restored, and failed copy requests reuse their ID on retry. | Editing no longer silently creates another plan. A deliberate copy leaves the original intact. Saved itineraries remain independent of logged bookings and point balances. |

| **#12 — Logged usage evidence** | Membership Value counts owned points assigned to logged stays, with outside points and incomplete attribution explained separately. Balance changes cannot inflate this total. The Points Steward badge discloses its separate coverage estimate. | Zero logged stays means zero logged usage. Upcoming recorded bookings count; saved plans do not. No expired or unreconciled totals are guessed. |

| **#13 - Contract-first Home and navigation** | My Membership precedes planning in every menu. Home shows current/next use-year cards per active contract with dates, saved balances, and direct management links. Deadline entries link to their contract and year; planning has a secondary heading below ownership summaries. | Owners can find their points and manage the right cycle directly from Home. Zero and missing balances remain distinct. |

| **#14 - Mobile contract entry** | Compact summary, independently scrolling active step, persistent Back/Continue/Save controls, explicit progression, and step validation. Use year must be selected; invalid point or financial values remain correctable. Saves disable repeat taps and preserve inputs on failure. | Owners can complete or correct Add/Edit Contract without unexpected step changes or scrolling to find Save. |

### Decisions to preserve

- This is a **contract manager first**, with planning as a supporting feature. Use mobile cards and progressive disclosure rather than dense forms.
- Trust owner-entered balances. This is a practical management tool, not a reconciliation audit; no separate verification checkbox is required.
- Optional banked, borrowed, and holding amounts are **included within** the entered total, not added on top. Enter only points still available. If details are omitted, the total is stored as remaining points; bucket-specific deadline advice is only as precise as the owner's entries.
- Skipping a year does not overwrite an existing balance. A missing balance is neither zero nor the annual allotment. Home, Calendar, comparison, and point-efficiency calculations respect that distinction.
- The platform cannot book, bank, or borrow points with Disney. Saved itineraries and logged bookings are independent; logging a trip does not deduct the ledger.

### Verification and database handoff

- **228 automated tests currently pass** across the workspace, including the owner-flow regression tests and tests added by concurrent work. UX-11 adds seven focused itinerary-editing/persistence tests; UX-12 adds six logged-usage tests.
- Local mobile testing used isolated synthetic owner data at 390px and 360px. For #5, verified new-contract handoff, 0/100 balances, skipping, full-allotment entry, optional bucket math, invalid totals, unknown Home state, and partial-save failure/retry without repeating the successful year. The 360px sheet has no horizontal overflow and keeps Save/Later visible.
- The user confirmed running **[migration 019](../db/migrations/019_validate_trip_funding.sql)** for trip funding.
- **[Migration 020](../db/migrations/020_confirm_point_balances.sql) is applied** (September 22) — it had been missed at first, which surfaced as a `balance_confirmed_at` schema-cache error on save. It adds `balance_confirmed_at`, trusts existing saved rows, and leaves newly created unknown rows unconfirmed. The backfill runs only when the column is first introduced. The timestamp means owner-entered, not verified against Disney. The migration is also included in `db/schema.sql`.
- The owner confirmed applying **[migration 022](../db/migrations/022_record_point_movements.sql)** in Supabase on September 22. It requires migration 020. No migration was executed by this session; real authenticated movement saves and production deployment have not been verified. The attempted temporary local PostgreSQL test-engine download was interrupted, so the database function has not been runtime-tested here. No commit or deployment was performed for this handoff.
- Earlier #2/#3 log entries describe estimated allotments for missing rows; **#5 supersedes that behavior with unknown balances**. The original findings below remain historical evidence.

### Original review complete

**All 14 original review issues are resolved locally.** No numbered issues remain. Mobile push notifications and other feature work have separate to-do documents. Pending migration and real-account verification notes still apply.

**Before using UX-11 against Supabase, run [migration 023](../db/migrations/023_itinerary_booking_context.sql).** It adds the optional `booking_contract_id` and validates ownership; deleting the contract clears that planning context. No migration was executed by this session. The same SQL is appended to `db/schema.sql`. Existing itineraries have no recoverable prior Booking As value; the owner can choose one and save it going forward.

For #11, `state.itineraryEdit` carries owner-scoped identity through the saved-page and Calendar-picker load paths and comparison round trips. `auth.js` exposes an owner-filtered update operation. Explicit copy/new saves retain a generated ID across retries. Clearing the Calendar selection begins a new plan. Loading another itinerary or clearing selection is blocked while a save is in progress.

For #10, the balance-sheet handlers in `account.html` keep per-year confirmed snapshots. A successful partial save updates its snapshot; subsequent edits are unsaved again. Retry skips unchanged confirmed years. Discard closes the sheet and reloads stored data; it does not reverse successful or potentially committed requests. Point movements retain #6's atomic/idempotent retry path.

For #8, push enrollment remains unavailable until an operational sender and subscription lifecycle exist. The service worker is retained for installation and event handling. Enabling real push delivery is a separate feature, not completed by this fix. No backend readiness or real email delivery was verified in this session.

The requested mobile push feature is tracked in **[Mobile push to-do](mobile_push_todo.md)**, including sender deployment, device enrollment, truthful readiness, preferences, and physical-device testing.

For #9, `dvc-compare-handoff.js` validates and applies explicit selections. `compare.html` builds the URL; `app.js` restores it. Standalone selection does not depend on saved Calendar state. Split context remains session-based, with explicit errors for missing completed segments or date changes that would disrupt a split stay.

For #7, `dvc-owner-value.js` contains the shared ownership model, used by `home.js` and `trips.html`. Home now fetches `getUserSettings()` alongside portfolio data. Buying-guide scenarios in `contractvalue.html` remain independent hypothetical purchase comparisons; they were not rewritten as the existing-owner portfolio model. UX-12 now uses explicit trip funding for logged usage, independently of ledger balances and the badge estimate.

For #6, the implementation entry points are `account.html`, `account-point-moves.js`, `dvc-point-moves.js`, `auth.js`, and migration 022. Movement receipts are stored in `point_movements`; a visible history/undo interface is not included. A new deliberate submission after a successful save is a new movement; retry protection covers the same submission, not recognition of an external Disney transaction. Correct mistaken balances with Adjust balance.

## Product direction

DVC Companion is a **contract manager for existing Disney Vacation Club owners first**. Planning supports ownership management; it is not the primary reason owners come to the app.

The core questions are:

- What do I own?
- What points do I have available?
- What needs my attention?
- What is my ownership worth to me?
- What can I do with my current contracts?

### Agreed flow priority

1. Establish an accurate portfolio: sign in, add contracts, use years, purchase details, and current balances.
2. Know what needs attention: review points and deadlines, open the relevant contract, and take or record action.
3. Understand ownership value: combine contracts and logged stays to assess costs, vacation value, payback, and exit equity.
4. Understand what current contracts enable: eligible resorts, booking windows, affordable stays, and point allocations.
5. Evaluate ownership changes: assess an add-on or alternative purchase. The portfolio-to-buying-guide connection is currently more implied than integrated.
6. Plan a specific vacation: calendar, suggestions, comparisons, saved itineraries, and booking milestones.
7. Explore supporting features: achievements and historical points comparisons.

## Review scope and evidence

The local app was tested primarily at **390 × 844**, with an additional **360 × 800** check. The user authorized isolated synthetic owner data. Authentication and persistence were substituted for testing; screens, interaction handlers, and calculation logic were the actual app implementation.

Tasks exercised included contract creation/editing, ledger updates, deactivation/reactivation, deadline navigation, notification settings, trip logging, financial assumptions, stay suggestions, calendar selection, point allocation, split stays, saved itineraries, comparisons, and the buying guide. Empty states, invalid entries, simulated save failures, cancellation, and returning to earlier steps were also tested.

The sample portfolio included:

- **SSR Family:** Saratoga Springs, February use year, 150 annual points, resale, acquired in 2020 for $18,000.
- **Riviera Add-on:** Riviera, December use year, 100 annual points, resale, acquired in 2024 for $14,000.

Balances and trip records were varied between scenarios. Each finding describes the relevant state; the examples do not all represent one simultaneous portfolio snapshot.

**Overall assessment:** The app has useful ownership tools, but owners cannot yet consistently trust its balances, funding guidance, deadline priorities, or payback estimates. These are the highest-impact findings for a contract manager.

No app files were edited during the review. This document records observations from that build, not a claim that the behavior remains unchanged after future fixes.

## Issue tracker

The IDs below are stable references for addressing findings one at a time. Checking an item means its change has been implemented and verified against the recorded scenario.

- [x] UX-01 — Prevent repeated deductions for the same stay.
- [x] UX-02 — Use the stay's applicable use-year balance.
- [x] UX-03 — Restrict funding calculations to eligible contracts and points.
- [x] UX-04 — Include holding points in deadline prioritization.
- [x] UX-05 — Ask for available balances when adding existing contracts (migration 020 applied).
- [x] UX-06 — Provide explicit banking, borrowing, and adjustment flows (migration 022 applied by owner; live saves not verified).
- [x] UX-07 — Unify ownership-value calculations and assumptions.
- [x] UX-08 — Represent push-notification readiness truthfully.
- [x] UX-09 — Preserve the stay when leaving standalone resort comparison.
- [x] UX-10 — Make failed ledger saves recoverable and unambiguous.
- [x] UX-11 — Distinguish editing an itinerary from saving a copy (migration 023 applied).
- [x] UX-12 — Separate logged usage from inferred consumption.
- [x] UX-13 — Prioritize ownership management in navigation and Home.
- [x] UX-14 — Improve mobile contract-form navigation and validation.

## Findings ranked by impact on owners

### UX-01: Applying points can deduct the same stay repeatedly

**Severity:** Major  
**Flow/screen:** Allocate contract points → Calendar → Apply to Trip.

**Tried and observed:** Applied a 55-point stay against 125 available points. The ledger correctly became 70, but the summary immediately proposed another deduction for that same stay. Applying again reduced it to 15. Undo restored only the latest deduction. Neither application created a trip or transaction record.

**Owner impact:** A planning action can silently understate the owner's balance, with no durable explanation or reliable way to reconcile it later. The description “Advisory allocation” also understates what the button actually does.

**Recommended change:** Separate allocation previews from committed ledger transactions. Associate each commitment with a persistent reservation/plan ID, prevent duplicate application, show the resulting balance, and provide durable reversal/history.

**Code explaining the observation:** `applySmartDraw()` in [app.js](../app.js).

**Resolution:** The user clarified that calendar planning must not deduct points. The original transaction-based recommendation above was superseded by a preview-only calendar and an explicit handoff to the existing Log a Trip form. The old allocation/undo handlers were removed. See the resolution log; saved itineraries remain separate from logged stays.

### UX-02: Future stays use the wrong use-year balance

**Severity:** Major  
**Flow/screen:** Understand what a contract enables → Calendar → Booking As.

**Tried and observed:** My February-use-year contract showed **150 points available for February 2027–January 2028**. An **81-point March 2027 stay** nevertheless showed “Short by 81 pts,” using the depleted current-year balance.

**Owner impact:** The app tells owners to borrow, change contracts, or shorten an affordable stay.

**Recommended change:** Select the applicable use year from the stay dates, display it explicitly, and use that same year for feasibility and allocation. Handle stays crossing a use-year boundary explicitly.

**Code explaining the observation:** `getCurrentYearRow()` in [app.js](../app.js).

### UX-03: Fully Funded includes points that cannot fund the selected resort

**Severity:** Major  
**Flow/screen:** Compare saved options → Compare Itineraries.

**Tried and observed:** With **zero Saratoga points** and **100 Riviera resale points**, a **55-point Animal Kingdom stay** still displayed “Fully Funded — 45 pts left over.” This conflicts with the app's own contract restrictions.

**Owner impact:** A prominent success indicator encourages an infeasible plan.

**Recommended change:** Calculate funding from eligible contracts for each segment, date, and booking window. Show which contracts supply the points, rather than subtracting the trip total from the combined portfolio balance.

**Code explaining the observation:** `calcFeasibility()` in [itinerarycompare.html](../itinerarycompare.html).

### UX-04: The primary deadline warning overlooks holding points

**Severity:** Major  
**Flow/screen:** Know what needs attention → Home and My Contracts.

**Tried and observed:** A contract contained 10 holding points. Its detail showed the app's calculated **September 30 holding deadline**, alongside “All points accounted for this year.” Home and the account headline instead emphasized another contract's **November 30 expiration**.

**Owner impact:** The main dashboard can divert attention from the earlier action, while reassuring copy contradicts the detail below it.

**Recommended change:** Build the attention list from every relevant bucket and deadline. Show the affected point count, contract, required action, and date; reserve “all accounted for” for a genuinely resolved state.

**Code explaining the observation:** `evaluateContractDeadlineStatus()` and `computeEarliestDeadline()` in [home.js](../home.js), with related deadline rendering in [account.html](../account.html).

**Evidence boundary:** This finding concerns consistency with the app's own calculated holding deadline. The underlying DVC rule was not independently validated in this review.

### UX-05: New contracts begin with an unverified full balance

**Severity:** Major  
**Flow/screen:** Establish an accurate portfolio → Add Contract → Points ledger.

**Tried and observed:** Added a 150-point contract acquired in 2020. Without entering current balances, the app displayed **150 points available** and began producing deadline and planning guidance.

**Owner impact:** Annual entitlement is easily mistaken for spendable points. Existing owners may already have used, banked, or borrowed much of that allotment.

**Recommended change:** Add a balance-confirmation step after contract creation. Ask for the current use-year buckets and mark untouched years **Balance not confirmed** rather than presenting the annual allotment as verified availability.

### UX-06: Bank Now does not complete a banking-management task

**Severity:** Major  
**Flow/screen:** Home deadline alert → Bank Now → My Contracts.

**Tried and observed:** Followed Bank Now. It opened My Contracts, where I could manually edit buckets but found no guided banking action. Entering borrowed points also left the following year's displayed balance unchanged.

**Owner impact:** Owners must understand and maintain the accounting across years themselves. It is unclear whether they are recording a completed Disney action, planning one, or merely adjusting a number.

**Recommended change:** Provide explicit **Record Banking**, **Record Borrowing**, and **Adjust Balance** actions. Preview both affected years, explain that Disney execution is external, and record the completed movement once.

### UX-07: Ownership-value estimates disagree between screens

**Severity:** Major  
**Flow/screen:** Assess ownership → Home → Membership Value.

**Tried and observed:** With identical contracts and no logged stays, Home predicted payback in **November 2032**, while Membership Value showed **June 2032**. After logging a stay and changing the value assumption, Membership Value showed **November 2045**, while Home showed **August 2034**.

**Owner impact:** Owners cannot tell which financial summary represents their portfolio or whether their settings saved.

**Recommended change:** Use one calculation and one saved assumption set across both screens. Display the model's basis and distinguish recorded vacation value from projected future value.

**Relevant implementations:** Ownership-value calculations in [home.js](../home.js) and [trips.html](../trips.html).

### UX-08: Push notifications can look enabled without working delivery

**Severity:** Major  
**Flow/screen:** Manage reminders → Notification Settings.

**Tried and observed:** With browser permission granted, enabling push produced a message that the sending backend was not deployed. The setting nevertheless persisted as enabled with a pending subscription.

**Owner impact:** An owner returning later sees an enabled reminder channel and may rely on it for deadlines.

**Recommended change:** Display **Push unavailable** or **Setup incomplete** until delivery is operational. Do not represent pending setup as enabled protection. When browser permission is denied, give an inline explanation and recovery instructions.

**Code explaining the observation:** `enablePushNotifications()` and `saveNotificationSettings()` in [account.html](../account.html).

### UX-09: Standalone resort comparison loses the selected stay

**Severity:** Major  
**Flow/screen:** Home → Compare Resorts → Select This Resort → Calendar.

**Tried and observed:** Entered October 12–17 and selected Animal Kingdom's Value Studio. The calendar opened at **Copper Creek in September with no dates selected**. This was reproduced through Home's comparison shortcut.

**Owner impact:** The decision is discarded at the handoff, forcing the owner to reconstruct it and potentially price the wrong stay.

**Recommended change:** Always transfer resort, room, check-in, check-out, and relevant contract context. The transfer must work without a previously saved calendar state.

**Code explaining the observation:** The selection handler in [compare.html](../compare.html) and the session-state restoration block in [app.js](../app.js).

### UX-10: A failed ledger save still looks like a changed available balance

**Severity:** Moderate  
**Flow/screen:** Maintain balances → My Contracts ledger.

**Tried and observed:** Simulated a save failure while changing a balance from 10 to 30. The input continued showing 30 while storage remained 10; feedback was simply “Not saved.”

**Owner impact:** The owner must remember which displayed number is authoritative, and there is no clear retry or discard action.

**Recommended change:** Keep an explicit unsaved state with **Retry** and **Discard**. Distinguish the proposed value from the saved balance and prevent downstream guidance from treating the proposed value as confirmed.

**Evidence boundary:** The failure was injected into the synthetic persistence layer to exercise the actual UI error path; it was not an observed production outage.

### UX-11: Editing a saved itinerary creates another itinerary

**Severity:** Moderate  
**Flow/screen:** Saved Itineraries → Edit in Calendar → Save.

**Tried and observed:** Reopened “AKV Option,” saved it as “AKV Revised,” and ended with two records. Reopening also returned Booking As to Just Browsing.

**Owner impact:** Edit suggests updating an existing plan, while the actual behavior creates versions and loses contract context.

**Recommended change:** Preserve itinerary identity and contract context. Offer **Save Changes** and a separate **Save as Copy**. Make deletion and changes to any committed allocation explicit.

### UX-12: A utilization metric describes inferred usage as logged trips

**Severity:** Moderate  
**Flow/screen:** Assess ownership → Membership Value.

**Tried and observed:** Before logging any trips, the screen said **8% of allotted points were “logged as used on a trip.”** Ledger changes contributed to that figure.

**Owner impact:** Owners cannot distinguish documented vacation usage from balance adjustments or inferred consumption.

**Recommended change:** Separate **points associated with logged stays**, **other recorded movements**, and **unreconciled points**. Label each measure according to its actual evidence.

### UX-13: Navigation and dashboard summaries underserve the primary job

**Severity:** Moderate  
**Flow/screen:** Return to the app → Home and mobile menu.

**Tried and observed:** The menu places contract management after planning, itinerary comparison, and the buying guide. Home shows contract count and annual points, but not the available balance by use year; its three prominent shortcuts all lead to planning.

**Owner impact:** A returning owner must navigate into individual contracts to answer “What do I have available, and what should I do now?”

**Recommended change:** Lead with **Portfolio, Points, Attention Needed, and Ownership Value**. Show confirmed balances by use year, affected contracts, and direct management actions. Put planning beneath those summaries.

### UX-14: Contract entry requires excessive scrolling and late correction

**Severity:** Moderate  
**Flow/screen:** My Contracts → Add/Edit Contract.

**Tried and observed:** The large card preview and tall wizard pushed Back/Save controls below the visible mobile area. It was possible to proceed without points and encounter the required-field error only when saving. Entering valid points also auto-advanced the form on blur.

**Owner impact:** Controls move out of view, invalid input is caught after unnecessary work, and merely leaving a field changes the step unexpectedly.

**Recommended change:** Use a compact preview, persistent Back/Continue/Save controls, and validation within the current step. Advance only through an explicit action.

**Evidence boundary:** Completion was possible after scrolling; this was not a hard blocker.

## What works well

- Contract resort selection, use-year choices, and editable purchase details provide useful ownership context. Deactivation is reversible.
- Empty dashboards provide direct links to add a contract or log a stay.
- Contract and trip forms preserved entered data after simulated save failures. Trip logging caught missing dates, reversed dates, and missing cash value.
- Suggest a Stay's empty results offer useful recovery actions. Its handoff to Calendar preserved the suggested stay.
- Split stays produced understandable segment and combined totals.
- Booking milestones distinguish future from past events. Calendar-event content generation was verified, though import into an external calendar was not.
- Mobile comparison results use stacked cards without requiring a wide table.
- The buying wizard retained choices when returning to earlier steps.

## Limits and unresolved assumptions

- These observations concern the local build with synthetic records, not production authentication or database durability.
- Google sign-in, Stripe checkout, email delivery, and external calendar import remain unverified.
- Disney's current rules and the embedded rate/forecast data were not independently validated. Deadline and eligibility findings identify inconsistencies within the app itself.
- The Free membership card promises that upgrading unlocks contract management while the tested UI permits those actions. The intended production entitlement behavior needs confirmation.
- Temporary browser screenshots were captured during the review, but this document does not depend on their continued availability. Reproduction scenarios are recorded above.

## Five changes to make first

1. **Make ledger actions traceable and reversible:** persistent transactions, duplicate-application protection, and explicit banking/borrowing movements between years. Addresses UX-01 and UX-06, with recovery behavior from UX-10.
2. **Unify contract-aware feasibility:** use the stay's correct use year and only eligible points, consistently across Calendar, suggestions, and itinerary comparison. Addresses UX-02 and UX-03.
3. **Require balance confirmation during onboarding:** clearly separate annual entitlement, confirmed availability, and unknown balances. Addresses UX-05.
4. **Build a contract-first attention dashboard:** include every relevant deadline and point bucket, actionable management links, and truthful reminder-delivery status. Addresses UX-04, UX-08, and UX-13.
5. **Unify ownership-value calculations and labels:** apply saved assumptions everywhere and separate recorded results, inferred usage, and projections. Addresses UX-07 and UX-12.

## Working through the findings

Use the stable issue IDs when choosing the next fix. For each selected issue, reproduce it against the current code before making changes, implement the agreed scope, and verify the original scenario plus relevant failure/recovery behavior. Update its checklist entry and record the outcome below. Related IDs are context, not authorization to expand a selected fix automatically.

### Resolution log

### September 22, 2026 - UX-14 resolved locally

- Replaced the full-size wallet preview with a compact text summary. Only the active step is displayed; its fields scroll independently of the header, stepper, error, and footer. Back, Continue, Cancel, and Save remain visible on mobile.
- Removed resort/preset/blur auto-advancement and the shortcut that bypassed purchase details. Explicit Continue validates resort, selected use year, and positive whole points before advancing. Save also validates optional purchase price and acquisition year, returning focus to the field requiring correction. Editing retains step navigation and values.
- Save uses a busy guard and disabled controls to prevent duplicate taps; returned or thrown errors retain input for retry. Successful new saves still hand off to starting balances; editing updates the same record.
- Synthetic browser checks completed Add, failed save/retry, starting-balance handoff, Back with retained points, and editing 200 to 150 points without adding a record. Empty and fractional points were blocked on step 2; a preset and input blur stayed on step 2. At 390x844 and 360x640, controls remained visible and there was no horizontal overflow; details scroll at the smaller height. A physical-device soft keyboard was not tested.
- All 228 workspace tests pass, including three new contract-form validation tests. No migration required for UX-14; no real owner data or production writes were used. All original review issues are now checked off.


### September 22, 2026 - UX-13 resolved locally

- Moved My Membership (My Contracts and Membership Value) ahead of planning across all 11 navigation copies. Updated the shared navigation regression expectations while preserving destinations and each active-page highlight.
- Added compact current/next use-year cards for every active contract on Home, including actual cycle dates, all four point buckets in saved totals, and contract/year-specific links to My Contracts. Missing or unconfirmed rows invite adding a balance; zero stays zero. No annual allotment is substituted.
- Preserved concurrent additions for Available Now and the multi-contract Coming up list. Made dated entries directly actionable for their contract and cycle. Membership Value remains above planning, which now has its own secondary heading.
- Mobile synthetic checks at 390px verified 60 points from 20 banked + 30 borrowed + 10 holding, a zero next-year balance, a December contract whose current cycle is 2025, and an unknown next-year balance. Tapping the 2027 card opened the correct contract and 2027 ledger; the reordered menu and empty-state contract link navigated successfully. Populated and empty Home had no horizontal overflow.
- All 224 workspace tests pass, including three new balance-card tests and 23 navigation checks. Auth and membership were simulated locally; no real owner data, subscription, or Supabase writes were used. No new migration required. Concurrent changes outside UX-13 were preserved.


### September 22, 2026 - UX-12 resolved locally

- Membership Value previously labeled the badge coverage proxy as points logged on trips, even though that proxy included saved remaining, banked, and holding balances. Replaced the percentage with owned-contract points explicitly assigned to logged stays via `DVCTripFunding.loggedUsage()`. No ownership-duration or annual-allotment denominator is inferred.
- A compact expandable explanation separates outside points and records needing source review, links to the logged-stay list and My Contracts, and states that upcoming recorded bookings count while saved itineraries do not. Invalid or legacy attribution is excluded until corrected. Balances and movements cannot establish expired or unreconciled totals.
- Points Steward keeps its existing achievement calculation and thresholds, but its label and detail now disclose estimated coverage, possible overlap, and that it is neither logged usage nor proof that no points expired.
- Verified at a 390px mobile viewport using isolated synthetic data: no stays displays 0 points; a mixed 60-owned/40-outside stay plus a 100-outside stay and one legacy record displays 60 owned points, 140 outside points, and one record needing review. Changing ledger balances leaves the 60-point total unchanged. The explanation opens without horizontal overflow.
- All 179 workspace tests pass, including six new tests for empty, mixed, outside-only, invalid, historical/upcoming, and ledger-independent usage. No new migration or production data changes for UX-12. Migration 023 from UX-11 remains pending.

### September 22, 2026 - UX-11 resolved locally; migration 023 pending

- Confirmed both load paths discarded itinerary identity and the save handler always inserted. Saved Itineraries and Calendar's Load Trip picker now preserve the ID, name, and owning account. The Calendar shows Editing [name], Save Changes, and a separate Save as Copy. The edit form starts with the saved name; the copy form suggests a copy name.
- Save Changes targets the existing owner-filtered row. A missing/deleted record returns an error rather than silently creating a replacement. Save as Copy leaves the original untouched and switches the editor to the new copy after success. New/copy retries reuse a generated ID, preventing duplicate rows after an uncertain response. Duplicate taps are guarded, blank names are rejected, and errors retain the entered name and stay.
- Added optional Booking As persistence in migration 023. A valid active owned contract is restored by both load paths; unavailable/deleted/inactive contracts fall back to browsing. Existing itineraries without that field remain loadable. This is advisory planning context only, not a booked stay, committed allocation, or ledger mutation.
- Mobile verification at 390px: AKV Option → AKV Revised remained one record; Save as Copy created AKV Alternative while preserving AKV Revised; both load paths retained the chosen contract; a simulated update failure retained the typed name and record count. Seven new tests cover update/copy semantics, retry IDs, duplicate taps, owner isolation, blank names, and persistence filtering. All 173 workspace tests passed.
- Migration 023 has not been applied here. Browser verification used synthetic persistence; real Supabase writes and the new SQL trigger have not been runtime-tested. No production deployment was performed.

### September 22, 2026 - UX-10 resolved locally

- The original inline inputs were already replaced in UX-06. Removed their unused live-total/autosave listeners and helpers so that obsolete behavior cannot be reused accidentally.
- Balance sheets now show the last confirmed balance, proposed edits, and explicit Saved / Unsaved changes / Save not confirmed states. Unconfirmed entries use an attention color. Editing optional bucket details also updates the state. Guidance continues to use confirmed data; entering a proposal never updates the underlying balance cache.
- Failed saves retain inputs and expose Retry save and Discard edits. Network errors are described as an unconfirmed save, since a lost response does not prove the server rejected the write. Discard reloads stored balances and does not undo completed saves.
- Successful partial saves update the confirmed baseline immediately. Editing that year again correctly shows unsaved changes against the new amount. Retry skips unchanged confirmed years and skipped entries; an unconfirmed request remains eligible for retry even if the owner changes the proposal back to its prior amount.
- Mobile verification at 360px: failed 10 → 30 edit kept both storage and the ledger headline at 10; discard restored the saved view; retry saved 30. In a partial two-year save, 2026 saved 40 while 2027 remained 10; editing 2026 again to 45 showed 40 as confirmed, and discarding preserved 40/10. Five new regression tests cover these cases, unchanged entries, and uncertain responses. All 166 workspace tests passed.
- No new migration is needed. Testing used isolated synthetic owner data; real Supabase outages and persistence were not exercised.

### September 22, 2026 - UX-09 resolved locally

- Added `docs/mobile_push_todo.md` at the owner's request before starting this fix. This tracks actual mobile push delivery separately from UX-08's status correction.
- Root cause: Compare stored only resort/room and a return flag. Calendar consumed that choice only inside restoration of a previous Calendar snapshot, so standalone comparisons lost the entire selection. Compare now passes the selected resort, room, check-in, and check-out in an explicit URL; Calendar validates them and opens the selected check-in month. No prior Calendar visit is required.
- Latest comparison dates override older round-trip dates. Standalone selections ignore stale split-stay state. Split comparison links identify completed versus current segments; replacing a completed segment updates only that segment. Changes that would break split-date continuity are rejected with an inline explanation. Reload retains available split context.
- Verified on mobile: fresh comparison with no saved Calendar state, Animal Kingdom Value Studio October 12–17 → correct 5-night/53-point Calendar stay; browser Back preserves comparison dates; revised November dates survive a round trip; changing an earlier split segment preserves the current segment and survives reload.
- All 97 tests pass. New tests cover exact standalone handoff, stale state, revised dates, split isolation/continuity, cross-year chart requirements, invalid dates, and missing rooms. No migration or owner-data write is needed. Comparison-page custom cash overrides are not carried to Calendar by this change.

### September 22, 2026 - UX-08 resolved locally

- Confirmed the build had an empty push key and no push-sending function. The old enable path could store `{pending:true}` and `push_enabled:true` after requesting browser permission. Replaced that control with a compact Unavailable status and directions to in-app/email options; no permission request or subscription registration is made by Notification Settings.
- Legacy enabled profiles also show Unavailable, with an explanation of the old setting. The settings bell no longer counts that flag as an active reminder channel. Explicitly saving preferences clears `push_enabled` and `push_subscription`; simply viewing or closing the sheet does not mutate the profile. Existing browser permission is left alone.
- Denied browser permission adds inline site-settings guidance, without implying that granting it would make push operational today. Browsers without the Notification API can open and save the same settings safely.
- Profile-save failures retain choices and restore controls for retry. Concurrent taps are guarded; controls cannot change mid-save. Invalid email lead times are rejected rather than silently replaced. In-app and email toggles have accessible names.
- Verified at a 360px mobile viewport with synthetic legacy-enabled data and denied permission: unavailable state, inactive bell when other channels were off, failed save, successful retry, correct channel preservation, stale flag cleanup, and reopening. All 90 tests pass. No migration is required. Real delivery and Supabase writes were not exercised; this fixes status accuracy rather than deploying push delivery.

### September 22, 2026 - UX-07 resolved locally

- Root cause: Home used a copied model with a hard-coded $35 baseline and an older projection loop. Membership Value used saved assumptions (default $26) and a calendar-year cost/value series through deed expiry. Extracted Membership Value's model into `dvc-owner-value.js`; both screens now call it with the same saved settings and owned-contract trip attribution.
- Both screens state the logged stay value, future value baseline, value growth, and dues growth. The baseline affects the projection, not the owner-funded value of logged stays. Home links directly to the expanded Model Assumptions panel. Missing purchase details remain estimates and are labeled as such; this change does not certify the model's other economic assumptions.
- Corrected month interpolation to use the crossover calendar year and incremental value net of that year's costs. The estimate no longer shifts merely because the page is opened in a different month. Percentage display cannot round up to 100% while a cost gap remains.
- Assumption writes are serialized to prevent a slow older save overwriting a newer choice. Pending and failed saves are labeled previews, including beside the headline estimate; failure offers Retry save. Home uses the last successfully saved assumptions.
- Synthetic mobile verification: with no stays, both screens predicted January 2038 at $21/point for the test portfolio. A $4,000 stay funded 75% by owned points contributed exactly $3,000 on both screens. At $35/point both predicted November 2034; at $15/point both predicted November 2045. Logged value stayed $3,000. Failed-save and retry behavior verified. Inspected layouts at 390px and 360px; the populated Membership Value page still reports a 380px layout extent at the narrower viewport, outside this calculation fix.
- All 85 automated tests pass, including shared-model wiring, saved assumptions, date interpolation, rounding, empty/inactive portfolios, owned attribution, serialized saves, and failed-save retry. No new migration is needed. Real Supabase persistence was not exercised; browser tests used isolated synthetic owner data.

### September 22, 2026 - UX-06 resolved locally; migration 022 applied by owner

- Replaced direct auto-saving bucket inputs with a compact balance breakdown and three explicit actions: Record banking, Record borrowing, and Adjust balance. Movement sheets show actual use-year dates, total points before/after, and the affected current/banked/borrowed bucket. Save and Cancel remain accessible on mobile.
- Banking subtracts current points from the selected year and adds banked points to the next year. Borrowing subtracts next-year current points and adds borrowed points to the selected year. Existing banked, borrowed, and holding points cannot move again. Missing balances open the balance-entry sheet; there is no assumed annual allotment.
- Copy explains that these record actions already completed with Disney. Owners should start from balances before the move; balances already reflecting it should be left alone or corrected with Adjust balance. No online banking/borrowing is executed and no current-date deadline gate prevents recording an earlier real action.
- Adjust balance reuses the mobile total-and-optional-details sheet for the selected year only, with an explicit before/after total preview. It changes no other year. Cancel leaves balances unchanged.
- Migration 022 adds an authenticated database operation that checks contract ownership, locks the two year rows, rejects stale previews, updates both balances in one transaction, and saves a durable receipt. The client keeps the same owner-scoped session retry reference after an uncertain response, including reopening the sheet in the same tab. It disables repeat taps during a save. Retrying a committed request returns its original receipt.
- Verification: **76 automated tests passed**, including movement direction, conservation, bucket restrictions, unknown balances, invalid amounts, lost-response retry, double-tap prevention, storage failure, and stale-preview rejection. Synthetic mobile checks at 390px/360px exercised banking, borrowing, adjustment, cancellation, overdraw, missing-year setup, and a committed-save/lost-response retry. No horizontal overflow at 360px.
- The owner confirmed running migration 022 in Supabase. Production RPC execution and real persistence remain unverified; the local browser used a synthetic atomic-save fixture. No new database changes were made after that confirmation. The table provides receipts, but a visible transaction history and dedicated undo action are outside this change.


### September 22, 2026 - UX-05 resolved locally; migration pending

- Added a two-year balance sheet immediately after contract creation and an Add points left action for unknown ledger years. Inputs use actual use-year date ranges, accept zero, support skipping, and offer an explicit full-allotment shortcut. No extra confirmation step is required.
- Optional bucket details split the entered total; they cannot exceed it. A 200-point contract with 0 current and 100 next-year points stores exactly those amounts and does not recreate spent borrowed points. Existing recorded balances remain trusted.
- Missing balances no longer inherit annual entitlement or create false all-clear/funding claims. Updated Home/account attention, Calendar, itinerary comparison, and point-efficiency calculations. Explicit ledger edits record the owner-entry timestamp.
- Save errors retain entries. When one year saves and the next fails, the sheet identifies the saved year and retries only unchanged unsaved entries. Skipping a previously saved year leaves it intact.
- Verified with 67 passing tests and synthetic mobile interactions, including zero/skip, new-contract handoff, full allotment, optional breakdowns, validation, and partial-save retry. Migration 020 is prepared but not applied to Supabase; see the handoff above.

### September 22, 2026 - UX-04 resolved locally

- Home and My Contracts now share point-attention calculations. Current points needing banking and banked/borrowed/holding points needing use are separate actions, ordered by actual date across contracts. An open banking window no longer automatically outranks an earlier expiry. Notification Center includes secondary actions on the lead contract as well.
- Corrected the rule behind the original observation: holding points expire at the end of the use year, not 60 days after entering holding. The 60-day restriction concerns the advance booking window. Source: [Disney's holding-points explanation](https://plandisney.disney.go.com/question/holding-points-work-expire-bank-501019/). The earlier review's derived holding deadline and old migration/documentation descriptions of an entry-date clock should not be treated as a valid rule.
- Home, account banners, and ledger warnings show the affected contract, amount, bucket, and date. Holding entry date is optional history; no date is needed to calculate expiry. Calendar holding copy and the shared ledger helper use the corrected rule. Banking reminders no longer imply borrowing has the same cutoff.
- All-clear requires every current-cycle bucket to be empty. Review points on Home opens the affected contract. Successful balance saves refresh warnings without a reload; failed saves retain the saved balance's warning.
- Verification: nine new attention tests plus corrected holding-rule tests. Mobile checks at 390px and 360px confirmed September 30 holding expiry outranks later banking, correct contract navigation, no false all-clear, failed-save recovery, immediate warning refresh, and banked-only warnings. All 59 tests passed. Testing used isolated synthetic owner data.
- No database migration is needed; existing holding dates and balances remain stored. Schema comments were corrected for future installs.


### September 21, 2026 - UX-03 resolved locally

- Replaced the combined portfolio pool with an allocation across eligible contract/use-year balances and individual stay nights. Resort restrictions use the existing per-contract access rules. Shared balances are consumed only once across split-stay segments; flexible allocations can be reassigned so restricted segments are not stranded by ordering.
- Replaced Fully Funded with Points covered, Window not open, Estimated funding, Needs points, Contract restricted, or a review state as applicable. A closed 7/11-month window cannot produce the same success indicator as funding available in an open window. Missing chart data and past stays fail closed rather than implying zero-cost funding.
- View point sources identifies the supplying contracts, points, use years, segment numbers, and pending booking dates. Ineligible contracts are named. Each compared itinerary is assessed independently.
- Counts recorded remaining, banked, and borrowed points. Does not assume new borrowing against an untouched annual ceiling. Holding balances require separate review and are excluded from the allocation; if they could affect a shortage, the result says Review holding points. Missing ledger rows are labeled estimates. These are funding previews, not reservation or availability confirmations.
- Verification: ten new tests cover the original 55-point AKV restriction example, restricted-only ownership, shared-balance reuse, allocation ordering, closed windows, cross-use-year nights, estimated/missing data, holding, recorded banked/borrowed points, and month-end window dates. All 50 tests passed. Synthetic mobile checks at 390px and 360px verified side-by-side restricted/eligible results, source explanations, selection changes, correction after an eligible balance update, and no horizontal overflow.
- No production owner data changed and no database migration is required.


### September 21, 2026 - UX-02 resolved locally

- Calendar funding now selects the ledger cycle from the stay date for each contract, including Booking As, Smart Draw, multi-contract allocations, and the swap preview. With no stay date, it uses today's cycle.
- Displays the applicable cycle and distinguishes recorded balances from estimated annual allotments when no ledger row exists. Banking reminders reference that cycle's deadline.
- Manual draws and multi-contract allocations reset when dates, contracts, or balances change, even if the stay's total point cost is unchanged.
- A single-contract stay crossing a use-year boundary is assessed by its actual nights in each year; checkout is excluded. Each year's shortage or remainder is shown independently. Multi-contract boundary-crossing stays explicitly require individual contract/date-range review; a combined allocation is not offered for that case.
- Verification: six new regression tests cover the original 81-point/150-point example, February and December use years, untouched years, boundary nights, stale overrides, and differing contract cycles. Mobile browser checks confirmed a real 78-point March 2027 stay leaves 72 of 150 points, contract-specific split balances, and a Jan 31-Feb 2 stay exposes the depleted earlier year. Planning left balances unchanged.
- No database migration is required. This fixes the Calendar finding; itinerary-comparison eligibility remains tracked separately under UX-03.


### September 21, 2026 - Logged-stay funding and native number fields

- Replaced the purple number panels with neutral rounded cards, prominent editable values, currency/point units, and mobile-sized controls.
- Replaced the optional contract selector with required point-source attribution. A stay can use one or several owned contracts plus Disney one-time, transferred/rented, or other outside points. The sources must exactly match total points used. Inactive contracts remain available for historical stays.
- Membership value credits the owned share of the whole stay's cash value. Example: 60 owned points plus 40 outside points on a $2,000 stay credits $1,200. All-outside stays remain in history with zero ownership credit. Trip cards show the contribution from each contract.
- Older/unconfirmed records are preserved but excluded from credited value until the owner reviews and saves their point sources. The value screen and Home explain this exclusion. Legacy contract selections are suggestions for review, not automatic confirmation.
- Home, Membership Value, and financial badge calculations share the attribution helper. Calendar multi-contract previews now prefill structured allocations for review as well as notes. Itineraries remain separate; logging never changes point balances.
- Confirmed funding and cash values are no longer silently dropped on a failed database compatibility retry. Migration `019_validate_trip_funding.sql` adds server-side ownership, whole-point, duplicate-source, and exact-total validation; it has not been applied to Supabase or executed against PostgreSQL in this session. The client uses the existing JSON column from migration 012.
- Verification: 34 Node tests passed. Synthetic mobile browser checks at 390px and 360px covered mixed funding, multiple contracts, exact-total errors, failed-save retry, persisted editing, legacy review, automatic single-contract allocation, cancellation, outside-only stays with no contracts, Home value, badge rendering, and horizontal overflow. Contract balances remained unchanged. Production authentication and database persistence remain unverified.

### September 21, 2026 — UX-01 resolved locally

- Replaced **Apply to Trip** and **Apply Split** with **Log This Trip →**.
- Removed all calendar ledger writes and their temporary Undo state. Allocation controls remain planning previews, with projected-balance copy.
- The new action opens Membership Value's existing **Log a Trip** modal with resort, room, dates, points, cash value, and the selected contract prefilled. The user must explicitly save.
- Multi-contract previews leave the single-contract field unselected and include the proposed split in editable notes. No new reservation model or itinerary-to-trip conversion was introduced.
- The draft is scoped to the originating owner, consumed once after sign-in/form rendering, and discarded when malformed or associated with another owner. Cancelling or refreshing does not create a trip.
- Verification: all 23 tests passed (`node --test tests/calendar-trip-handoff.test.js tests/dvc-ledger.test.js`), including eight new handoff regression tests. A local mobile browser check with synthetic persistence verified prefill, cancel, return to the selected calendar dates, multi-contract notes, failed-save retry, explicit save, and no automatic form reopening on reload. Contract balances remained unchanged throughout.
- Production Google sign-in and Supabase persistence were not exercised. No database migration is required for this fix.
