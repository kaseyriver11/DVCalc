# DVC owner problems and product roadmap

Researched September 23, 2026. DVC Companion is a **contract manager first**. This roadmap ranks work by the consequence of a wrong answer, the frequency of the owner decision, and fit with that product direction. It is **not** a statistically measured ranking of all DVC owners. Disney's published rules establish what owners must manage; [owner discussions about spreadsheets and pooled contracts](https://www.disboards.com/threads/dvc-point-tracker-spreadsheet.3936139/) and [confusing use years](https://forums.dvcfan.com/forums/buying-selling-dvc/46c86888-4d22-4f00-8d38-f9f141e783aa?page=1) are qualitative examples, not survey data.

Support assessments below come from the current repository, including `account.html`, `home.js`, `bookings.html`, `trips.html`, `auth.js`, `dvc-plan-funding.js`, `dvc-point-moves.js`, `dvc-point-attention.js`, the notification Edge Function, and the database schema. They do not prove real Disney data access, production email delivery, or real Supabase persistence in this pass.

## Ranked owner jobs and current support

| Rank | Owner problem | Why it matters | Current support | Gap |
| --- | --- | --- | --- | --- |
| 1 | Know exactly which points remain, in which contract/use year/bucket, and whether the app matches Disney | Banking, borrowing, bookings and cancellations change different buckets. Owners with multiple contracts report using spreadsheets to track this. [Disney's rules](https://disneyvacationclub.disney.go.com/media/dvc/languagespecific/eng/member/vacationplanning/rulesandregulations/Home_Resort_Rules_and_Regulations_Aug_2021.pdf) distinguish the operations. | **Partial.** My Contracts records confirmed current/next balances, buckets, banking/borrowing moves and corrections; bookings can create/reconcile deduction receipts. | Balances are manually maintained snapshots. There is no explicit last-verified-against-Disney date, owner-facing movement history or guided discrepancy reconciliation. No Disney account sync/import is implemented. |
| 2 | Avoid losing or stranding points | Banking closes before use-year expiration; banked points cannot be banked again; Holding points have tighter booking rules. [Disney's 2025 terms](https://cdn1.parksmedia.wdprapps.disney.com/media/dvc/DVC-Terms-and-Conditions-2025-5-15-25.pdf) distinguish these dates and restrictions. | **Partial, with a correctness issue.** Home/My Contracts show banking/use-by/holding attention; in-app banners and opt-in email banking reminders exist; short-notice stay ideas exist. Push is documented as unavailable. | Email text wrongly calls the banking cutoff a “banking/borrowing deadline” and says points not banked or borrowed by then are forfeited. The sender queries active contracts but not their recorded balances, so it can remind an owner with zero bankable points. No emailed use-year/holding expiry alerts or unified action checklist. |
| 3 | Answer “What can these contracts and these points actually cover?” | Home-resort priority opens at 11 months, non-home booking at 7 months; all points used for home priority must belong to that home resort. Reservations remain subject to availability. [Disney's 2025 terms](https://cdn1.parksmedia.wdprapps.disney.com/media/dvc/DVC-Terms-and-Conditions-2025-5-15-25.pdf). | **Partial.** Calendar, Compare and itinerary comparison use contract access, booking windows, recorded balances, cross-use-year point demand and historical availability risk; resale restrictions are modeled. | The answer begins in planning screens rather than on a contract's points. There is no compact “Use these points” path from an expiring/current balance to eligible stay options. Historical risk is not live availability, and the app cannot reserve a room. |
| 4 | Track a confirmed reservation through edits, waitlist and cancellation | Disney's cancellation treatment changes at 31 days, 30–1 days and check-in; waitlists can change reservations. [Disney's 2025 terms](https://cdn1.parksmedia.wdprapps.disney.com/media/dvc/DVC-Terms-and-Conditions-2025-5-15-25.pdf), [Home Resort rules](https://disneyvacationclub.disney.go.com/media/dvc/languagespecific/eng/member/vacationplanning/rulesandregulations/Home_Resort_Rules_and_Regulations_Aug_2021.pdf). | **Partial.** Bookings & Stays records booked stays, point sources, deductions, edits and cancellation/deletion outcomes. | No confirmation number, Disney verification state, waitlist request or replacement-booking status. A saved itinerary is intentionally not a booking; a waitlist must likewise not consume points or count as booked value before Disney confirms it. |
| 5 | Understand actual ownership cost and whether the contracts have paid off | Annual dues persist whether or not the owner travels; they can rise. [Disney's 2026 ownership information](https://disneyvacationclub.disney.go.com/media/dvc/en/_global/footer/Standard-Information-form-for-timeshare-contracts.pdf). | **Partial.** Membership Value models purchase price, published historical dues, booked-stay value, payback and exit equity; Contract Value compares hypothetical purchases. Owners can override a stay's cash value. | No owner-entered actual dues paid, financing interest, closing costs or sale proceeds. When purchase data is absent, the model uses estimates. Thus “paid back” is a model result, not an audited cash-flow figure. |
| 6 | Decide what to do with points they will not personally use | Owners discuss extra/unbankable points, but transfer, rental of a reserved stay and using points personally are different paths. [Disney's transfer rules](https://disneyvacationclub.disney.go.com/media/dvc/languagespecific/eng/member/vacationplanning/rulesandregulations/Home_Resort_Rules_and_Regulations_Aug_2021.pdf) bar compensation for a points transfer; [Disney's ownership information](https://disneyvacationclub.disney.go.com/media/dvc/en/_global/footer/Standard-Information-form-for-timeshare-contracts.pdf) describes rental limitations. | **Limited.** My Contracts offers short-notice stay ideas and mentions transferring; bookings can record points obtained from outside sources. | No disposition decision aid or record of an outgoing transfer, guest stay or rental proceeds. Do not present a compensated points transfer as an option, and do not build a rental marketplace without separate policy/product review. |
| 7 | Keep up with dues and access restrictions | Overdue dues or loan payments can prevent banking; resale acquisition affects resort access and extras. [Disney's 2025 terms](https://cdn1.parksmedia.wdprapps.disney.com/media/dvc/DVC-Terms-and-Conditions-2025-5-15-25.pdf), [Disney's resale restriction exhibit](https://cdn1.parksmedia.wdprapps.disney.com/media/dvc/en/collateral-docs/MS_POS_Rev_05_02_2023.pdf). | **Partial.** The contract record includes direct/resale type, acquisition date, point allotment and perks/restriction badges. Dues rates feed value estimates. | The app cannot know whether an owner's dues are actually current. Eligibility/rule data needs periodic verification. A proposed action should distinguish recorded eligibility from Disney-confirmed account standing. |

## Immediate correctness fix: reminder language and targeting

`supabase/functions/send-banking-reminders/index.ts` currently says “banking/borrowing deadline” and “Points not banked or borrowed by then are forfeited for this use year.” That is materially misleading. The banking window closes after the first eight months, but unbanked current-use-year points may still be used until that use year ends; borrowing is performed in connection with a reservation, not against this banking cutoff. This is a **code observation**, not a claim that a particular owner received the email. Correct the subject/body to say **banking deadline**; state separately when the points expire. Query the relevant confirmed current-use-year balance and send only if eligible current points remain. If the balance is unknown, send a “check your Disney balance” message rather than a numerical claim. Verify wording against current Disney rules before deployment.

## Delivery plan

### P0 — Fix trust before adding more alerts

1. Correct the email copy and qualifying logic above. Reuse the same date/bucket rules as My Contracts rather than a separate hand-maintained policy table where practical. Add tests for confirmed zero, unknown, positive bankable balance, post-banking/pre-expiration, banked, borrowed and Holding points.
2. Audit every in-app, email and calendar reminder for the distinction among **banking cutoff**, **use-year expiration**, and **Holding booking window**. Do not say the app completed an action at Disney.
3. Keep the existing push control unavailable until sender, device enrollment and delivery are actually working; follow `docs/mobile_push_todo.md` later.

**Done when:** no owner with zero eligible current points receives a “bank these points” email, and no reminder claims points are forfeited at the banking cutoff.

### P1 — Make the contract balance trustworthy

1. Add a per-contract/use-year “Checked against Disney on [date]” state and an owner-led **Reconcile points** flow. Show the app's recorded buckets beside the totals the owner reads from Disney; accept corrections with a reason (booking, banking, borrowing, transfer, cancellation, other).
2. Show a compact, immutable point-activity timeline derived from existing banking/borrowing records, booking deduction receipts and corrections. Add a small audit record for any manual adjustment; do not silently rewrite prior events.
3. When numbers disagree, show the delta and its affected use year before saving. Preserve the original value on failed saves and label snapshots as owner-entered, not Disney-synced.
4. Consider a statement import only after confirming an export format and privacy implications. Do not ask for Disney credentials or imply that a Disney API exists.

**Done when:** an owner can explain every displayed balance, correct it from Disney's record, and see when it was last verified.

### P1 — Turn deadlines into a point-specific action center

1. On Home/My Contracts, combine the existing attention logic into one action card per at-risk bucket: **bank eligible current points**, **use points before use-year end**, or **use Holding points within its restrictions**. Show exact contract, use year, amount, date, and why that action applies.
2. Add opt-in email alerts for use-year expiration and Holding risk, with distinct templates and deduplication. Provide actions to view the affected balance, open the contract-first stay finder, or mark the owner's Disney action recorded.
3. For points past the banking cutoff, never suggest banking. Offer eligible short-notice stays and a clear note that any transfer or rental arrangement occurs outside this app and follows different rules.

**Done when:** a multi-contract owner can answer “Which points need attention next, and what can I still do with them?” without opening each contract.

### P1 — Add “Use these points” from a contract

1. Place one action on a selected contract/use-year balance. Preselect that contract and bucket; ask only for date flexibility, party size and preferred destination/room if needed.
2. Reuse the existing point-chart, access, booking-window, cross-use-year and historical-risk code to rank eligible stays by fit to the owner's recorded balance and deadline. Show shortages and which other eligible contract could cover them.
3. Label results “possible with recorded points” and “historical availability outlook.” Link to Disney to check live inventory and book; do not call a result available or booked.

**Done when:** an owner can start with 80 expiring points and see practical eligible uses, the point math and the Disney booking step, without first building an itinerary.

### P2 — Complete the reservation record

1. Add optional Disney confirmation number and last-verified date to a recorded booking. Add separate statuses for Disney-confirmed booking, pending waitlist and canceled booking.
2. A waitlist must not deduct points or enter Membership Value until converted to a confirmed booking. On conversion, use the existing atomic booking/deduction path. For cancellation, retain the current explicit balance outcome and receipt history.
3. Add date-aware reminders for owner-entered waitlist review and cancellation thresholds; deep-link to the booking record. Do not imply that the app submits waitlists or cancellations to Disney.

**Done when:** Bookings & Stays distinguishes confirmed reservations from requests and preserves what happened to their points.

### P2 — Let owners replace estimated costs with actuals

1. Keep published annual dues as the default estimate, but let the owner enter actual dues paid by contract/calendar year, acquisition closing costs, and optional financing interest. Show actual versus estimated values explicitly.
2. Keep the existing booked-stay value model, but show its basis (owner-entered cash value or app estimate) and permit a rental-comparison baseline. Do not silently equate Disney rack rate with what this owner would have paid.
3. Recalculate Membership Value and Exit Equity with owner-entered actuals where present. Show which components remain modeled.

**Done when:** an owner can tell which payback inputs are verified personal costs, which are public rates, and which are assumptions.

### Later, after owner validation

- Record outgoing point transfers and guest/rented reservations as separate owner-entered events only if interviews show demand. A points transfer cannot be presented as a compensated sale; rental of a reserved stay has different rules.
- Implement mobile push per `docs/mobile_push_todo.md` only after alert rules and email targeting are correct.
- Reverify resale and benefit rules periodically; these are policy data, not an unconditional promise of bookability.

## Research and product limits

- This is a contract-management roadmap, not a proposal to book DVC inventory, authenticate to Disney, or guarantee availability. The repository has no Disney account integration; the app's Supabase account stores owner-entered records.
- Disney rules can change. Recheck current official documents before shipping rules-based features, especially transfers, resale restrictions, waitlists and cancellation treatment.
- The owner examples cited above demonstrate real questions but do not establish population-level frequency. Interview multi-contract owners and owners who recently banked, canceled or rented a stay before committing to P2/later work.

## Disney account connection boundary (checked September 23, 2026)

I found **no published DVC member-data API or owner-authorized OAuth connection** for an independent app to read points, contracts or reservations. This is a finding from a public search, not proof that Disney has no private partner integration or will never offer one. [Disney's current US Terms of Use](https://disneytermsofuse.com/english/) say users should not share account information and restrict automated extraction of Disney products; [DVC's online-booking terms](https://cdn1.parksmedia.wdprapps.disney.com/media/dvc/DVC-Terms-and-Conditions-2023.pdf) warn against giving membership login/PIN access to unauthorized individuals. Thus the implementation plan does not request Disney credentials, reuse a browser session, call undocumented endpoints, or scrape the member portal. A sanctioned integration would require an explicit Disney agreement and documented authorization. Until then, owners can verify their numbers while viewing Disney's site themselves and enter the results here.

## Copy-ready Claude implementation prompts

These are deliberately separate. Run **one prompt at a time**; finish and review its result with the owner before starting the next. The previous roadmap's final item is split into two prompts because reservation records and actual-cost accounting have different data models and acceptance tests. Prompts 2–6 may need Supabase migrations; prepare and test the migration before requesting the owner to run it. Do not mark a database-backed feature complete until the migration and real save/read path have been verified or clearly report that verification as pending.

### Prompt 1 — Correct and target banking reminders

```text
Implement only Task 1: make DVC Companion's banking reminder email factually correct and targeted to the owner's recorded points. Do not start the other roadmap tasks. This is a contract-manager-first mobile app; read README.md and any repository instructions before editing.

Problem: supabase/functions/send-banking-reminders/index.ts currently labels the banking cutoff a "banking/borrowing deadline" and says points not banked or borrowed by that date are forfeited. Disney's current published terms distinguish the banking cutoff from the later use-year expiration. The function also queries active contracts but not contract_year_points, so it can mail someone who has zero current points to bank. The app records points manually; never imply Disney confirmed the balance or that this app banked points.

Implement this behavior:
1. Use the contract's current use-year label and the date in America/New_York. Query its contract_year_points row for that label, including balance_confirmed_at and points_remaining. Treat only confirmed positive points_remaining as a known bankable amount. Banked, borrowed and Holding buckets are not eligible current points. Keep an existing saved zero distinct from an unknown balance.
2. During the owner's configured reminder-lead window, send a banking reminder for a confirmed positive amount. Say "banking deadline," state the amount as "points you recorded as current," give the correct cutoff date, and say Disney must confirm eligibility and perform the transaction. State separately that unbanked points may still be used until that use year's end; do not describe them as forfeited at the banking cutoff. Do not call it a borrowing deadline.
3. For a confirmed zero current balance, send no banking email. For an absent/unconfirmed balance, send at most one different "check your Disney balance before the banking deadline" email during the configured window; make no numerical or eligibility claim. Preserve opt-in, unsubscribe, membership-gate behavior, per-contract deduplication and the reminder_run_log heartbeat.
4. If reading a contract's point row fails, record a run error and do not send a guessed reminder. Keep error logs free of email addresses and other secrets. Keep all subject lines, HTML and any calendar/in-app copy touched by this change consistent with the banking-versus-expiration distinction.
5. Factor the date/bucket decision into testable pure logic shared with, or explicitly checked against, dvc-dates.js/dvc-point-attention.js. Avoid two silently divergent deadline tables. Update the sender's inline comments and the deployment/check instructions.

Test confirmed positive, saved zero, unknown, failed ledger read, multiple contracts with different use years, a banked-only/borrowed-only/Holding-only balance, days before/at/after the banking cutoff, Eastern date rollover, opt-out and duplicate cron invocations. Run the full existing test suite. If possible, run a dry-run or isolated Edge Function test without delivering to real owners. Report exact files changed, example final email copy, tests, and anything that still needs production verification. Do not deploy or send a real email without the owner's authorization.
```

### Prompt 2 — Reconcile contract balances with Disney, manually

```text
Implement only Task 2: an owner-led "Reconcile points" flow for DVC Companion. Do not start the other roadmap tasks. Read README.md and existing contract, ledger, point-movement, booking-deduction and Supabase/RLS code first. This app must not ask for a Disney login or claim it can sync Disney data.

Owner outcome: from a contract and specific use year, the owner can compare the app's current/banked/borrowed/Holding buckets with the balances they personally see in Disney, correct the app in one deliberate action, and later see when and why the correction was made. Make it feel like a mobile account check, not a tax form.

Implement this specific flow:
1. Add a "Reconcile points" action to each confirmed or unconfirmed contract/use-year balance in My Contracts. Open a mobile sheet showing the recorded buckets and total, the use-year date range, and four large numeric entries for the amounts the owner sees in Disney. Require whole, nonnegative amounts. Do not prefill unknown balances with the annual allotment; a saved zero must remain a real zero.
2. Before Save, show a plain-language difference by bucket and total. If values match, let the owner mark the balance checked without changing points. If values differ, require a short reason chosen from Booking, Banking, Borrowing, Transfer, Cancellation, or Other, plus optional notes. Explain that this updates DVC Companion only.
3. Store an explicit last_checked_against_disney_at timestamp separate from balance_confirmed_at. Existing balances must initially say "Not checked against Disney yet" rather than inheriting an unproven verification. Save the balance update and an immutable reconciliation event atomically, with an idempotency key and a conflict check against the balance version read when the sheet opened. On conflict, reload and ask the owner to review the new before/after; never overwrite a newer booking deduction or point move silently.
4. Build a compact per-contract/use-year activity view that combines saved banking/borrowing movements, booking deduction receipts and reconciliation events in date order. Clearly label automated in-app operations versus owner-entered corrections. Do not fabricate historical reasons for legacy rows. If an existing event type cannot be read safely, show what is available and report the exact limitation.
5. Add the Supabase migration, RLS and API methods needed for the new timestamp/events. Keep events bound to the authenticated owner's contract and use year; never permit cross-user reads. Preserve current balance setup, adjustment, banking/borrowing, booking save/edit/delete and error-retry behavior. A failed save leaves entered values intact and clearly distinguishes proposed from saved amounts.

Verify at 360px and 390px with zero, unknown, multiple contracts and different use years, a match, a mismatch, a server failure, a concurrent booking deduction and a repeated Save. Add meaningful pure and database/RPC tests. Run the full suite. Prepare migration instructions and report whether a real Supabase round trip was verified. Do not mark the feature complete solely on a browser mock.
```

### Prompt 3 — One point-specific action center

```text
Implement only Task 3: a contract-first action center for banking, use-year expiration and Holding points. Do not start Tasks 4–6. Read README.md, the current Home/My Contracts attention logic, notification settings, reminder_log and the corrected Task 1 sender before editing. Use the owner's saved balances, not annual entitlement as an available balance.

Owner outcome: with several contracts, the owner can answer "Which points need action next, how many, by when, and what can I still do?" without opening every contract. Keep Home calm: show only the single most urgent item and a "View all point actions" link. Put the full, grouped action list on My Contracts; do not add a stack of alert cards to Home.

Implement these decision states per contract and use year: unconfirmed balance -> "Check your Disney balance" with no assumed points; confirmed eligible current points before banking cutoff -> "Bank or use [N] current points by [date]"; remaining usable points after banking cutoff -> "Use [N] points before [use-year end]" with no banking CTA; banked/borrowed points approaching their use-year end -> "Use by [date]"; Holding points -> "Use by [use-year end]; book no more than 60 days before check-in." The 60 days is an advance-booking restriction, not a clock measured from when points entered Holding. Never suggest banking Holding, borrowed or already-banked points. Deduplicate buckets so the same points are not counted in multiple action totals. Show recorded/last-checked freshness from Task 2 when available.

Actions should deep-link to the exact contract/use year or to Task 4's future "Use these points" entry point only if Task 4 already exists; otherwise use the existing planner with the contract preselected and label it as a planning estimate. Do not suggest the app itself banks, transfers or books points at Disney.

Add separate opt-in email event types for use-year expiration and Holding risk, with explicit settings, lead time, unsubscribe and per-event deduplication. Keep Task 1 banking emails separate. Do not enable mobile push; it has no sender yet. Never send an exact-point alert if the balance is unknown or the ledger read failed. Reuse one tested rules module for Home, My Contracts and sender decisions where feasible.

Test February and December use years, multiple contracts, unknown and saved-zero balances, mixed buckets, banking-cutoff-to-expiration transition, Holding dates, repeated nightly runs, preferences and failed reads. Verify the mobile screens at 360px and 390px, run the full suite, and report both local and real delivery verification separately. Do not deploy or send to real owners without authorization.
```

### Prompt 4 — "Use these points" from a contract

```text
Implement only Task 4: a mobile "Use these points" flow starting from an actual contract/use-year balance. Do not implement booking with Disney or start Tasks 5–6. Read README.md and reuse the existing Calendar, point-chart, multi-contract funding, resale-access, booking-window and historical-availability logic; do not fork the math into a new independent calculator.

Entry: on My Contracts, add "Use these points" to a selected contract and use year. Carry contract ID, use-year label and its recorded point buckets into the flow. If the balance is unknown, show a clear "Add or check this balance first" path. If it is a confirmed zero, show that zero and allow the owner to look at other contracts without inventing annual points.

The mobile flow should first show a simple budget card: contract name, current/next use year, recorded points usable for a proposed stay, and expiration/booking constraints. Then ask for date flexibility (specific dates or a month), party size, and optional resort/room preference. Rank a manageable number of suggested stays by fit to the points and urgency, rather than opening the full planning calendar with every control exposed. Let the owner open a result for its point-by-night calculation, eligible contract funding, possible shortage and booking-window date. If more than one contract is used, apply home-resort priority correctly: at 11 months, only the relevant home-resort points; at seven months, combine only eligible contracts. Handle use-year boundaries and Holding's 60-days-before-check-in restriction.

Every result must distinguish: "fits recorded points," "historical availability outlook," and "check live availability with Disney." Historical data must never become a "room available" claim. Provide an obvious Disney member-site handoff for the owner to check inventory/book there. Do not create a recorded booking or deduct balances from browsing or saving a plan. A saved itinerary remains a possibility; recording a confirmed Disney booking remains a separate, intentional action through Bookings & Stays.

Keep the screen thumb-friendly at 360px/390px with app-native cards and custom pickers, no desktop table or native select. Test direct/resale restricted access, 11/7-month edges, insufficient points, mixed use years, Holding, unknown/zero balance, no candidate stays and stale historical availability. Run the full test suite and exercise the real mobile flow end to end. Report any assumptions about data freshness or Disney access.
```

### Prompt 5 — Confirmed bookings and waitlists as separate records

```text
Implement only Task 5: complete the owner-entered reservation record without claiming DVC Companion can make or change a Disney reservation. Do not start Task 6. Read README.md, Bookings & Stays, the trip save/deduction RPC, cancellation reconciliation and Membership Value code before editing. Keep saved itineraries, waitlists and confirmed bookings separate.

For confirmed bookings, add optional Disney confirmation number and "last checked in Disney" date to the existing record. These fields must survive create, edit, reload and cancellation history. Show them only in expanded booking details, so the ten-stay list stays compact. Never present a booking as Disney-verified merely because the owner entered a number.

Add a separate owner-entered Waitlists section on Bookings & Stays, below Needs review and above confirmed stay groups when nonempty. A waitlist request stores resort, room, requested check-in/out, optional linked backup booking, request date, owner notes and status Pending, Fulfilled or Canceled. Pending/canceled waitlists must not create a trip, deduct points, count toward Membership Value, or appear in completed-stay counts. Provide Add, Edit, Cancel request, and "Disney confirmed this" actions. Converting a fulfilled waitlist opens the existing Record a Booking flow prefilled, requires the owner to confirm actual Disney dates/points/sources, and marks the waitlist Fulfilled only after the existing atomic booking save succeeds. A failed booking save leaves the waitlist Pending and preserves inputs; repeated taps must not duplicate a booking.

Preserve existing booking edit/delete and explicit balance-reconciliation behavior. If an owner records that a confirmed booking was canceled with Disney, retain enough history to show the confirmation and how its points were handled; do not silently treat deleting an app record as canceling at Disney. Keep the current 31+ day, 30–1 day and check-in-day point outcomes, but do not apply them to a waitlist. Add optional owner-controlled reminders to review a pending waitlist near check-in; never claim the app monitors Disney's waitlist or inventory.

Provide migration(s), RLS and tested API methods. Verify a ten-booking account stays concise on 360px/390px, then test no bookings, pending waitlist, linked backup, fulfilled conversion, failed conversion/retry, canceled waitlist, cancellation of a confirmed booking and Membership Value exclusion. Run the full suite and report real Supabase verification separately from synthetic UI checks.
```

### Prompt 6 — Actual ownership costs in Membership Value

```text
Implement only Task 6: let DVC owners replace modeled historical ownership costs with their own actual numbers. Do not work on earlier tasks or change the hypothetical purchase comparison in contractvalue.html. Read README.md, dvc-owner-value.js, trips.html, data/dues_historical.js, contract fields, settings and tests first.

Create an app-native "My actual costs" entry from Membership Value and each contract. For each contract, let the owner record actual annual dues paid by calendar year, optional one-time acquisition closing costs, and optional financing interest paid by calendar year. Keep purchase_price as the purchase principal: never add loan principal again as an expense. A blank actual value means use the existing published-rate or closing-cost estimate; a saved zero is an intentional actual zero. Show each field's source and year in a compact mobile card, not a tax-like table.

Store these values per owner/contract with migration, RLS and safe API methods. Preserve existing contract and stay records. When an actual value exists, use it instead of the estimate in Membership Value's historical outlay, payback percentage, remaining amount, cost chart, per-contract breakdown and Exit Equity. Continue to project future dues with the existing model; label projections. Show a short "Actual costs entered for X of Y years; the rest are estimated" explanation and make every breakdown identify actual versus estimated components. If purchase_price or purchase_date is missing, keep its existing estimate but label it visibly. Do not silently convert an estimated hotel cash value into an owner's actual savings; retain the existing custom stay-value override and its source label.

An owner can edit or remove an actual-cost entry and see the figures recalculate without double-counting. A failed save retains the proposed values and leaves displayed saved figures intact until retry. Use idempotent writes and decimal-safe money handling. Do not add tax, investment-return or rental-income claims in this task.

Test one contract, multiple contracts, annual dues actual versus fallback, saved zero, financing interest without duplicate principal, missing purchase details, edited/deleted actuals, projection years and save failures. Verify Home and Membership Value agree after changes. Check 360px/390px layout, run the full suite, and state whether a real Supabase save/read was verified. Prepare migration instructions before requesting the owner to run it.
```
