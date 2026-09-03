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

// TODO: fill in from your Supabase project's Settings -> API page once the
// project exists (see docs/accounts_plan.md, Phase 0/1). The anon key is
// safe to expose client-side by design -- it has no power on its own; Row
// Level Security in the database (db/schema.sql) is what actually gates
// access to each user's own rows.
const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";

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

async function getContracts() {
  if (!configured || !currentSession) return [];
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("is_active", true);
  if (error) {
    console.error("[DVCAuth] getContracts failed:", error.message);
    return [];
  }
  return data;
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

// Renders the sign-in/sign-out control into #account-control if the current
// page has one (index.html and compare.html both do). Self-contained here
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
  getUserResortAccess,
  isConfigured: () => configured,
};
