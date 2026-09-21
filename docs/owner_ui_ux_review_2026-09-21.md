# DVC Companion: Owner UI/UX Review

Review date: September 21, 2026  
Status: Review complete. UX-01 resolved locally on September 21, 2026; remaining findings open. See the resolution log for the agreed change and verification.

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
- [ ] UX-02 — Use the stay's applicable use-year balance.
- [ ] UX-03 — Restrict funding calculations to eligible contracts and points.
- [ ] UX-04 — Include holding points in deadline prioritization.
- [ ] UX-05 — Confirm balances when adding existing contracts.
- [ ] UX-06 — Provide explicit banking, borrowing, and adjustment flows.
- [ ] UX-07 — Unify ownership-value calculations and assumptions.
- [ ] UX-08 — Represent push-notification readiness truthfully.
- [ ] UX-09 — Preserve the stay when leaving standalone resort comparison.
- [ ] UX-10 — Make failed ledger saves recoverable and unambiguous.
- [ ] UX-11 — Distinguish editing an itinerary from saving a copy.
- [ ] UX-12 — Separate logged usage from inferred consumption.
- [ ] UX-13 — Prioritize ownership management in navigation and Home.
- [ ] UX-14 — Improve mobile contract-form navigation and validation.

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

### September 21, 2026 — UX-01 resolved locally

- Replaced **Apply to Trip** and **Apply Split** with **Log This Trip →**.
- Removed all calendar ledger writes and their temporary Undo state. Allocation controls remain planning previews, with projected-balance copy.
- The new action opens Membership Value's existing **Log a Trip** modal with resort, room, dates, points, cash value, and the selected contract prefilled. The user must explicitly save.
- Multi-contract previews leave the single-contract field unselected and include the proposed split in editable notes. No new reservation model or itinerary-to-trip conversion was introduced.
- The draft is scoped to the originating owner, consumed once after sign-in/form rendering, and discarded when malformed or associated with another owner. Cancelling or refreshing does not create a trip.
- Verification: all 23 tests passed (`node --test tests/calendar-trip-handoff.test.js tests/dvc-ledger.test.js`), including eight new handoff regression tests. A local mobile browser check with synthetic persistence verified prefill, cancel, return to the selected calendar dates, multi-contract notes, failed-save retry, explicit save, and no automatic form reopening on reload. Contract balances remained unchanged throughout.
- Production Google sign-in and Supabase persistence were not exercised. No database migration is required for this fix.
