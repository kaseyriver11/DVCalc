# DVC Companion: second owner UI/UX review

Reviewed September 22, 2026 against the current local workspace, including changes made outside the original 14 fixes. This is a fresh review, not a reopening of the historical checklist. **No app code was changed during this review.**

## Assessment

Contract management is substantially easier now. Home exposes real cycle balances, missing balances are explicit, contract entry has persistent controls, and correction/save failures have useful recovery paths. The largest remaining risks concern data trust: the newer booking deductions are not yet a complete, recoverable workflow, and some unrelated edits or load failures change what an owner believes about their portfolio.

Ten findings: five major, four moderate, one minor. No blocker was observed in the tested local flows. That does not establish production readiness.

## Method and scope

- Chrome at 390×844, with selected checks at 360×640. Used an isolated browser tab and synthetic owner/contract/ledger/trip/itinerary data. No real owner records were changed.
- Seeded February and December contracts, current/next cycles, zero and unknown balances, banked/holding points, and future bookings. Exercised delays and failures in synthetic persistence.
- Real page rendering, validation, navigation, calculations, and event handlers ran. Authentication and database operations were substituted. Successful point-movement writes were simulated using the existing movement preview; this does not test the database transaction itself.
- Inspected code to explain observed behavior. The repository's 230 automated tests passed at the final check; those tests do not cover all of the interaction problems below.
- Real Google/email sign-in, subscription checkout, Supabase/RLS/migration behavior, email delivery, installed-PWA behavior, physical-device keyboard handling, and screen-reader use were not verified. Push remains explicitly unavailable. Buying-guide and achievement screens were not exhaustively retested; they are secondary to the owner-management flows prioritized here.

## Flows tested, in product priority order

| Owner task | Path and result |
| --- | --- |
| See points and act on deadlines | Home → per-contract current/next cards → My Contracts. Cycle-specific links work. Checked mixed buckets, confirmed zero, unknown next year, multiple contracts, and a 360px Home layout. |
| Add and maintain a contract | My Contracts → Add → resort search → points/use year → details → save → starting balances. Missing resort and no-result search worked. Saved zero while leaving next year unknown. Edited an existing nickname and discovered an acquisition-date mutation. |
| Record banking/borrowing | My Contracts → Record banking/borrowing → preview → synthetic save. Overdraw rejected; before/after values clearly identify both years. Banking 20 and borrowing 10 produced the expected synthetic bucket changes. |
| Correct balances | My Contracts → Adjust balance → change total → failed save → Discard edits. The failed proposal remained distinct from the confirmed amount and recovery controls were present. |
| Record/correct a booked stay | Membership Value → Log a Trip → dates/points/sources → save → edit/delete. Tested future dates, a use-year boundary, default deduction, correction, deletion, and rapid repeated Save with a delayed response. Significant findings below. |
| Assess ownership value | Home and Membership Value with no stays and future recorded stays. Shared figures agree, but future-booking value still needs clearer separation from delivered value. |
| Manage reminders | My Contracts → Notification Settings → invalid lead time → correct → save. Error is actionable; valid save closes. Email, in-app, and unavailable push are differentiated. Delivery itself was not tested. |
| Explore what points can cover | Compare Resorts → choose December dates/AKV Value Studio → Calendar. Exact room and dates survive. Suggest a Stay completed with a 40-point budget and returned feasible options. |
| Save and assess possibilities | Calendar → Save Itinerary → Saved Itineraries → edit in Calendar → failed update → retry. Name and record identity survive; one record is updated. Compared two synthetic options: point coverage and high availability risk are presented separately, with a clear non-reservation caveat. |

## Findings, ordered by effect on owner tasks

### UX2-01 — Repeated Save creates duplicate booking records

**Severity: Major. Flow/screen:** Record a booking → Log a Trip → Save Trip.

**Tried and observed:** Delayed the synthetic add response by 1.6 seconds. Save Trip remained enabled, retained its normal label, and the form stayed open. Tapping it twice created two 40-point stays for the same December 1–3 dates. The balance went from 80 to 40, while the stay list and value model counted two bookings.

**Owner impact:** A normal retry tap on a slow connection can duplicate recorded value and make logged usage disagree with balances.

**Recommended change:** Disable Save and show Saving immediately. Give a new booking a persistent retry identity. Make the booking and its optional deduction one recoverable operation with a durable receipt, so repeated requests cannot create additional records or deductions.

**Code explanation:** `trips.html` → `saveTripForm()` has no in-flight guard and inserts before separately writing balances. Unlike the updated contract form, it does not disable its controls while awaiting the response.

### UX2-02 — Booking edits/deletion silently leave the original deduction behind

**Severity: Major. Flow/screen:** Membership Value → edit/delete a logged booking.

**Tried and observed:** Saved a 50-point stay with deduction selected: 130 available became 80. Edited the booking to 60 points, fully reassigned its funding, and saved: the booking became 60 but the balance remained 80. The edit form hid the deduction section and gave no balance-correction guidance. Deleting the booking asked only “Delete this trip?” and left the balance at 80.

**Owner impact:** Owners cannot tell whether correcting or removing a booking also corrects its points. A booking can disappear while its deduction remains, with no visible link explaining the difference.

**Recommended change:** Store and expose the original deduction receipt. On changes, show the previously recorded and proposed funding and offer an explicit reconciliation action. Distinguish removing an app record from canceling a Disney stay; do not blindly refund points, since the actual returned amount/bucket may differ. At minimum, disclose unchanged balances and link directly to the affected cycle's correction flow.

**Code explanation:** `updateBalanceDeduction()` hides the section during editing; `applyBalanceDeduction()` skips edits. The delete handler removes the trip without a corresponding balance explanation or reconciliation step.

### UX2-03 — A boundary-spanning stay deducts everything from one use year

**Severity: Major. Flow/screen:** Log a Trip → point sources → balance deduction preview/save.

**Tried and observed:** Entered January 31–February 2, 2027 and attributed 50 points to a February contract. Both its 2026 and 2027 balances existed. The preview and save took all 50 from the 2026 cycle; the 2027 cycle was untouched. There was no request to distribute points across cycles.

**Owner impact:** The app presents a precise balance update even though the recorded stay spans two of the contract's use-year periods. This can misstate the points available for subsequent stays.

**Recommended change:** Attribute the deduction by contract and use year, using the stay's nights and allowing the owner to correct the amounts. Until supported, flag the boundary and disable automatic deduction for that booking, offering explicit balance correction instead.

**Code explanation:** `dvc-trip-deduct.js` → `planTripDeduction()` selects a single cycle from `checkIn`; it does not receive checkout or per-night/cycle allocations. This is separate from the Calendar's improved cross-cycle planning logic.

### UX2-04 — A nickname-only edit changes the stored acquisition date

**Severity: Major. Flow/screen:** My Contracts → Edit Contract → Details → Save Changes.

**Tried and observed:** Seeded an acquisition date of June 15, 2020. The edit form displayed only 2020. Changed the nickname and saved; the stored acquisition date became January 1, 2020.

**Owner impact:** Editing one field silently changes another fact. The owner has no way in this form to preserve or restore the original month/day. Date-sensitive eligibility consequences are possible, although a specific eligibility change was not reproduced here.

**Recommended change:** Preserve the original full date whenever acquisition year was not changed. If year-only entry is intentional, store its precision explicitly instead of silently replacing a known date. Offer an optional exact-date control when precision matters.

**Code explanation:** `account.html` → `saveForm()` always rebuilds `purchase_date` through `acquisitionYearToPurchaseDate()`.

### UX2-05 — Failed contract loads can masquerade as an empty portfolio

**Severity: Major. Flow/screen:** Return to Home → contracts and attention summaries.

**Tried and observed:** Simulated the empty-array result returned by the current contract-read error path while synthetic contracts still existed. Home showed “No contracts added yet” and “Add your first contract”; the deadline banner disappeared. No load error or Retry appeared.

**Owner impact:** A transient read failure looks like lost contracts or an account with no history. It also removes attention guidance without explaining that the underlying data was unavailable.

**Recommended change:** Keep successful empty results distinct from failed reads. Show “Couldn't load your contracts” and Retry, retain clearly labeled last-loaded data where appropriate, and never interpret a failed load as a reason to start onboarding.

**Evidence boundary:** The UI response was tested with synthetic failure output. Code inspection confirms `auth.js` → `getContracts()` logs a Supabase error and returns `[]`. A live Supabase outage was not induced.

### UX2-06 — Future booked value is presented alongside delivered value

**Severity: Moderate. Flow/screen:** Log a future booking → Membership Value/Home.

**Tried and observed:** Future December and January stays appeared under “Past Stays,” with “toward House Money” credit. Two future $1,000 records made Home show $2,000 logged value and 3% payback before either stay occurred. The page introduction describes what membership has “actually delivered.”

**Owner impact:** Recorded bookings, completed vacations, and projections are not consistently distinguished. Counting upcoming points is explicitly explained and can be useful; describing their cash value as already delivered is the confusing part.

**Recommended change:** Separate Upcoming Bookings and Completed Stays. Show booked value as committed/estimated value and completed-stay value as delivered value, with an explicit choice about which feeds payback. Keep future bookings in the correctly labeled logged-points count. The “past 12 months” calculation already excludes future stays and should retain that behavior.

### UX2-07 — Recording a booking is hard to discover

**Severity: Moderate. Flow/screen:** Home/menu → Membership Value → Log a Trip.

**Tried and observed:** With two contracts, the Log a Trip button was about 2,210px down Membership Value at a 390×844 viewport, after payback, the chart, Exit Equity, and ownership-cost cards. Navigation offers Membership Value but no direct booked-stay destination. A Calendar handoff provides another route, but an owner who already booked need not plan it again.

**Owner impact:** A frequent management task is buried under financial analysis and labeled as a historical-trip action, particularly awkward for a new upcoming booking.

**Recommended change:** Put Record a Booking and View Booked Stays on Home or in My Membership. Provide a top-of-page action on the stay list. Keep itinerary planning a separate path.

### UX2-08 — Resort comparison starts with dates in the past

**Severity: Moderate. Flow/screen:** Fresh Compare Resorts visit.

**Tried and observed:** On September 22, 2026, comparison opened with March 15–20, 2026 and immediately ranked results. Changed to December 1–3 and successfully carried that selection to Calendar.

**Owner impact:** A returning owner initially evaluates irrelevant dates. The formatted date summary omits the year, making stale defaults less obvious.

**Recommended change:** Start with an intentional upcoming date range or request dates before showing results. Preserve a valid owner selection, and explicitly identify historical comparisons when the user chooses them.

**Code explanation:** `compare.html` has fixed March 2026 default dates.

### UX2-09 — The brand returns to different destinations

**Severity: Minor. Flow/screen:** Saved Itineraries → tap DVC Companion brand.

**Tried and observed:** Tapping the brand opened Calendar, not Home. Home's brand links to Home. Code inspection shows the other ten navigation-bearing pages point their brand at Calendar.

**Owner impact:** The expected return-to-dashboard action is inconsistent and takes owners back into planning.

**Recommended change:** Make the brand consistently open Home; retain Calendar as the explicit planning destination.

### UX2-10 — “Rental Savings” does not explain what is being compared

**Severity: Moderate. Flow/screen:** Compare Resorts → Financials & Points → result card.

**Tried and observed:** Hilton Head, December 1–3, showed $266 cash, 12 points, a $20/point rental rate, and $130 “Rental Savings” (54%). Renting 12 points costs $240, which is $26 below the displayed cash price. The $130 actually compares renting against the selected owner's dues-based cost, confirmed in the calculation.

**Owner impact:** Adjacent “Rental Savings” and “Owner Savings” labels imply two alternatives compared with cash, but use different baselines. The number is interpretable only after understanding the hidden distinction.

**Recommended change:** Label the baselines directly: “Using my points vs renting” and “Using my points vs Disney cash.” Show the compared costs or an accessible explanation beside each metric.

## What works well

- Current/next-year cards make a mixed-use-year portfolio understandable without substituting annual entitlement for available points.
- Banking and borrowing previews explain both affected years and distinguish recording a Disney action from performing one.
- Balance save failures retain inputs and offer Retry/Discard with confirmed-versus-proposed amounts.
- Add Contract now has explicit progression, searchable resorts, visible controls, and a useful starting-balance handoff.
- Saved itineraries retain identity during edits and offer intentional copying; failed updates preserve the name and plan.
- Compare-to-Calendar preserves selected dates and room. Itinerary comparison distinguishes point coverage from room availability and assesses alternatives separately.
- Push availability is truthful, and invalid reminder lead times are corrected within the settings flow.

## Five changes to make first

1. **Make booking saves idempotent and visibly pending**, including the optional balance operation (UX2-01).
2. **Add explicit booking-edit/delete reconciliation** using a saved deduction receipt (UX2-02).
3. **Prevent incorrect deductions across use-year boundaries** (UX2-03).
4. **Preserve known acquisition dates during unrelated edits** (UX2-04).
5. **Show recoverable data-load failures instead of empty portfolios** (UX2-05).

## Checklist

All ten were confirmed in code and fixed on September 22, 2026 (Claude Code). **UX2-01/02/03 need [migration 024](../db/migrations/024_trip_bookings.sql) run in Supabase before booking saves work.**

- [x] UX2-01 — Duplicate booking saves. Save is disabled and reads "Saving…" while in flight, and the booking plus its deduction is one `save_trip_booking` call keyed by an id generated when the form opens — a retry returns the first save. Verified: three taps during a 1.5 s delayed save made one call and one booking.
- [x] UX2-02 — Booking correction/removal and balance reconciliation. Each deduction is stored as a receipt (`trip_deductions`, bucket by bucket). Editing shows what was already taken and, by default, puts it back and takes the new amounts in the same transaction. Deleting asks what happened: canceled with Disney (DVC's timing rule — 31+ days back to their use years, 1–30 days to Holding, check-in day forfeited), logged by mistake (restored exactly), or leave balances alone. Bookings saved before receipts existed say balances won't change and point to Adjust balance.
- [x] UX2-03 — Cross-use-year booking deductions. Each contract's points are split across the use years its nights fall in, by chart points per night (`splitByUseYear()`), with editable per-year amounts that must still sum to the contract's share.
- [x] UX2-04 — Acquisition-date preservation. An edit keeps the stored full date unless the year itself changes.
- [x] UX2-05 — Failed reads versus empty portfolios. `auth.js` records failed reads (`readFailed()`); Home, My Contracts, and Membership Value show "Couldn't load… Nothing has been lost" with Retry instead of onboarding or an empty history.
- [x] UX2-06 — Upcoming versus delivered stay value. Upcoming bookings still count toward House Money immediately (owner's explicit decision), but are listed under Upcoming as "booked value," separate from Completed stays; page and Home copy say "booked" rather than "delivered."
- [x] UX2-07 — Direct access to recorded bookings. "+ Record a Booking" at the top of Membership Value and on Home's Membership Value card (`trips.html#record-booking` opens the form).
- [x] UX2-08 — Relevant comparison default dates. Defaults to 5 nights starting 30 days out; the date summary now includes the year.
- [x] UX2-09 — Consistent brand destination. The brand opens Home on every page, and the installed app starts on Home (`manifest.json` `start_url`).
- [x] UX2-10 — Explicit savings comparison baselines. "My points vs renting" / "My points vs Disney cash," with the compared costs under each figure on the mobile cards.

**Still to check against the real database** (saved for later, 2026-09-23): the owner verified the record + delete-as-mistake round trip on September 22. Not yet exercised for real: (1) editing a booking that took points — the balance should move only by the difference; (2) a stay crossing the contract's use-year start date — the preview should show the split between the two use years.

Also fixed while verifying: `compare.html` threw on every load wiring a `#back-link` that no longer exists. Follow-up from the owner: Home is getting cluttered — see [`home_redesign_todo.md`](home_redesign_todo.md).
