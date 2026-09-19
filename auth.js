// Optional account layer for DVC Companion. Loaded as a <script type="module"> on
// index.html and compare.html. Exposes window.DVCAuth so the existing
// non-module scripts (app.js, compare.html's inline script) can call it
// like any other global -- the same idiom those already use for data.js's
// globals.
//
// Anonymous usage must never depend on this file loading or working --
// every consumer should treat window.DVCAuth as possibly unconfigured, and
// the rest of the site must render identically whether or not it is.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// From the dvcalc_start Supabase project's Settings -> API page. The
// publishable key (Supabase's newer name for what used to be called the
// "anon key") is safe to expose client-side by design -- it has no power on
// its own; Row Level Security in the database (db/schema.sql) is what
// actually gates access to each user's own rows.
const SUPABASE_URL = "https://afqhmtqwjtjkjahepqxv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_moCeyHUFBzY6dKmQjHY9kw_4w2Pho3k";

const configured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

if (!configured) {
  console.warn("[DVCAuth] Not configured yet -- set SUPABASE_URL/SUPABASE_ANON_KEY in auth.js. Sign-in is disabled; everything else on the site works normally.");
}

const listeners = [];
let currentSession = null;

function notify() {
  for (const cb of listeners) cb(currentSession);
}

async function init() {
  if (!configured) return;
  const { data } = await supabase.auth.getSession();
  currentSession = data.session;
  notify();
  supabase.auth.onAuthStateChange((_event, session) => {
    currentSession = session;
    notify();
  });
}

// ---- Google Identity Services (client-side ID token) sign-in ----
// The classic supabase.auth.signInWithOAuth() redirect flow below has one
// unavoidable cosmetic downside: Supabase (not this app) holds the OAuth
// Client Secret and does the code exchange server-side, so Google's
// registered redirect_uri is necessarily Supabase's own domain
// (afqhmtqwjtjkjahepqxv.supabase.co) -- meaning Google's "Choose an
// account" screen always shows that domain, not "DVC Companion" or
// dvccompanion.com, no matter how the OAuth consent screen is branded.
// That's tied to the redirect *destination*, not branding, and isn't
// fixable without paying for a Supabase custom Auth domain.
//
// This sidesteps the problem: Google Identity Services (GSI) issues an ID
// token directly in the browser -- no server-side redirect to anyone --
// so Google only ever sees this page's own origin (dvccompanion.com), a
// domain we actually own. supabase.auth.signInWithIdToken() then hands
// that token to Supabase to create the session exactly as the redirect
// flow did. GOOGLE_CLIENT_ID is the OAuth Client ID (not secret) already
// used for the redirect flow's "Web client 1" credential -- Client IDs
// are meant to be public, unlike the Client Secret, which stays in
// Supabase's own provider config and is never touched by this file. It's
// already in that provider's "Client IDs" allow-list (shared with the
// redirect flow), so no Supabase-side config change was needed for this.
//
// google.accounts.id.prompt() (One Tap) was tried first here and dropped --
// it's best-effort by design, and in practice (confirmed both in automated
// testing and by the real user on a real device) it frequently shows no UI
// at all and never fires a usable callback. An invisible renderButton()
// overlaid on top of our own purple button was tried next and also
// dropped -- Google's button actively resists being hidden/overlaid (an
// anti-clickjacking measure on Google's end), so the click silently fell
// through to the old redirect flow instead of ever reaching Google's
// button. What's left, and what Google's own docs actually document as the
// supported path, is showing Google's real, visible renderButton() in
// place of our own purple button -- see enhanceSignInButton() below. Our
// button stays in the DOM (hidden) as a fallback if the Google button
// can't be rendered at all (script blocked, offline, etc.), so sign-in
// never just stops working.
const GOOGLE_CLIENT_ID = "763559252369-1jjbee4gpuedblkv8399u2d8qf275kb7.apps.googleusercontent.com";

let gsiScriptPromise = null;
function loadGoogleIdentityScript() {
  if (gsiScriptPromise) return gsiScriptPromise;
  gsiScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(s);
  });
  return gsiScriptPromise;
}

// A fresh nonce per attempt -- passed to both GSI and signInWithIdToken()
// (which checks it matches), so a captured/replayed token from elsewhere
// can't be reused to sign in as someone else. IMPORTANT: Google embeds
// whatever we hand its initialize() call *directly* as the ID token's
// nonce claim, but Supabase's signInWithIdToken() takes the RAW nonce and
// hashes it itself before comparing against that claim -- so Google must
// be given the SHA-256 hash (sha256Hex(raw) below) while Supabase must be
// given the original raw value. Passing the same string to both (as an
// earlier version of this file did) makes every sign-in fail that
// comparison and silently fall back to the redirect flow.
function randomNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// Set fresh by enhanceSignInButton() each time it (re-)initializes GSI --
// handleCredentialResponse() always reads whichever nonce is current, since
// only one init is ever "live" at a time no matter how many buttons on the
// page got enhanced.
let gsiNonce = null;

async function handleCredentialResponse(response) {
  try {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: response.credential,
      nonce: gsiNonce,
    });
    if (error) throw error;
  } catch (err) {
    // Covers a stale/invalid token or any other exchange failure -- falls
    // back to the classic redirect flow so sign-in still completes.
    console.warn("[DVCAuth] ID token sign-in failed, falling back to redirect flow:", err);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
  }
}

// Replaces `btn` (visually) with Google's own real, visible renderButton()
// -- see the big comment above for why this is the option left standing.
// `btn` itself is only hidden, not removed, and stays fully wired to its
// original click listener (signInWithGoogle()) so it can reappear as a
// working fallback if renderButton() never successfully renders. Safe to
// call more than once on the same element (the dataset flag makes repeat
// calls a no-op), so callers can re-scan liberally instead of tracking
// which buttons are already done.
function enhanceSignInButton(btn) {
  if (!configured || !btn || btn.dataset.gsiEnhanced) return;
  btn.dataset.gsiEnhanced = "1";
  const isGate = btn.id === "gate-signin"; // the big full-page gate button gets Google's larger button; the compact nav pill gets the medium one
  loadGoogleIdentityScript().then(async () => {
    gsiNonce = randomNonce();
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      nonce: await sha256Hex(gsiNonce),
      use_fedcm_for_prompt: true,
    });

    const container = document.createElement("span");
    container.style.display = "inline-block";
    btn.insertAdjacentElement("afterend", container);
    window.google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: isGate ? "large" : "medium",
      shape: "pill",
      text: "signin_with",
      logo_alignment: "left",
    });
    btn.style.display = "none"; // only hidden after renderButton() succeeds, so a thrown error leaves our own button visible and working
  }).catch((err) => {
    // btn's own click handler (signInWithGoogle(), below) is untouched and
    // still visible -- this enhancement never actually replaced it, so a
    // failure here never breaks sign-in.
    console.warn("[DVCAuth] Google's real sign-in button unavailable, falling back to our own button + redirect flow:", err);
  });
}

// Re-scans for every known "Sign in with Google" button on the page -- the
// shared nav one (#account-signin, rebuilt from scratch by
// renderAccountControl() on every auth-state change) plus each page's own
// full-page gate (#gate-signin, rendered asynchronously by that page's own
// script once it knows the user is signed out). enhanceSignInButton()'s
// dataset guard makes repeat calls cheap, so this gets called liberally
// rather than trying to track the one right moment to call it.
function enhanceAllSignInButtons() {
  document.querySelectorAll("#account-signin, #gate-signin").forEach(enhanceSignInButton);
}

// The plain click-triggered fallback -- still wired to every existing
// button (nav and gate alike) exactly as before. Once
// enhanceSignInButton() successfully renders Google's real button, our own
// button is hidden and this listener is simply never reachable by a real
// click anymore, so this only actually runs when Google's button couldn't
// be rendered at all.
async function signInWithGoogle() {
  if (!configured) {
    console.warn("[DVCAuth] Sign-in unavailable: Supabase not configured.");
    return;
  }
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.href },
  });
}

async function signOut() {
  if (!configured) return;
  await supabase.auth.signOut();
}

// Permanently deletes the signed-in user's auth account, which cascades
// (via `on delete cascade` FKs, see db/schema.sql) through profiles,
// contracts, trips, itineraries, and reminder_log -- nothing survives.
// Regular client roles can't DELETE from auth.users directly, so this calls
// a SECURITY DEFINER Postgres function (db/migrations/005) that does it on
// the caller's own behalf, scoped to auth.uid() server-side -- there's no
// way to pass a different user's id through this call.
async function deleteAccount() {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { error } = await supabase.rpc("delete_own_account");
  if (!error) await supabase.auth.signOut();
  return { error: error?.message };
}

// Registers a callback for session changes, and fires it immediately with
// whatever's currently known (possibly null) so late-registering consumers
// don't have to separately ask for the initial state.
function onAuthChange(cb) {
  listeners.push(cb);
  cb(currentSession);
}

function getSession() {
  return currentSession;
}

// Returns every contract for the signed-in user, active and inactive alike
// -- account.html needs to show/reactivate inactive ones, so filtering to
// active-only happens in whichever consumer only cares about that (e.g.
// personalization, once Phase 3 wires it up), not here.
async function getContracts() {
  if (!configured || !currentSession) return [];
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[DVCAuth] getContracts failed:", error.message);
    return [];
  }
  return data;
}

// contract: { home_resort_id, use_year, points_per_year, purchase_type,
// purchase_price, purchase_date, nickname } -- user_id is filled in here,
// not by the caller, since RLS requires it to match the authenticated user.
// A contract's points balance lives separately, per use year, in
// contract_year_points -- see getContractYearPoints()/upsertContractYearPoints().
async function addContract(contract) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const payload = { ...contract, user_id: currentSession.user.id };
  let { data, error } = await supabase.from("contracts").insert(payload).select().single();
  if (error && isMissingColumnError(error, "blue_card_override")) {
    const { blue_card_override, ...rest } = payload;
    ({ data, error } = await supabase.from("contracts").insert(rest).select().single());
    if (!error) return { data, warning: "Contract saved, but the Blue Card override wasn't stored -- the database needs db/migrations/013_add_contract_blue_card_override.sql run against it." };
  }
  return { data, error: error?.message };
}

async function updateContract(id, patch) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  let { data, error } = await supabase.from("contracts").update(patch).eq("id", id).select().single();
  if (error && isMissingColumnError(error, "blue_card_override")) {
    const { blue_card_override, ...rest } = patch;
    ({ data, error } = await supabase.from("contracts").update(rest).eq("id", id).select().single());
    if (!error) return { data, warning: "Contract saved, but the Blue Card override wasn't stored -- the database needs db/migrations/013_add_contract_blue_card_override.sql run against it." };
  }
  return { data, error: error?.message };
}

// Every contract_year_points row for the signed-in user, across all their
// contracts (account.html groups these by contract_id client-side) -- same
// fetch-everything-and-group pattern as getContracts()/getTrips().
async function getContractYearPoints() {
  if (!configured || !currentSession) return [];
  const { data, error } = await supabase
    .from("contract_year_points")
    .select("*")
    .order("use_year_label", { ascending: true });
  if (error) {
    console.error("[DVCAuth] getContractYearPoints failed:", error.message);
    return [];
  }
  return data;
}

// row: { contract_id, use_year_label, points_remaining, points_banked,
// points_borrowed, points_holding } -- upsert (not insert/update) since the caller doesn't
// know whether this (contract_id, use_year_label) pair already has a row;
// db/migrations/007_add_contract_year_points_ledger.sql's unique
// constraint on that pair is what makes the upsert target unambiguous.
async function upsertContractYearPoints(row) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { data, error } = await supabase
    .from("contract_year_points")
    .upsert({ ...row, user_id: currentSession.user.id }, { onConflict: "contract_id,use_year_label" })
    .select()
    .single();
  return { data, error: error?.message };
}

async function deleteContractYearPoints(id) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { error } = await supabase.from("contract_year_points").delete().eq("id", id);
  return { error: error?.message };
}

async function getUserBadges() {
  if (!configured || !currentSession) return [];
  const { data, error } = await supabase.from("user_badges").select("*");
  if (error) {
    console.error("[DVCAuth] getUserBadges failed:", error.message);
    return [];
  }
  return data;
}

// patch: { badge_id, tier, event_count } -- upsert (not insert/update)
// since the caller doesn't know whether this (user_id, badge_id) pair
// already has a row; db/migrations/008_add_user_badges.sql's unique
// constraint on that pair is what makes the upsert target unambiguous.
// Callers are responsible for only ever passing a tier/event_count that's
// >= what's already stored -- this function doesn't enforce the
// high-water-mark rule itself, it just writes what it's given.
async function upsertUserBadge(patch) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { data, error } = await supabase
    .from("user_badges")
    .upsert({ ...patch, user_id: currentSession.user.id }, { onConflict: "user_id,badge_id" })
    .select()
    .single();
  return { data, error: error?.message };
}

// { [badge_id]: { unlockedCount, totalMembers } }, or null if the RPC
// isn't deployed yet (db/migrations/009_add_badge_rarity_stats.sql) or
// any other failure -- callers should just skip the rarity line, never
// substitute a made-up number.
async function getBadgeRarityStats() {
  if (!configured || !currentSession) return null;
  const { data, error } = await supabase.rpc("badge_rarity_stats");
  if (error || !data) return null;
  const map = {};
  for (const row of data) {
    map[row.badge_id] = { unlockedCount: Number(row.unlocked_count), totalMembers: Number(row.total_members) };
  }
  return map;
}

// Fire-and-forget event counter for click/action-driven badges (Resourceful
// Explorer, Just One More Night, The Re-Checker, Split-Stay Scientist,
// Night Owl) -- these have no other durable record anywhere in the schema,
// unlike tiered badges derived from contracts/trips/itineraries. Routed
// through a Postgres function (db/migrations/010_add_increment_badge_event.sql)
// so the increment is atomic -- a client-side read-then-upsert would lose
// counts to a race if two tabs/devices fire the same event close together.
// Silently no-ops when signed out/unconfigured, same as upsertUserBadge.
async function incrementBadgeEvent(badgeId) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { error } = await supabase.rpc("increment_badge_event", { p_badge_id: badgeId });
  if (error) console.error("[DVCAuth] incrementBadgeEvent failed:", error.message);
  return { error: error?.message };
}

async function deleteContract(id) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { error } = await supabase.from("contracts").delete().eq("id", id);
  return { error: error?.message };
}

async function getProfile() {
  if (!configured || !currentSession) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", currentSession.user.id)
    .single();
  if (error) {
    console.error("[DVCAuth] getProfile failed:", error.message);
    return null;
  }
  return data;
}

// patch: { reminder_opt_in, reminder_lead_days, display_name,
//          in_app_notifications_enabled, push_enabled, push_subscription }
async function updateProfile(patch) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", currentSession.user.id)
    .select()
    .single();
  return { data, error: error?.message };
}

// The signed-in user's membership row, or null if they've never started a
// checkout (no row yet -- not the same as "free tier," just "no billing
// relationship exists"). See docs/subscriptions_plan.md -- read-only here
// by design, the row is written only by the stripe-webhook Edge Function.
async function getSubscription() {
  if (!configured || !currentSession) return null;
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", currentSession.user.id)
    .maybeSingle();
  if (error) {
    console.error("[DVCAuth] getSubscription failed:", error.message);
    return null;
  }
  return data;
}

// supabase-js's functions.invoke() collapses any non-2xx response into a
// generic FunctionsHttpError ("Edge Function returned a non-2xx status
// code") on `error.message` -- the actual {error: "..."} body our
// functions return (see create-checkout-session/create-portal-session's
// own try/catch) only comes through on `error.context`, a raw Response
// that has to be read separately. Falls back to the generic message if
// the body isn't there or isn't JSON.
async function readFunctionError(error) {
  if (error?.context?.json) {
    try {
      const body = await error.context.json();
      if (body?.error) return body.error;
    } catch { /* not a JSON body -- fall through to the generic message */ }
  }
  return error?.message || "Something went wrong";
}

// Calls the create-checkout-session Edge Function and returns its Stripe
// Checkout URL for the caller to redirect to -- supabase-js's
// functions.invoke() attaches the current session's JWT as the
// Authorization header automatically, which is how that function
// identifies the caller (see its own comment header).
async function subscribeToMembership() {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { data, error } = await supabase.functions.invoke("create-checkout-session");
  if (error) return { error: await readFunctionError(error) };
  if (data?.error) return { error: data.error };
  return { url: data?.url };
}

// Calls create-portal-session and returns its Stripe Billing Portal URL --
// the entire cancel/update-card/view-invoices UI lives there, nothing
// else to build for it.
async function manageMembership() {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { data, error } = await supabase.functions.invoke("create-portal-session");
  if (error) return { error: await readFunctionError(error) };
  if (data?.error) return { error: data.error };
  return { url: data?.url };
}

async function getTrips() {
  if (!configured || !currentSession) return [];
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("check_in", { ascending: false });
  if (error) {
    console.error("[DVCAuth] getTrips failed:", error.message);
    return [];
  }
  return data;
}

// Detects PostgREST's "column doesn't exist yet" error, which shows up if
// a database hasn't had db/migrations/002_add_trip_custom_cash_value.sql
// run against it -- lets addTrip/updateTrip degrade gracefully (drop the
// unsupported field and retry) instead of failing the whole save over one
// optional column.
function isMissingColumnError(error, column) {
  const msg = error?.message?.toLowerCase() || "";
  return msg.includes("could not find") && msg.includes(`'${column.toLowerCase()}'`);
}

// trip: { contract_id, resort_id, room_type_id, check_in, check_out,
// points_used, custom_cash_value, notes, points_source_breakdown } --
// user_id filled in here, same reasoning as addContract().
async function addTrip(trip) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const payload = { ...trip, user_id: currentSession.user.id };
  let { data, error } = await supabase.from("trips").insert(payload).select().single();
  if (error && isMissingColumnError(error, "custom_cash_value")) {
    const { custom_cash_value, ...rest } = payload;
    ({ data, error } = await supabase.from("trips").insert(rest).select().single());
    if (!error) return { data, warning: "Trip saved, but the cash value wasn't stored -- the database needs db/migrations/002_add_trip_custom_cash_value.sql run against it." };
  }
  if (error && isMissingColumnError(error, "points_source_breakdown")) {
    const { points_source_breakdown, ...rest } = payload;
    ({ data, error } = await supabase.from("trips").insert(rest).select().single());
    if (!error) return { data, warning: "Trip saved, but the point-source breakdown wasn't stored -- the database needs db/migrations/012_add_trip_points_source_breakdown.sql run against it." };
  }
  return { data, error: error?.message };
}

async function updateTrip(id, patch) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  let { data, error } = await supabase.from("trips").update(patch).eq("id", id).select().single();
  if (error && isMissingColumnError(error, "custom_cash_value")) {
    const { custom_cash_value, ...rest } = patch;
    ({ data, error } = await supabase.from("trips").update(rest).eq("id", id).select().single());
    if (!error) return { data, warning: "Trip saved, but the cash value wasn't stored -- the database needs db/migrations/002_add_trip_custom_cash_value.sql run against it." };
  }
  if (error && isMissingColumnError(error, "points_source_breakdown")) {
    const { points_source_breakdown, ...rest } = patch;
    ({ data, error } = await supabase.from("trips").update(rest).eq("id", id).select().single());
    if (!error) return { data, warning: "Trip saved, but the point-source breakdown wasn't stored -- the database needs db/migrations/012_add_trip_points_source_breakdown.sql run against it." };
  }
  return { data, error: error?.message };
}

async function deleteTrip(id) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { error } = await supabase.from("trips").delete().eq("id", id);
  return { error: error?.message };
}

async function getItineraries() {
  if (!configured || !currentSession) return [];
  const { data, error } = await supabase
    .from("itineraries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[DVCAuth] getItineraries failed:", error.message);
    return [];
  }
  return data;
}

// itinerary: { name, year, segments } -- segments is [{ resortId, roomTypeId,
// checkIn, checkOut }], user_id filled in here, same reasoning as addTrip().
async function addItinerary(itinerary) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { data, error } = await supabase
    .from("itineraries")
    .insert({ ...itinerary, user_id: currentSession.user.id })
    .select()
    .single();
  return { data, error: error?.message };
}

async function deleteItinerary(id) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { error } = await supabase.from("itineraries").delete().eq("id", id);
  return { error: error?.message };
}

// Resorts that only ever book at their own home resort when the contract
// backing them was bought resale -- verified against DVC's post-Jan-2019
// resale restriction policy (last verified 2026-09-03; Disney has changed
// this list before and could again -- re-check periodically, don't assume
// it's permanent). Direct-purchased points have no restriction anywhere.
const HOME_ONLY_RESALE_RESORTS = new Set(["rivieraResort", "disneylandHotel", "fortWildernessCabins"]);

// Pure function: no DOM, no network. Takes the contracts array (as returned
// by getContracts()) plus the full list of resort ids currently in data.js,
// and returns which resorts this user can book and how. Access unions
// permissively across multiple contracts -- owning even one unrestricted
// way into a resort makes it bookable, regardless of what any single other
// contract alone would say.
function getUserResortAccess(contracts, allResortIds) {
  const homeResortIds = new Set();
  const sevenMoResortIds = new Set();

  for (const c of contracts) {
    homeResortIds.add(c.home_resort_id);

    if (c.purchase_type === "direct") {
      // No restriction at all -- everywhere is at least 7-month-bookable.
      for (const id of allResortIds) sevenMoResortIds.add(id);
      continue;
    }

    // Resale at one of the three home-only resorts grants no 7-month access
    // anywhere else, and doesn't restrict access granted by other contracts.
    if (HOME_ONLY_RESALE_RESORTS.has(c.home_resort_id)) continue;

    // Resale at any other resort: 7-month access to every resort except
    // the three home-only ones.
    for (const id of allResortIds) {
      if (!HOME_ONLY_RESALE_RESORTS.has(id)) sevenMoResortIds.add(id);
    }
  }

  const restrictedResortIds = new Set(
    allResortIds.filter(id => !homeResortIds.has(id) && !sevenMoResortIds.has(id))
  );

  return { homeResortIds, sevenMoResortIds, restrictedResortIds };
}

// Direct-purchase minimum points required for Blue Card (Membership Extras)
// eligibility, keyed by the date the contract's points were originally sold
// -- Disney has raised this bar several times, and each new minimum only
// applies to contracts purchased after it took effect. Ascending order;
// anything before the first entry required no minimum at all. Last verified
// 2026-09-17 -- re-check periodically, Disney could move these again.
const BLUE_CARD_MIN_POINTS_BY_DATE = [
  { from: "2016-04-04", minPoints: 25 },
  { from: "2018-02-01", minPoints: 75 },
  { from: "2019-09-01", minPoints: 100 },
  { from: "2020-10-01", minPoints: 125 },
  { from: "2021-06-03", minPoints: 150 },
];

// Resale contracts deeded on/after this date lose access to the Disney
// Collection (using points toward cash Disney hotel rooms, cruises,
// Adventures by Disney, etc.); resale bought before it is "grandfathered"
// and keeps that access. Separate from HOME_ONLY_RESALE_RESORTS above --
// that's about which DVC *resorts* a resale contract can book, this is
// about non-DVC Disney products.
const GENERAL_RESALE_CUTOFF_DATE = "2011-03-21";

function blueCardMinPoints(purchaseDate) {
  // No date on file -- assume the current (highest) bar rather than
  // crediting a perk we can't actually verify was earned.
  if (!purchaseDate) return 150;
  return BLUE_CARD_MIN_POINTS_BY_DATE.reduce(
    (min, tier) => (purchaseDate >= tier.from ? tier.minPoints : min),
    0,
  );
}

// Pure function: no DOM, no network. Given one contract's metadata ({
// purchase_type, purchase_date, points_per_year, home_resort_id,
// blue_card_override }), returns what it unlocks (Blue Card Membership
// Extras) and what it's restricted from (Disney Collection access, or
// booking outside its home resort).
// purchase_date and dates in BLUE_CARD_MIN_POINTS_BY_DATE/
// GENERAL_RESALE_CUTOFF_DATE are all "YYYY-MM-DD" strings (as stored by
// Postgres's date type and produced by <input type="date">), which compare
// correctly with plain string operators -- no Date parsing needed.
//
// blue_card_override is tri-state (null/true/false): the automatic
// determination only ever knows the contract's acquisition YEAR (see
// account.html's Acquisition Year field), not the exact purchase date, so
// a contract bought the same calendar year as a points-minimum threshold
// (2016, 2018, 2019, 2020, 2021) can land on the wrong side of it -- this
// lets an owner who knows their real status correct it. It only ever
// overrides isBlueCardEligible itself, never the resale-restriction logic
// below (that's a separate, unrelated determination).
function evaluateContractPerks(contract) {
  const { purchase_type, purchase_date, points_per_year, home_resort_id, blue_card_override } = contract;
  const isDirect = purchase_type === "direct";
  const autoBlueCardEligible = isDirect && (points_per_year || 0) >= blueCardMinPoints(purchase_date);
  const isBlueCardOverridden = blue_card_override != null;
  const isBlueCardEligible = isBlueCardOverridden ? blue_card_override : autoBlueCardEligible;

  let resaleRestrictionType = "none";
  if (!isDirect) {
    if (HOME_ONLY_RESALE_RESORTS.has(home_resort_id)) {
      // The stricter of the two resale limits -- no 7-month access anywhere
      // else AND no Disney Collection, so it wins over "general_resale".
      resaleRestrictionType = "restricted_home_resort_only";
    } else if (!purchase_date || purchase_date >= GENERAL_RESALE_CUTOFF_DATE) {
      resaleRestrictionType = "general_resale";
    }
  }

  let badgeText, badgeVariant;
  if (resaleRestrictionType === "restricted_home_resort_only") {
    badgeText = "Home Resort Only";
    badgeVariant = "warning";
  } else if (resaleRestrictionType === "general_resale") {
    badgeText = "No Disney Collection";
    badgeVariant = "warning";
  } else if (isBlueCardEligible) {
    badgeText = "Blue Card";
    badgeVariant = "info";
  } else {
    badgeText = isDirect ? "No Membership Extras" : "Resale (Grandfathered)";
    badgeVariant = "neutral";
  }

  return { isBlueCardEligible, isBlueCardOverridden, resaleRestrictionType, badgeText, badgeVariant };
}

// Renders the sign-in/sign-out control into #account-control, present in
// every page's shared site-nav bar. Just the auth state itself -- the nav
// bar's own links (My Contracts, Trip Value, etc.) are static HTML on
// every page regardless of sign-in state, since those pages already show
// their own sign-in gate when visited signed out. Self-contained here
// rather than in an inline page script, since module scripts resolve their
// imports asynchronously -- another script can't safely assume window.DVCAuth
// exists yet just because it appears later in the document.
function renderAccountControl(session) {
  const el = document.getElementById("account-control");
  if (!el) return;

  if (!configured) {
    el.innerHTML = "";
    return;
  }

  if (session) {
    const email = session.user?.email || "Account";
    el.innerHTML = `<button type="button" class="account-btn" id="account-signout">${email} &middot; Sign out</button>`;
    document.getElementById("account-signout").addEventListener("click", signOut);
  } else {
    el.innerHTML = `<button type="button" class="account-btn" id="account-signin">Sign in with Google</button>`;
    document.getElementById("account-signin").addEventListener("click", signInWithGoogle);
  }
}

onAuthChange(renderAccountControl);
init();
// Enhances every "Sign in with Google" button as soon as it exists.
// #account-signin appears/disappears whenever renderAccountControl()
// rebuilds the nav control above; each page's own #gate-signin is rendered
// asynchronously by that page's own script once it knows the user is
// signed out -- there's no single fixed moment after which "the DOM is
// done" a one-time scan could wait for, so a MutationObserver catches
// either button the instant it's inserted, on whichever page put it there.
if (configured) {
  enhanceAllSignInButtons();
  new MutationObserver(enhanceAllSignInButtons).observe(document.body, { childList: true, subtree: true });
}

window.DVCAuth = {
  signInWithGoogle,
  signOut,
  deleteAccount,
  onAuthChange,
  getSession,
  getContracts,
  addContract,
  updateContract,
  deleteContract,
  getContractYearPoints,
  upsertContractYearPoints,
  deleteContractYearPoints,
  getUserBadges,
  upsertUserBadge,
  getBadgeRarityStats,
  incrementBadgeEvent,
  getProfile,
  updateProfile,
  getSubscription,
  subscribeToMembership,
  manageMembership,
  getTrips,
  addTrip,
  updateTrip,
  deleteTrip,
  getItineraries,
  addItinerary,
  deleteItinerary,
  getUserResortAccess,
  evaluateContractPerks,
  isConfigured: () => configured,
};
