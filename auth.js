// Optional account layer for DVCalc. Loaded as a <script type="module"> on
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
async function addContract(contract) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { data, error } = await supabase
    .from("contracts")
    .insert({ ...contract, user_id: currentSession.user.id })
    .select()
    .single();
  return { data, error: error?.message };
}

async function updateContract(id, patch) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { data, error } = await supabase
    .from("contracts")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  return { data, error: error?.message };
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

// patch: { reminder_opt_in, reminder_lead_days, display_name }
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
// points_used, custom_cash_value, notes } -- user_id filled in here, same
// reasoning as addContract().
async function addTrip(trip) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const payload = { ...trip, user_id: currentSession.user.id };
  let { data, error } = await supabase.from("trips").insert(payload).select().single();
  if (error && isMissingColumnError(error, "custom_cash_value")) {
    const { custom_cash_value, ...rest } = payload;
    ({ data, error } = await supabase.from("trips").insert(rest).select().single());
    if (!error) return { data, warning: "Trip saved, but the cash value wasn't stored -- the database needs db/migrations/002_add_trip_custom_cash_value.sql run against it." };
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
  return { data, error: error?.message };
}

async function deleteTrip(id) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { error } = await supabase.from("trips").delete().eq("id", id);
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

window.DVCAuth = {
  signInWithGoogle,
  signOut,
  onAuthChange,
  getSession,
  getContracts,
  addContract,
  updateContract,
  deleteContract,
  getProfile,
  updateProfile,
  getTrips,
  addTrip,
  updateTrip,
  deleteTrip,
  getUserResortAccess,
  isConfigured: () => configured,
};
