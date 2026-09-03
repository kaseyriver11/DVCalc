# DVC Accounts, Contracts & Personalization

**Status:** Phase 1 (auth foundation) done and verified 2026-09-03 — real
Google sign-in via Supabase project `dvcalc_start`, tested end to end
locally: clicking "Sign in with Google" redirects through Google's real
consent flow and Supabase's callback, lands back on the app, and the header
correctly shows the signed-in account with a working sign-out. Not yet
deployed to production (GitHub Pages) — Supabase's Redirect URLs allow-list
currently only permits `localhost:8794`; the production URL needs to be
added there before login will work live. Phase 2 (contract CRUD) not
started.

## Context

DVCalc is a 100% static site (GitHub Pages, no backend, no build step, no accounts) built up over this project's history around a calendar/points/cash tool. Through conversation, the owner has landed on a bigger vision: let users optionally sign in with Google, store their real DVC contract(s) (resort, use year, points, direct vs. resale), and use that data to make the tool itself smarter — highlighting the 11-month home-resort window vs. 7-month window on the calendar, filtering out resorts a resale-restricted contract legally can't book, tracking trip history against a "true cost of ownership" value story, and (opt-in) emailing banking/borrowing deadline reminders.

The explicit constraint from the owner: **the site stays "tool first."** Everything that works today for an anonymous visitor must keep working exactly as-is; login is a pure opt-in enhancement layer, never a gate.

Two DVC domain rules get encoded as real product logic here, so getting them right matters more than usual (a wrong answer here isn't a cosmetic bug, it's telling someone they can or can't book somewhere):

- **Resale restriction rule** (verified via multiple independent sources, cross-referenced, 2026-09-03): resale contracts purchased *at* Riviera Resort (`rivieraResort`), Villas at Disneyland Hotel (`disneylandHotel`), or The Cabins at Fort Wilderness (`fortWildernessCabins`) can only ever be used at that same home resort. Resale contracts purchased at any of the other 14 resorts can book any of those 14 at 7 months, but can never book the three resorts above. Direct-purchased contracts have no restriction. This is current DVC policy, not something DVCalc's data already encodes — worth periodic re-check, since Disney could change it.
- **Banking/borrowing deadline rule** (verified, consistent across sources): each of DVC's 8 use years (Feb, Mar, Apr, Jun, Aug, Sep, Oct, Dec) has exactly one deadline date, always 8 months after the use-year start, and it governs both banking and borrowing (they close together). Exact deadlines: Feb→Sep 30, Mar→Oct 31, Apr→Nov 30, Jun→Jan 31, Aug→Mar 31, Sep→Apr 30, Oct→May 31, Dec→Jul 31 (rolling into the next calendar year where the deadline month is earlier than the use-year month).

Confirmed by direct exploration before building: the codebase had zero auth, zero backend calls, zero localStorage, and only one `sessionStorage` pattern (a one-shot, self-clearing 3-key handoff between `index.html` and `compare.html` — see `app.js:1888-1928`, `compare.html:1009-1122`). Room type ids are resort-scoped, not globally unique (e.g. `"deluxeStudio"` exists on 8+ different resorts with different pricing) — a room is only identified by the pair `(resortId, roomTypeId)`.

## Approach

**Backend: Supabase** (Postgres + built-in Google OAuth + client JS SDK + Row-Level Security + scheduled Edge Functions), with **Resend** for transactional email.

Why this over the alternatives: the frontend must stay static and buildless (no bundler exists in this repo today, and introducing one is a bigger cost than the feature itself) — Supabase's JS SDK loads as a plain `<script type="module">` from a CDN, same idiom as the existing `<script src="data/data.js">` tags. The domain is inherently relational (one user → many contracts → many trips, plus aggregate "sum realized trip value" queries), which Postgres fits directly and Firestore-style document stores would fight. Row-Level Security means authorization lives in the database itself (`user_id = auth.uid()` policies) — there's no need to write, host, or maintain a custom API server just to gate reads/writes, which matters a lot for a project with one part-time maintainer. Google OAuth is a dashboard toggle, not a hand-rolled flow. Supabase's free tier (DB + Auth + Edge Functions) covers a hobby tool comfortably; a custom Node backend would mean paying for and operating real server infrastructure for no functional benefit here. Firebase was the other realistic option — ruled out mainly because Cloud Functions require the paid Blaze plan to make outbound network calls at all (needed for the reminder emails), where Supabase Edge Functions don't have that gate.

### Data model (Postgres, RLS enabled on every table)

See `db/schema.sql` for the actual DDL. Summary:

- **`profiles`** (1:1 with `auth.users`, auto-created via a trigger on user signup): display name, `reminder_opt_in`, `reminder_lead_days`.
- **`contracts`**: home resort, use year (one of the 8 fixed values), points/year, purchase type (direct/resale), purchase price + date (both optional), nickname (optional — needed the moment someone has 2+ contracts), `is_active` (soft-delete; excluded from personalization access but kept for cost-of-ownership history).
- **`trips`**: resort, room type, check-in/out, points used. `contract_id` is deliberately nullable — DVC doesn't require attributing a booking to one specific contract's points, so logging shouldn't force that attribution either. No stored "cash value" column — that's computed client-side on read via the existing `computeStayEntry()`/`getCashRateWithFallback()`, so it never goes stale as cash-rate data updates.
- **`reminder_log`**: double-send guard for banking/borrowing emails, `UNIQUE (contract_id, deadline_date, reminder_type)`. Written only by the service-role Edge Function.

Resort/room-type ids are stored as plain `text`, validated at the app layer against the live `RESORTS` array in `data/data.js` — not a DB foreign key, since that data changes over time independent of any schema migration.

### Integration into the existing frontend

- `auth.js` (repo root), loaded as `<script type="module" src="auth.js">` on `index.html` and `compare.html` — the first ES module in this repo, but additive: it exposes `window.DVCAuth` so the existing non-module scripts can call it like any other global, the same way they already use globals from `data.js`.
  - `DVCAuth.signInWithGoogle()`, `.signOut()`, `.onAuthChange(cb)`, `.getSession()`, `.getContracts()`.
  - `DVCAuth.getUserResortAccess(contracts, allResortIds)` — a **pure function** (no DOM, no network) implementing the resale-restriction rule, returning `{ homeResortIds, sevenMoResortIds, restrictedResortIds }`. Access unions permissively across a user's contracts — owning even one unrestricted way into a resort makes it bookable, regardless of what any single other contract alone would say.
  - Also self-renders the header sign-in/sign-out control into `#account-control` if present on the page, since module scripts resolve imports asynchronously and a separate inline script can't safely assume `window.DVCAuth` exists yet just because it appears later in the document.
- Personalization data does **not** go into `app.js`'s `state` or `compare.html`'s `state` — both get wholesale-serialized to `sessionStorage` for the index↔compare handoff (`app.js:1888`), and mixing server-derived data into that blob would let it go stale the moment contracts change elsewhere. Plan: a separate module-scope variable, populated async off `DVCAuth.onAuthChange`, triggering a re-render of the already-idempotent `renderCalendar()`. (Not yet wired — this is Phase 3.)
- Calendar hook (Phase 3, not yet built): inside the existing day-cell loop in `renderCalendar()` (`app.js`, ~line 1279 onward, right where `period`/`points`/`cashRate` are already computed per date) — add classes/badges for home-resort vs. 7-month vs. n/a, following the same pattern already used for period coloring and the `tooltip-card` component. A whole-resort restriction isn't a per-date fact — render it once as a banner near the resort selector.
- The 11-month/7-month "you can book starting X" date math (Phase 3) is **new, separate logic** from the existing `BOOKING_WINDOWS`/`getStayAvailability()` (`app.js` ~213-263) — that system models historical availability *likelihood*, a different concept that happens to share window-name vocabulary. Keep them visibly distinct in code and comments.
- `compare.html` hook (Phase 3, not yet built): same `getUserResortAccess()`, consumed in the existing results-table string-build — a small Home/7-Mo/Not-Bookable pill per row, default to flagging rather than hiding restricted resorts (opt-in "only show what I can book" checkbox).

### Phasing (each phase independently shippable)

1. **Phase 0+1 — Auth foundation.** Supabase project + `db/schema.sql` + RLS policies + Google OAuth provider config; `auth.js`; sign-in control in both pages' headers; `profiles` row auto-created on first login. No contracts, no personalization yet. Include a working "delete my account" action even at this stage — don't defer it past the point real PII (purchase price) exists.
2. **Phase 2 — Contract CRUD.** New `account.html` (or a modal), add/edit/delete/list contracts, reusing `RESORTS` for the resort picker and the fixed 8 use-year values. Good checkpoint to verify RLS actually isolates users before anything depends on it.
3. **Phase 3 — Personalization payoff** *(riskiest phase)*: `getUserResortAccess()` wired into the calendar and compare table. Riskiest because it's the first phase where a bug is an eligibility bug, not a cosmetic one.
4. **Phase 4 — Trip history + cost of ownership.** Depends only on Phase 2, can be reordered/parallel with Phase 3.
5. **Phase 5 — Banking/borrowing email reminders.** Deferred last — the only phase introducing scheduled compute + outbound email + dedupe as genuinely new infrastructure.

### Risks to keep in view

- Deadline math must run in **Eastern Time**, independent of the visitor's own timezone.
- Google's OAuth consent screen caps "testing" mode at ~100 users — confirm during Phase 1 whether verification is needed before real launch.
- Supabase's free tier can pause a project after inactivity.
- RLS is the *entire* authorization boundary here — worth a couple of two-different-account integration tests confirming user A can never read user B's data, before Phase 2 ships.
- Any reminder email needs a working one-click unsubscribe independent of the in-app toggle (CAN-SPAM/GDPR).

## Phase 0/1 checklist — what's left

All done as of 2026-09-03:

1. ✅ Supabase project created (`dvcalc_start`, https://afqhmtqwjtjkjahepqxv.supabase.co).
2. ✅ `db/schema.sql` run — `profiles`/`contracts`/`trips`/`reminder_log` all present.
3. ✅ Google Cloud OAuth client created (project `dvcalc`), consent screen configured.
4. ✅ Google provider enabled in Supabase with the client ID/secret; Supabase's callback URL added to Google's authorized redirect URIs; `localhost:8794` added to Supabase's own Redirect URLs allow-list.
5. ✅ `SUPABASE_URL`/`SUPABASE_ANON_KEY` (publishable key) filled into `auth.js`.
6. ✅ Tested end to end locally — real Google sign-in, session persists, header shows signed-in state, sign-out works.

**Remaining before production use:** add the live GitHub Pages URL to Supabase's Redirect URLs allow-list (Authentication → URL Configuration) — without it, sign-in will work locally but fail once deployed.
