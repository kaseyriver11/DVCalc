# Subscriptions / Billing Plan

**Status:** In progress (2026-09-18) — Phases 2-4 are built (DB migration,
3 Edge Functions, account.html Membership card, auth.js). The test-mode
Stripe account already existed (connected via the Stripe MCP plugin) and
had no Product/Price yet, so that part of Phase 1 was created directly
through the Stripe API rather than left as a manual step -- see the
checklist below for exactly what's done vs. still needs you. Ties to
CLAUDE.md Future Feature Idea #19 ("Free vs. paid subscriber tiers"),
currently "Not planned" until this ships.

## Why this shape

DVC Companion is a static site (GitHub Pages, `dvccompanion.com`) backed by Supabase
(Postgres + Auth + Edge Functions) — the same architecture Phase 5's reminder
emails already proved out (`docs/phase5_deployment.md`: Deno Edge Functions,
secrets via `supabase secrets set`, a service-role-only table). Billing
follows the identical pattern:

- **Stripe Checkout** (hosted payment page) instead of a custom card form —
  no PCI scope, no payment UI to build or secure.
- **Stripe Customer Portal** (hosted, Stripe-built page) for cancel/update
  card/switch plan/view invoices — covers "cancel/manage/delete" from the
  original ask with almost no code on our side, just a link to it.
- **Supabase Edge Functions** to create Checkout/Portal sessions and to
  receive Stripe's webhook — mirrors `send-banking-reminders`/
  `unsubscribe-reminders` exactly (one authenticated function, one public
  `--no-verify-jwt` function).
- **A new `subscriptions` table**, written only by the webhook function
  (service role), read-only for the owning user — same trust model as
  `reminder_log`.

No new hosting, no server, no PCI burden. The actual work is a handful of
small Edge Functions plus one DB table plus a UI card.

---

## Phase 0 — Decisions only you can make

### Tier split — decided 2026-09-18

Governing principle: **tools built on public/market data stay free forever;
tools that work with a user's own portfolio (contracts, points, trip
history) are paid.** No grandfathering needed — no real user base yet
besides the owner.

**Free**
- Points Calendar — resort/room/date points+cash lookup, booking window
  indicators, crowd forecast, festival/party/runDisney badges, resort
  construction alerts
- Cross-resort Compare
- Year-over-Year Changes chart
- Contract Value buying guide (market resale/direct pricing + dues data,
  not personal portfolio — moved to free after discussion)
- Suggest a Stay — base points-budget search (any resort)
- Account sign-in itself (required before subscribing)

**Paid ("Active Member")**
- My Contracts — adding/editing contracts at all (not capped, gated
  entirely)
- Points ledger (banked/borrowed/remaining per use-year)
- Banking/borrowing deadline tracking + automated email/push reminders
- "Booking As" on the calendar — contract-linked home/7mo/restricted
  eligibility + points-remaining warnings (a feature-level gate inside the
  otherwise-free calendar page, not a page-level gate)
- Suggest a Stay's "resorts I can book" personalized scope
- Trip logging, saved itineraries, itinerary comparison
- Trophy Case / badges, including the House Money payback badge

Pitch: *"The planning tools are free forever. Pay to connect your own
contracts and points to them."*

### Price, refunds, entity — decided 2026-09-18

- **Price/interval: Annual only, $25/yr founding rate, with a 7-day free
  trial.** (Was $49.99 until 2026-09-24 -- see "Price revisited" below.)
  Deliberately no monthly option — DVC planning is bursty (one intense
  sprint around your booking window, plus periodic deadline checks the
  rest of the year), and the paid tier's flagship feature (automated
  banking/borrowing reminders) only delivers its value across a full
  ownership year. A monthly plan would invite subscribe-during-the-sprint,
  cancel-right-after churn that works against that feature's entire point.
  The 7-day trial covers the "let me try it first" need that annual-only
  otherwise lacks, without reopening that churn pattern. Needs exactly one
  Stripe Price (`price_...`), configured with a 7-day trial period.
- **Refund policy: no refunds, cancel anytime** (stops future renewal,
  current period stays active through its end). Standard for hobby/indie
  SaaS, no manual refund handling required.
- **Business entity: sole proprietor**, using the owner's own SSN and bank
  account for Stripe's payout verification (Phase 1, step 3) — no LLC
  formation needed to start.

### Price revisited — decided 2026-09-24

- **$25/yr, a founding rate locked in while the membership stays active.**
  Competitors: DVC Toolkit $29.99/yr, My DVC Plan $69.99/yr -- but what
  both mainly sell is availability alerts, which this app deliberately
  doesn't have (nothing talks to Disney). The paid tier here is the
  organizer (contracts, ledger, reminders, bookings); the strongest
  planning tools are free. $49.99 sat next to My DVC Plan without its
  headline feature. RevenueCat's 2026 median annual price is ~$35.
- **Round $25, not $24.99:** the left-digit effect only matters when the
  .99 changes the first digit; round prices read better for a considered
  purchase, and it makes the dues comparison clean.
- **Framed in the owner's own dues:** the gate says "Less than the dues on
  3 Saratoga Springs points" (auth.js `membershipDuesHTML()`), using the
  owner's first active contract or a "Where do you own?" pick on the gate,
  which also preselects Add contract's home resort after checkout.
- **Locked in = new Price for any increase:** Stripe keeps existing
  subscribers on their Price, so raise the price by creating a new Price
  and swapping `STRIPE_PRICE_ID`, never by editing subscriptions. A lapsed
  member who rejoins pays the then-current price (terms.html says so).
- **No lifetime plan for now.** The 50-subscriber validation target is about
  renewals, costs recur (Supabase, email, yearly chart updates), and
  lifetime caps what the most engaged owners pay. Revisit only as a capped
  offer once there's renewal data.
- **Promotion codes are on** (`allow_promotion_codes` in
  create-checkout-session) so launch/community discounts need no deploy.
- **Sales tax: Stripe Managed Payments (merchant of record)**, ~3.5% on top of
  processing. Chosen for zero filing burden (incl. Canada/UK/EU owners), not
  for NC itself -- NC generally doesn't tax SaaS. Needs: an eligible SaaS tax
  code on the Product, API version 2025-03-31.basil+ in
  create-checkout-session, and no tax/statement-descriptor/invoice params on
  the session. Checkout reads "Sold through Link" and asks for a billing
  address; Stripe may refund within 60 days or for cooling-off rules.
  Verify in the test walkthrough that Manage Membership (Customer Portal)
  can cancel a Managed Payments subscription.
- **Sign in with Apple deferred** until 50+ paid subscriptions ($99/yr
  Apple Developer fee).

### Still open

1. **ToS / Privacy Policy updates.** Need to mention: recurring annual
   billing, the 7-day trial and when it converts to a charge, how to
   cancel, the no-refunds policy, and that Stripe (a third party)
   processes payment and this app never sees/stores card numbers. If
   there's no ToS/Privacy page yet, one needs to exist before taking
   payment.

---

## Phase 1 — Stripe account setup

Checklist, split by who actually did/does each part:

1. ~~Create an account at stripe.com.~~ **Done** — a test-mode account
   ("DVC Companion", `acct_1UH5pq0R8PeF3sQT`) was already connected via the
   Stripe MCP plugin.
2. ~~Start in test mode.~~ **Done** — that's the account's current mode;
   nothing below touched live mode.
3. **Still you:** fill in business profile + identity verification + bank
   account for payouts (Settings → Business settings) — required before
   *live* charges, not required to build/test, so it's the one Phase 1
   item left genuinely blocked on you (needs your own SSN/bank login).
4. ~~Create a Product and Price.~~ **Done via the Stripe API** — Product
   `prod_VHfN2CGNzzFZX9` ("DVC Companion Membership"), Price
   `price_1UH62o0R8PeF3sQT4ijp8aT6` ($49.99/yr, recurring -- superseded:
   live mode needs a new $25/yr Price, see "Price revisited"). The 7-day
   trial isn't a property of the Price itself (Stripe applies trials at
   Checkout Session creation) — `create-checkout-session` passes
   `subscription_data.trial_period_days: 7` on every session it creates
   (see Phase 3).
5. **Still you:** turn on the **Customer Portal** (Settings → Billing →
   Customer portal) and enable "Cancel subscriptions," "Update payment
   method," business name/support email/ToS+Privacy links. The
   plugin's API surface only exposes *reading* portal configurations, not
   creating/enabling one — this one's a Dashboard-only step. This is the
   entire cancel/manage UI otherwise — nothing to build for it beyond the
   link `create-portal-session` already returns.
6. **Still you (decision):** Stripe Tax (Settings → Tax) — auto-
   calculates/remits sales tax per state for digital subscriptions. Not
   wired into the Checkout Session yet either way; flip it on in the
   Dashboard first, then `automatic_tax: { enabled: true }` can be added to
   `create-checkout-session`'s session params.
7. **Still you:** grab the **test-mode secret key** (Developers → API
   keys) — needed for `supabase secrets set STRIPE_SECRET_KEY=sk_test_...`
   in Phase 3. Never share/commit this key; the plugin's own API calls
   don't expose it back to me either.

---

## Phase 2 — Database schema — **Built**

`db/migrations/014_add_subscriptions.sql` (and the matching block in
`db/schema.sql` for fresh installs) — one deviation from the original
sketch: `user_id` is `unique`, not just indexed, so `create-checkout-
session`/`stripe-webhook` can `upsert(..., { onConflict: "user_id" })`
instead of a separate select-then-insert-or-update. There's only ever one
membership per user regardless of how many times they resubscribe.

```sql
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  status text not null default 'incomplete', -- Stripe's own status strings: incomplete/trialing/active/past_due/canceled/unpaid/...
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create unique index if not exists subscriptions_stripe_customer_id_idx on subscriptions(stripe_customer_id);
create unique index if not exists subscriptions_stripe_subscription_id_idx on subscriptions(stripe_subscription_id) where stripe_subscription_id is not null;

alter table subscriptions enable row level security;

create policy "subscriptions: select own" on subscriptions
  for select using (auth.uid() = user_id);
-- No insert/update/delete policy for users -- only the webhook/checkout
-- Edge Functions (service role) ever write here, same trust model as
-- reminder_log.
```

A `subscriptions` table (not columns bolted onto `profiles`) mirrors how
`contracts`/`trips`/`itineraries` are already modeled here, and keeps
`profiles` about preferences rather than billing state — also makes
"reuse the customer, look up by `stripe_customer_id`" trivial for the
webhook.

**Still needs you:** run `db/migrations/014_add_subscriptions.sql` in the
Supabase SQL editor against the live `dvcalc_start` project — nothing in
this repo runs migrations automatically, same as every prior one.

---

## Phase 3 — Backend: 3 Supabase Edge Functions — **Built**

`supabase/functions/create-checkout-session/`,
`supabase/functions/stripe-webhook/`,
`supabase/functions/create-portal-session/` — same Deno pattern as Phase 5
(`send-banking-reminders`/`unsubscribe-reminders`), using
`https://esm.sh/stripe@17?target=deno` with `Stripe.createFetchHttpClient()`
(and, for the webhook, `Stripe.createSubtleCryptoProvider()` for signature
verification — Deno's runtime needs the Web Crypto variant, not Node's).

1. **`create-checkout-session`** (authenticated — default JWT
   verification, gateway rejects unauthenticated calls before the code
   runs) — looks up or creates a Stripe Customer for that user (stores the
   id in `subscriptions` on first creation, status `incomplete`), creates
   a Checkout Session for `STRIPE_PRICE_ID` with `subscription_data:
   { trial_period_days: 7 }` and `success_url`/`cancel_url` pointing back
   at `account.html?checkout=success|cancelled`, returns the session URL.
   `auth.js`'s `subscribeToMembership()` calls it via
   `supabase.functions.invoke()` (which attaches the caller's JWT
   automatically) and the frontend just redirects `window.location` to
   the returned URL — Stripe hosts the entire payment form.
2. **`stripe-webhook`** (public — deploy with `--no-verify-jwt` like
   `unsubscribe-reminders`, Stripe can't send a Supabase Authorization
   header) — verifies the `Stripe-Signature` header against
   `STRIPE_WEBHOOK_SECRET` (critical: without this, anyone could POST a
   fake "payment succeeded"). Handles:
   - `checkout.session.completed` → retrieves the full Subscription and
     upserts the `subscriptions` row, using `metadata.supabase_user_id`
     (set at Checkout Session creation) to resolve which user it belongs to
   - `customer.subscription.created`/`.updated` → sync status/period
     end/cancel flag, resolving the user by `stripe_customer_id` this time
     (later events carry no metadata of their own)
   - `customer.subscription.deleted` → mark canceled
   - `invoice.payment_failed` → mark past_due (Phase 7 still owns deciding
     a grace period before this would ever gate a feature off — Stripe
     auto-retries a few times before actually canceling)
3. **`create-portal-session`** (authenticated, same pattern as #1) — looks
   up the caller's `stripe_customer_id`, creates a Billing Portal session,
   returns the URL. `auth.js`'s `manageMembership()` wraps it. This one
   link is the entire cancel/update-card/view-invoices UI.

**Done (2026-09-18, test mode):** all 3 secrets set
(`STRIPE_SECRET_KEY`/`STRIPE_PRICE_ID` by you, `STRIPE_WEBHOOK_SECRET` by
me after creating the endpoint below), all 3 functions deployed and
`ACTIVE` (`create-checkout-session`/`create-portal-session` with default
JWT verification, `stripe-webhook` with `--no-verify-jwt`), and the
webhook endpoint itself (`we_1UH7fS0R8PeF3sQTCsJ6Jequ`) created directly
via the Stripe API pointing at
`https://afqhmtqwjtjkjahepqxv.supabase.co/functions/v1/stripe-webhook`
with the 5 events above selected.

---

## Phase 4 — Frontend — **Built**

- A **`.membership-card`** in `account.html`, rendered above "Your
  Contracts" (`buildMembershipCardHTML()`/`membershipCardState()`) — shows
  current state (Free / Active, renews `<date>` / Active Member (trial) /
  Canceled, access until `<date>` / Payment issue) read from
  `getSubscription()`, plus one button (`handleMembershipAction()`):
  - Free/canceled → "Upgrade -- $49.99/yr" → calls
    `subscribeToMembership()` (`create-checkout-session`), redirects.
  - Anything else → "Manage Membership" → calls `manageMembership()`
    (`create-portal-session`), redirects.
- Handles the Checkout return redirect (`account.html?checkout=success` /
  `?checkout=cancelled`, `buildCheckoutReturnBannerHTML()`) — shows a
  confirmation banner, strips the query param via `history.replaceState`,
  and on success polls `getSubscription()` a few times 1.5s apart
  (`startCheckoutSuccessPoll()`) since the webhook may land a second or
  two after the redirect.
- `auth.js` gained `getSubscription()`, `subscribeToMembership()`, and
  `manageMembership()` alongside the existing `getProfile()` — the latter
  two wrap `supabase.functions.invoke()`, which attaches the signed-in
  user's JWT automatically.
- **Pricing-anchor micro-copy (2026-09-19):** the Free-state card now shows
  a second line under the existing "Upgrade to Active Member..." detail —
  `pricingAnchorMicroCopy()` divides `MEMBERSHIP_PRICE` ($49.99, now the one
  source of truth the button text also reads from, instead of two
  independently-hardcoded "$49.99" strings) by `data/data.js`'s existing
  `DUES_PER_POINT[resortId]` to state the price as "less than the annual
  dues on N.N points at `<resort>`." Personalizes to the visitor's own
  first active contract's home resort when one exists (falls back to
  Saratoga Springs, a representative WDW resort, otherwise — not
  cherry-picked for the flattering number, every resort's dues rate is
  real) — a genuinely "dynamic" anchor rather than one hardcoded example.
  Pairs it with the risk-mitigation angle in the same sentence ("cheaper
  than what one missed banking deadline can cost you") rather than a
  separate line, tying the price directly to the paid tier's actual
  flagship feature (banking/borrowing deadline reminders) instead of a
  generic scare line. Skips rendering entirely (returns `""`) for a resort
  with no real dues data rather than showing a wrong number.

---

## Phase 5 — Testing (test mode, before touching anything real)

1. Install the Stripe CLI, `stripe login`.
2. `stripe listen --forward-to <deployed-or-local-webhook-url>` to receive
   webhooks while testing; `stripe trigger checkout.session.completed` for
   a quick sanity check before a full run.
3. Full manual run: sign in as a test user → Upgrade → pay with Stripe's
   test card `4242 4242 4242 4242` any future expiry/any CVC → confirm the
   `subscriptions` row appears and the card updates to "Active" → open
   "Manage Membership" → cancel → confirm the webhook flips status and the
   card reflects it (Stripe cancels at period end by default, so this
   should show "Canceled, access until `<date>`," not disappear instantly).

---

## Phase 6 — Go live

1. Finish Stripe's business/identity/bank verification if not already done
   (Phase 1 step 3) — required before *live* mode can accept real charges.
2. Create a **live-mode** version of the Product/Price and the webhook
   endpoint (test and live are entirely separate in Stripe — separate keys,
   separate webhook secret).
3. Swap `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/`STRIPE_PRICE_ID`
   secrets to their live-mode values.
4. Publish the ToS/Privacy Policy updates from Phase 0.
5. Run one real transaction yourself (small, refundable) before announcing
   anything publicly.

---

## Phase 4b — Feature gate — **Built (2026-09-22), client-side only**

`auth.js` now enforces the tier split above: `hasMembership()` (`active`/
`trialing`/`past_due`), owner-data reads return `[]` and writes return
`MEMBERSHIP_REQUIRED_ERROR` for non-members, and each owner page shows a
"Start 7-day free trial" card (`renderMembershipGate()`). The
`send-banking-reminders` function skips non-members (needs a redeploy).
`MEMBERSHIP_GATE_ENABLED` in both files turns it all off. **Shipped off
(2026-09-22)** in both `auth.js` and `send-banking-reminders` — Stripe is still
test-mode only, so turning it on would gate every owner out of their own data
with no way to subscribe. Flip both to `true` as part of Phase 6.

**Before relying on it:**
- Live-mode Stripe (Phase 6) must exist first, or nobody can subscribe.
- Give your own account an `active` `subscriptions` row (SQL editor) or you'll
  be gated out of your own contracts.
- It's not a security boundary: RLS still lets any signed-in user read/write
  their own rows directly. Server-side enforcement would mean adding a
  membership check to the owner-table RLS policies.

## Phase 7 — Later / optional

- Wire `subscriptions.status = 'active'` into the "Active Member Pass"
  Trophy Case badge (CLAUDE.md #19 — this is what was blocking it).
- Decide a grace period on `past_due` before any gated feature (if you add
  real gating later) actually locks — don't punish someone for one failed
  card charge before Stripe's own retries are exhausted.
- Annual plan / discount code support, if monthly-only was the Phase 1
  starting choice.

---

## What you have to do vs. what got built

| Still yours (Stripe Dashboard/legal/CLI) | Built (this session, in this repo/Stripe API) |
|---|---|
| Verify identity/bank (Settings → Business settings) | Stripe Product + Price created (test mode) |
| Enable + configure Customer Portal | `db/migrations/014_add_subscriptions.sql` + `db/schema.sql` |
| Decide Stripe Tax on/off | 3 Edge Functions (checkout, webhook, portal) |
| Write/publish ToS + Privacy Policy updates | Membership card in `account.html` |
| `supabase secrets set` for the 3 Stripe keys | `getSubscription()`/`subscribeToMembership()`/`manageMembership()` in `auth.js` |
| `supabase functions deploy` the 3 functions | Webhook signature verification |
| Register webhook endpoint, copy signing secret in | Checkout-return handling + poll |
| Run the Phase 5 test-mode walkthrough | |
| Flip test → live when ready (Phase 6) | |
