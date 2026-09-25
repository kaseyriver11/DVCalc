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
// onAuthChange() calls back with null right away, before the stored
// session has been read; this says whether a null session is real.
let sessionResolved = false;

function notify() {
  for (const cb of listeners) cb(currentSession);
}

async function init() {
  if (!configured) return;
  const { data } = await supabase.auth.getSession();
  currentSession = data.session;
  sessionResolved = true;
  notify();
  supabase.auth.onAuthStateChange((_event, session) => {
    currentSession = session;
    membershipCache = null;
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

// initialize() sets GLOBAL state in the GSI SDK (one callback/nonce for the
// whole page, not per-button) -- cached in a single promise so it only ever
// runs once no matter how many buttons get enhanced. Pages like home.html
// can have several sign-in buttons live at once (one per locked widget);
// without this, enhancing them all back-to-back raced each other's
// randomNonce()/initialize() calls, and whichever one lost the race left
// gsiNonce mismatched against what Google actually signed into the ID
// token -- silently reintroducing the exact nonce bug fixed above.
let gsiInitPromise = null;
function ensureGsiInitialized() {
  if (gsiInitPromise) return gsiInitPromise;
  gsiInitPromise = loadGoogleIdentityScript().then(async () => {
    gsiNonce = randomNonce();
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      nonce: await sha256Hex(gsiNonce),
      use_fedcm_for_prompt: true,
    });
  });
  return gsiInitPromise;
}

// Upgrades `btn` (visually) to Google's own real, visible renderButton()
// -- see the big comment above for why this is the option left standing.
// `btn` itself is only hidden, not removed, and stays fully wired to its
// original click listener (signInWithGoogle()) so it can reappear as a
// working fallback if renderButton() never successfully renders.
// Returns a promise resolving to the <span> wrapping Google's rendered
// button (so renderSignInButton() can measure its real size to match the
// email-code button against, below) or null if enhancement never
// succeeded -- callers that don't care (the legacy enhanceAllSignInButtons()
// shim) can just ignore the return value like before.
function enhanceSignInButton(btn, size) {
  if (!configured || !btn || btn.dataset.gsiEnhanced) return Promise.resolve(null);
  btn.dataset.gsiEnhanced = "1";
  // Only the legacy auto-scan below (enhanceAllSignInButtons()) calls this
  // without a size -- renderSignInButton() always passes one explicitly.
  if (!size) size = (btn.id === "gate-signin" || btn.classList.contains("home-signin-btn")) ? "large" : "medium";
  return ensureGsiInitialized().then(() => {
    const container = document.createElement("span");
    container.style.display = "inline-block";
    btn.insertAdjacentElement("afterend", container);
    window.google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size,
      shape: "pill",
      text: "signin_with",
      logo_alignment: "left",
    });
    btn.style.display = "none"; // only hidden after renderButton() succeeds, so a thrown error leaves our own button visible and working
    return container;
  }).catch((err) => {
    // btn's own click handler (signInWithGoogle(), below) is untouched and
    // still visible -- this enhancement never actually replaced it, so a
    // failure here never breaks sign-in.
    console.warn("[DVCAuth] Google's real sign-in button unavailable, falling back to our own button + redirect flow:", err);
    return null;
  });
}

// The one place any page/widget creates a "Sign in with Google" button --
// builds it with `className` (so each context keeps its own existing
// visual style: nav pill, big full-page gate, home.html card widget),
// wires the click-to-redirect fallback, and immediately tries to upgrade
// it to Google's real button via enhanceSignInButton(). Every sign-in
// surface in the app should call this rather than hand-rolling its own
// <button> + click listener + enhancement call -- that duplication (five
// nearly-identical page-gate copies, plus a home.html copy that used a
// different class than the others) is exactly how a real button went
// unenhanced until a live screenshot caught it.
//
// Also appends the "or sign in with email" trigger (see
// appendEmailCodeTrigger() below) right under the Google button, so every
// one of those same surfaces gets the passwordless email-code option for
// free -- no per-page wiring, same reasoning as the Google button itself.
//
// Everything renders inside a purpose-built .dvc-signin-cluster (flex
// column, align-items: center) rather than depending on whatever
// alignment the passed-in `container` happens to have -- an earlier
// version relied on ambient CSS (some pages centered it via text-align on
// an ancestor, home.html's dashboard banner instead used a `justify-
// content: space-between` flex row), so the email option ended up
// centered on some pages and left-justified on others, a real reported
// bug. Owning the layout here guarantees identical behavior everywhere
// renderSignInButton() is called, regardless of the surrounding page.
function renderSignInButton(container, className, size = "medium") {
  if (!container) return;
  if (!configured) { container.innerHTML = ""; return; }
  injectEmailCodeStyles();
  container.innerHTML = `<div class="dvc-signin-cluster"><button type="button" class="${className}">Sign in with Google</button></div>`;
  const cluster = container.firstElementChild;
  const btn = cluster.firstElementChild;
  btn.addEventListener("click", signInWithGoogle);
  const trigger = appendEmailCodeTrigger(cluster);
  enhanceSignInButton(btn, size).then((googleSpan) => matchEmailTriggerSize(trigger, googleSpan));
}

// Google's real button renders inside a cross-origin iframe, so its
// actual size can only be read back by measuring the wrapping <span> we
// created for it (enhanceSignInButton()) -- it can't be set via CSS,
// since we don't control the iframe's internal layout. Matching our own
// button's min-width/min-height to that MEASURED size, rather than
// guessing fixed px values that can silently drift out of sync with
// whatever size Google actually renders in a given context/locale, is
// what keeps both pills reading as equally-weighted options instead of
// one looking like a smaller afterthought next to the other (also a real
// reported bug). No-ops if Google's button never rendered (googleSpan is
// null) -- the trigger just keeps its own CSS-default size in that case.
function matchEmailTriggerSize(trigger, googleSpan) {
  if (!trigger || !googleSpan) return;
  const rect = googleSpan.getBoundingClientRect();
  if (rect.width > 0) trigger.style.minWidth = Math.round(rect.width) + "px";
  if (rect.height > 0) trigger.style.minHeight = Math.round(rect.height) + "px";
}

// Compatibility shim for pages not yet updated to call renderSignInButton()
// directly -- still auto-detects the old hardcoded button ids/classes
// (#account-signin, #gate-signin, .home-signin-btn) and enhances them the
// same way. Safe to remove once every page creating a sign-in button goes
// through renderSignInButton() instead.
function enhanceAllSignInButtons() {
  document.querySelectorAll("#account-signin, #gate-signin, .home-signin-btn").forEach(btn => enhanceSignInButton(btn));
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

// ---- Passwordless email sign-in (one-time code) ----
// The non-Google alternative: type an email, get a 6-digit code, type the
// code back in, done -- no password to create/remember/reset. Both steps
// go through Supabase's own built-in email-OTP support (no new
// tables/columns -- new users provision a profiles row the exact same way
// Google sign-in already does, via handle_new_user()'s generic `after
// insert on auth.users` trigger, so this file needed zero schema changes).
//
// IMPORTANT (not something this file can do for you): Supabase's default
// "Magic Link" email template only shows a clickable link, not the actual
// numeric code -- verifyEmailCode() below still works once a user has a
// code, but nothing will ever show them one until that template is edited
// (Supabase Dashboard -> Authentication -> Emails -> Magic Link) to
// include `{{ .Token }}` somewhere in the body, e.g. "Your DVC Companion
// code is: {{ .Token }}". This is a one-time account-settings change on
// the Supabase project, so it's left for the app's owner to make (or
// explicitly ask this session's agent to make via the already-linked
// Supabase CLI) rather than done silently here.

// shouldCreateUser: true -- unifies signup and sign-in into one flow (an
// unrecognized email just becomes a new account), matching how Google
// sign-in already never distinguishes "signing up" from "signing in."
async function signInWithEmailCode(email) {
  if (!configured) return { error: "Not configured" };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  return { error: error?.message };
}

// type: "email" covers both the numeric code and the magic-link token
// Supabase issues from the same signInWithOtp() call above -- there's no
// separate "code" vs "link" verification type in supabase-js v2.
async function verifyEmailCode(email, token) {
  if (!configured) return { error: "Not configured" };
  const { data, error } = await supabase.auth.verifyOtp({ email, token: token.trim(), type: "email" });
  return { data, error: error?.message };
}

// Lazily builds the shared 2-step modal (email -> code) once per page load
// and reuses it for every trigger -- there can be several sign-in surfaces
// live at once (home.html's per-widget buttons), and they should all open
// the exact same modal instance rather than each growing their own copy.
let emailCodeModalEl = null;
function ensureEmailCodeModal() {
  if (emailCodeModalEl) return emailCodeModalEl;
  injectEmailCodeStyles();

  const overlay = document.createElement("div");
  overlay.className = "dvc-emailcode-overlay";
  overlay.innerHTML = `
    <div class="dvc-emailcode-box" role="dialog" aria-modal="true" aria-label="Sign in with email">
      <button type="button" class="dvc-emailcode-close" aria-label="Close">&times;</button>
      <div class="dvc-emailcode-step" data-step="email">
        <h3>Sign in with Email</h3>
        <p>We'll send a one-time code to your email -- no password needed.</p>
        <input type="email" class="dvc-emailcode-input" data-field="email" placeholder="you@example.com" autocomplete="email" inputmode="email">
        <div class="dvc-emailcode-error" data-error="email"></div>
        <button type="button" class="dvc-emailcode-submit" data-action="send">Send Code</button>
      </div>
      <div class="dvc-emailcode-step" data-step="code" style="display:none;">
        <h3>Enter Your Code</h3>
        <p>We sent a code to <strong data-sent-to></strong>.</p>
        <input type="text" class="dvc-emailcode-input dvc-emailcode-code" data-field="token" placeholder="Enter code" inputmode="numeric" autocomplete="one-time-code">
        <div class="dvc-emailcode-error" data-error="code"></div>
        <button type="button" class="dvc-emailcode-submit" data-action="verify">Verify &amp; Sign In</button>
        <button type="button" class="dvc-emailcode-linkbtn" data-action="resend">Resend code</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  emailCodeModalEl = overlay;

  const emailInput = overlay.querySelector('[data-field="email"]');
  const tokenInput = overlay.querySelector('[data-field="token"]');
  const emailStep = overlay.querySelector('[data-step="email"]');
  const codeStep = overlay.querySelector('[data-step="code"]');
  const emailError = overlay.querySelector('[data-error="email"]');
  const codeError = overlay.querySelector('[data-error="code"]');
  const sentTo = overlay.querySelector("[data-sent-to]");

  function close() {
    overlay.classList.remove("open");
    emailError.textContent = "";
    codeError.textContent = "";
  }

  async function send() {
    const email = emailInput.value.trim();
    if (!email) { emailError.textContent = "Enter your email first."; return; }
    const btn = overlay.querySelector('[data-action="send"]');
    btn.disabled = true;
    btn.textContent = "Sending...";
    const { error } = await signInWithEmailCode(email);
    btn.disabled = false;
    btn.textContent = "Send Code";
    if (error) { emailError.textContent = error; return; }
    sentTo.textContent = email;
    emailStep.style.display = "none";
    codeStep.style.display = "block";
    tokenInput.value = "";
    tokenInput.focus();
  }

  async function verify() {
    const email = emailInput.value.trim();
    const token = tokenInput.value.trim();
    if (!token) { codeError.textContent = "Enter the code from your email."; return; }
    const btn = overlay.querySelector('[data-action="verify"]');
    btn.disabled = true;
    btn.textContent = "Verifying...";
    const { error } = await verifyEmailCode(email, token);
    btn.disabled = false;
    btn.textContent = "Verify & Sign In";
    if (error) { codeError.textContent = error; return; }
    close();
    // Reset back to step 1 for next time -- onAuthChange listeners
    // (registered below, same as Google sign-in) handle everything else.
    emailStep.style.display = "block";
    codeStep.style.display = "none";
  }

  async function resend() {
    codeError.textContent = "";
    const link = overlay.querySelector('[data-action="resend"]');
    link.disabled = true;
    const { error } = await signInWithEmailCode(emailInput.value.trim());
    link.disabled = false;
    if (error) codeError.textContent = error;
    else codeError.textContent = "Code resent.";
  }

  overlay.querySelector(".dvc-emailcode-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && overlay.classList.contains("open")) close(); });
  overlay.querySelector('[data-action="send"]').addEventListener("click", send);
  overlay.querySelector('[data-action="verify"]').addEventListener("click", verify);
  overlay.querySelector('[data-action="resend"]').addEventListener("click", resend);
  emailInput.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
  tokenInput.addEventListener("keydown", (e) => { if (e.key === "Enter") verify(); });

  return overlay;
}

function openEmailCodeModal() {
  const overlay = ensureEmailCodeModal();
  overlay.classList.add("open");
  overlay.querySelector('[data-field="email"]').focus();
}

// A real "or" divider + a second pill-shaped button, appended after every
// Google button inside the .dvc-signin-cluster renderSignInButton() builds
// -- a first version used a plain underlined text link here, which read
// as a disclaimer bolted onto the real (Google) button rather than an
// equally legitimate second option. Positioning/centering is entirely the
// cluster's job now (flex column, align-items: center in
// renderSignInButton()'s comment) -- this only sizes/styles its own two
// elements, and returns the button so renderSignInButton() can
// size-match it against Google's actual measured button size once that
// renders (matchEmailTriggerSize()).
function appendEmailCodeTrigger(container) {
  // Inject styles here too, not just from ensureEmailCodeModal() -- that
  // only ran on first CLICK, so the trigger itself rendered as an
  // unstyled default <button> (visible border/background) until someone
  // actually clicked it once. injectEmailCodeStyles() is idempotent, so
  // calling it from both places is harmless.
  injectEmailCodeStyles();

  const divider = document.createElement("div");
  divider.className = "dvc-emailcode-divider";
  divider.textContent = "or";
  container.appendChild(divider);

  const link = document.createElement("button");
  link.type = "button";
  link.className = "dvc-emailcode-trigger";
  link.innerHTML = `<span class="dvc-emailcode-trigger-icon">&#9993;</span>Sign in with Email`;
  link.addEventListener("click", openEmailCodeModal);
  container.appendChild(link);
  return link;
}

// Self-contained CSS injected once into <head> -- auth.js runs on pages
// that don't all load the same stylesheet (tokens.css, styles.css, or a
// page's own inline <style>), so this can't lean on any of those the way
// a single page's own components can. Hardcoded brand purple (#4a148c)
// matches tokens.css's --color-primary and the PWA manifest's theme_color.
let emailCodeStylesInjected = false;
function injectEmailCodeStyles() {
  if (emailCodeStylesInjected) return;
  emailCodeStylesInjected = true;
  const style = document.createElement("style");
  style.textContent = `
.membership-gate-eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary, #4a148c);
}
.membership-gate-title {
  margin: 6px 0 8px;
  font-size: 1.15rem;
  color: var(--color-text, #1f1f3a);
}
.membership-gate p {
  max-width: 440px;
  margin: 0 auto 16px;
  line-height: 1.5;
}
.membership-gate .dvcop { margin-bottom: 16px; }
.membership-gate-btn {
  border: 0;
  border-radius: 8px;
  min-height: 44px;
  padding: 0 22px;
  background: var(--color-primary, #4a148c);
  color: white;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.membership-gate-btn:disabled { opacity: 0.7; cursor: default; }
.membership-gate-fine,
.membership-gate-error {
  margin-top: 8px;
  font-size: 0.75rem;
  color: var(--color-text-muted, #777);
}
.membership-gate-error { color: var(--color-danger, #b71c1c); }
.membership-gate-price {
  font-size: 0.9rem;
  color: var(--color-text, #1f1f3a);
}
.membership-gate-price strong { font-size: 1.5rem; }
.membership-gate-dues {
  margin: 2px 0 14px;
  font-size: 0.85rem;
  color: var(--color-text-muted, #777);
}
.membership-gate-own {
  border: 0;
  padding: 0;
  background: none;
  color: var(--color-primary, #4a148c);
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

/* .dvc-signin-cluster (flex column, align-items: center) is what actually
   centers every child here -- these three rules only size/style their own
   content, not position themselves, so they render identically no matter
   what CSS the page wrapping renderSignInButton()'s container applies. */
.dvc-signin-cluster {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.dvc-emailcode-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 130px;
  max-width: 100%;
  margin: 8px 0;
  color: #aaa;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.dvc-emailcode-divider::before,
.dvc-emailcode-divider::after {
  content: "";
  flex: 1;
  min-width: 20px;
  height: 1px;
  background: #e2e2e2;
}

.dvc-emailcode-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-sizing: border-box;
  padding: 9px 22px;
  background: white;
  border: 1px solid #d5d5d5;
  border-radius: 999px;
  font-size: 0.87rem;
  font-weight: 600;
  color: #444;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}
.dvc-emailcode-trigger:hover { border-color: #4a148c; color: #4a148c; background: #faf8fd; }
.dvc-emailcode-trigger-icon { font-size: 0.9rem; line-height: 1; }

.dvc-emailcode-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.dvc-emailcode-overlay.open { display: flex; }

.dvc-emailcode-box {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 28px 24px 24px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.dvc-emailcode-box h3 { margin: 0 0 8px; font-size: 1.1rem; color: #1a237e; }
.dvc-emailcode-box p { margin: 0 0 16px; font-size: 0.85rem; color: #666; line-height: 1.4; }

.dvc-emailcode-close {
  position: absolute;
  top: 10px;
  right: 12px;
  background: none;
  border: none;
  font-size: 1.3rem;
  color: #999;
  cursor: pointer;
  line-height: 1;
}
.dvc-emailcode-close:hover { color: #333; }

.dvc-emailcode-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 10px;
  font-family: inherit;
}
.dvc-emailcode-code { letter-spacing: 4px; text-align: center; font-weight: 700; }

.dvc-emailcode-error {
  font-size: 0.8rem;
  color: #b71c1c;
  min-height: 1.1em;
  margin-bottom: 8px;
}

.dvc-emailcode-submit {
  width: 100%;
  padding: 11px;
  background: #4a148c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}
.dvc-emailcode-submit:hover { background: #38116b; }
.dvc-emailcode-submit:disabled { opacity: 0.6; cursor: default; }

.dvc-emailcode-linkbtn {
  display: block;
  width: 100%;
  margin-top: 10px;
  background: none;
  border: none;
  font-size: 0.8rem;
  color: #4a148c;
  text-decoration: underline;
  cursor: pointer;
  text-align: center;
}
.dvc-emailcode-linkbtn:disabled { opacity: 0.6; cursor: default; }
  `;
  document.head.appendChild(style);
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
// Which owner-data reads failed on their most recent attempt. The reads
// below still return [] so no caller crashes, but a failed read is not an
// empty portfolio -- pages check readFailed() before showing "add your
// first contract" onboarding, and offer Retry instead (UX2-05).
const readFailures = new Set();
function noteRead(name, error) {
  if (error) readFailures.add(name); else readFailures.delete(name);
}
function readFailed(...names) {
  return names.some(name => readFailures.has(name));
}

async function getContracts() {
  if (!configured || !currentSession || !(await hasMembership())) return [];
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .order("created_at", { ascending: true });
  noteRead("contracts", error);
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
  if (!(await hasMembership())) return { error: MEMBERSHIP_REQUIRED_ERROR };
  let payload = { ...contract, user_id: currentSession.user.id };
  let { data, error } = await supabase.from("contracts").insert(payload).select().single();
  if (error && isMissingColumnError(error, "financing_interest_paid")) {
    payload = { ...payload }; delete payload.financing_interest_paid;
    ({ data, error } = await supabase.from("contracts").insert(payload).select().single());
    if (!error && contract.financing_interest_paid != null) return { data, warning: "Contract saved, but financing interest wasn't stored -- the database needs db/migrations/029_contract_financing_interest.sql run against it." };
  }
  if (error && isMissingColumnError(error, "blue_card_override")) {
    const { blue_card_override, ...rest } = payload;
    ({ data, error } = await supabase.from("contracts").insert(rest).select().single());
    if (!error) return { data, warning: "Contract saved, but the Blue Card override wasn't stored -- the database needs db/migrations/013_add_contract_blue_card_override.sql run against it." };
  }
  return { data, error: error?.message };
}

async function updateContract(id, patch) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  if (!(await hasMembership())) return { error: MEMBERSHIP_REQUIRED_ERROR };
  let { data, error } = await supabase.from("contracts").update(patch).eq("id", id).select().single();
  if (error && isMissingColumnError(error, "financing_interest_paid")) {
    const had = patch.financing_interest_paid != null;
    patch = { ...patch }; delete patch.financing_interest_paid;
    ({ data, error } = await supabase.from("contracts").update(patch).eq("id", id).select().single());
    if (!error && had) return { data, warning: "Contract saved, but financing interest wasn't stored -- the database needs db/migrations/029_contract_financing_interest.sql run against it." };
  }
  if (error && (isMissingColumnError(error, "ended_on") || isMissingColumnError(error, "sale_proceeds"))) {
    const had = patch.ended_on != null || patch.sale_proceeds != null;
    patch = { ...patch }; delete patch.ended_on; delete patch.sale_proceeds;
    ({ data, error } = await supabase.from("contracts").update(patch).eq("id", id).select().single());
    if (!error && had) return { data, warning: "Contract saved, but the sale date and proceeds weren't stored -- the database needs db/migrations/030_contract_sale.sql run against it." };
  }
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
  if (!configured || !currentSession || !(await hasMembership())) return [];
  const { data, error } = await supabase
    .from("contract_year_points")
    .select("*")
    .order("use_year_label", { ascending: true });
  noteRead("contract_year_points", error);
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
  if (!(await hasMembership())) return { error: MEMBERSHIP_REQUIRED_ERROR };
  const { data, error } = await supabase
    .from("contract_year_points")
    .upsert({ ...row, user_id: currentSession.user.id }, { onConflict: "contract_id,use_year_label" })
    .select()
    .single();
  return { data, error: error?.message };
}

async function recordPointMovement(payload) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  if (!(await hasMembership())) return { error: MEMBERSHIP_REQUIRED_ERROR };
  const { data, error } = await supabase.rpc("record_point_movement", payload);
  return { data, error: error?.message };
}

// Owner-led reconciliation with Disney (migration 025). payload:
// { p_id, p_contract, p_year, p_expected, p_after, p_reason, p_notes } --
// p_id is the retry key; p_expected is the row as the sheet read it.
async function reconcilePoints(payload) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  if (!(await hasMembership())) return { error: MEMBERSHIP_REQUIRED_ERROR };
  const { data, error } = await supabase.rpc("reconcile_points", payload);
  if (error && /reconcile_points/.test(error.message)) {
    return { error: "Reconciling can't be saved until db/migrations/025_point_reconciliation.sql is run in Supabase." };
  }
  return { data, error: error?.message };
}

// Read-only history for the per-use-year activity view. Each read is
// optional context: a failure is reported by readFailed(name), never
// treated as "no activity".
async function readOwnRows(table, name) {
  if (!configured || !currentSession || !(await hasMembership())) return [];
  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
  noteRead(name, error);
  if (error) {
    console.error(`[DVCAuth] ${name} read failed:`, error.message);
    return [];
  }
  return data;
}
const getPointMovements = () => readOwnRows("point_movements", "point_movements");
const getPointReconciliations = () => readOwnRows("point_reconciliations", "point_reconciliations");
// Every receipt, including reversed ones (getTripDeductions() returns only live ones).
const getTripDeductionHistory = () => readOwnRows("trip_deductions", "trip_deduction_history");

// Canceled-with-Disney booking history (migration 027). A table that
// doesn't exist yet reads as { missing: true } -- "not set up yet", not a
// failed read or an empty history. Any other failure is reported through
// readFailed(name).
function isMissingTableError(error) {
  return !!error && (error.code === "42P01" || error.code === "PGRST205" || /does not exist|could not find the table/i.test(error.message));
}
async function readOptionalTable(table) {
  if (!configured || !currentSession || !(await hasMembership())) return { rows: [], missing: false };
  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
  if (isMissingTableError(error)) {
    noteRead(table, null);
    return { rows: [], missing: true };
  }
  noteRead(table, error);
  if (error) console.error(`[DVCAuth] ${table} read failed:`, error.message);
  return { rows: error ? [] : data, missing: false };
}
const getBookingCancellations = () => readOptionalTable("booking_cancellations");

// "Download my data" (My Contracts, dvc-data-export.js). Deliberately NOT
// behind hasMembership(): an owner whose membership has ended can still
// take their own records with them. Every read runs as the signed-in user
// with the public anon key, so each table's row-level security returns only
// that owner's rows -- the same policies every other read relies on, no
// service role. Only reads; a failure is reported per table, never retried
// into a partial result. tables: table names to read.
async function readOwnerExport(tables) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const reads = {};
  await Promise.all([
    supabase.from("profiles").select("*").eq("id", currentSession.user.id).maybeSingle()
      .then(({ data, error }) => { reads.profile = { row: data, error: error?.message || null }; },
        e => { reads.profile = { row: null, error: e?.message || "failed" }; }),
    ...tables.map(table => supabase.from(table).select("*").then(({ data, error }) => {
      reads[table] = isMissingTableError(error) ? { rows: [], missing: true, error: null } : { rows: data || [], missing: false, error: error?.message || null };
    }, e => { reads[table] = { rows: [], missing: false, error: e?.message || "failed" }; })),
  ]);
  return { reads };
}

async function deleteContractYearPoints(id) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { error } = await supabase.from("contract_year_points").delete().eq("id", id);
  return { error: error?.message };
}

// Badges anyone can earn: built only from the calendar, saved itineraries
// and the free tools (docs/subscriptions_plan.md "Tier split"). Every
// other badge needs Active Member. dvc-badges.js defines them all;
// tests/free-badges.test.js checks each id here exists there.
const FREE_BADGE_IDS = new Set([
  "savant", "re-checker", "split-stay-scientist", "just-one-more-night", "resourceful-explorer", "night-owl",
  "daydreamer", "resort-collector", "early-bird", "stay-finder", "resort-matchmaker", "trend-watcher", "deed-detective",
]);

// Non-members get only their free badges' rows.
async function getUserBadges() {
  if (!configured || !currentSession) return [];
  const member = await hasMembership();
  const { data, error } = await supabase.from("user_badges").select("*");
  if (error) {
    console.error("[DVCAuth] getUserBadges failed:", error.message);
    return [];
  }
  return member ? data : data.filter(row => FREE_BADGE_IDS.has(row.badge_id));
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
  if (!FREE_BADGE_IDS.has(patch.badge_id) && !(await hasMembership())) return { error: MEMBERSHIP_REQUIRED_ERROR };
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
  if (!FREE_BADGE_IDS.has(badgeId) && !(await hasMembership())) return { error: MEMBERSHIP_REQUIRED_ERROR };
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
//          in_app_notifications_enabled, push_enabled, push_subscription,
//          point_value_baseline, dues_growth_rate, value_growth_rate,
//          opportunity_cost_rate }
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

// House Money's "Model Assumptions & Sensitivity" panel (trips.html) --
// four profile columns (db/migrations/018_add_house_money_model_settings.sql)
// a signed-in owner can override away from the app's flat defaults. Kept as
// its own thin get/save pair rather than making every trips.html call site
// go through getProfile()/updateProfile() directly and repeat these same
// four field names and defaults itself -- DEFAULT_USER_SETTINGS here is the
// one place that has to agree with the migration's column defaults.
const DEFAULT_USER_SETTINGS = {
  point_value_baseline: 30,
  dues_growth_rate: 0.04,
  value_growth_rate: 0.05,
  opportunity_cost_rate: 0.00,
};

// Always resolves to a full, defaulted settings object -- even signed-out/
// unconfigured (getProfile()'s own null fallback) or a profile row created
// before this migration ran (columns null) -- so trips.html never has to
// separately null-check each of the four fields itself.
async function getUserSettings() {
  const profile = await getProfile();
  return {
    point_value_baseline: profile?.point_value_baseline ?? DEFAULT_USER_SETTINGS.point_value_baseline,
    dues_growth_rate: profile?.dues_growth_rate ?? DEFAULT_USER_SETTINGS.dues_growth_rate,
    value_growth_rate: profile?.value_growth_rate ?? DEFAULT_USER_SETTINGS.value_growth_rate,
    opportunity_cost_rate: profile?.opportunity_cost_rate ?? DEFAULT_USER_SETTINGS.opportunity_cost_rate,
  };
}

// patch: any subset of DEFAULT_USER_SETTINGS' keys.
async function saveUserSettings(patch) {
  return updateProfile(patch);
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
  membershipCache = Promise.resolve(isMemberStatus(data?.status));
  return data;
}

// ---- Active Member gate (docs/subscriptions_plan.md "Tier split") ----
// Planning tools on public data stay free; anything built on the owner's
// own portfolio -- contracts, the points ledger, trips, itineraries,
// badges -- needs an active membership. On since live-mode Stripe went in
// (2026-09-24). Flip this to false to open every owner feature to any
// signed-in user; keep send-banking-reminders' copy in step.
const MEMBERSHIP_GATE_ENABLED = true;
// past_due still counts: Stripe retries a failed card for a while before
// canceling, and one declined charge shouldn't lock an owner out of their
// own ledger mid-retry (subscriptions_plan.md Phase 7).
const MEMBER_STATUSES = new Set(["active", "trialing", "past_due"]);
const MEMBERSHIP_REQUIRED_ERROR = "This is part of Active Member. Start a free trial on My Contracts to use it.";
// The one source for plan terms: the gate below, My Contracts' membership
// card and the signed-out Home/My Contracts copy all read these, so the
// price and trial can't disagree between screens. terms.html states the
// price in prose and has to be updated by hand if it changes. The price is the
// founding rate (docs/subscriptions_plan.md): Stripe keeps a subscriber on
// the Price they signed up with, so a later increase only reaches new
// members -- which is what makes "locked in" true.
const MEMBERSHIP_PLAN = { price: 25, trialDays: 7 };

// What a visitor should know about payment before signing in, matching
// the gate as it actually ships: free while the gate is off, the real
// trial and renewal terms once it's on.
function membershipTermsLine() {
  if (!MEMBERSHIP_GATE_ENABLED) return "Free to use. No payment or card needed.";
  return `Contract tools are part of Active Member: a ${MEMBERSHIP_PLAN.trialDays}-day free trial, then $${MEMBERSHIP_PLAN.price}/yr, renewing yearly until you cancel.`;
}
let membershipCache = null;

function isMemberStatus(status) {
  return !MEMBERSHIP_GATE_ENABLED || MEMBER_STATUSES.has(status);
}

// Cached per session -- every owner-data read goes through this, and the
// subscription row only changes via checkout (whose return poll calls
// getSubscription(), which refreshes the cache) or sign-in/out.
function hasMembership() {
  if (!configured || !currentSession) return Promise.resolve(false);
  if (!MEMBERSHIP_GATE_ENABLED) return Promise.resolve(true);
  return (membershipCache ||= getSubscription().then(sub => isMemberStatus(sub?.status)));
}

// The upsell a gated page shows in place of its owner content. Reuses the
// page's own .gate card so it matches that page's sign-in gate. preview:
// also show the labeled example dashboard (dvc-owner-preview.js, when the
// page loads it) -- Home and My Contracts, the contract-management gates.
function renderMembershipGate(container, { title, body, preview = false }) {
  injectEmailCodeStyles();
  const example = preview && window.DVCOwnerPreview ? window.DVCOwnerPreview.render() : "";
  container.innerHTML = `
    <div class="gate membership-gate">
      <div class="membership-gate-eyebrow">Active Member</div>
      <h3 class="membership-gate-title">${title}</h3>
      <p>${body}</p>
      ${example}
      <div class="membership-gate-price"><strong>$${MEMBERSHIP_PLAN.price}</strong>/yr after a ${MEMBERSHIP_PLAN.trialDays}-day free trial</div>
      <div class="membership-gate-dues" data-membership-dues>${membershipDuesHTML(readOwnedResortChoice())}</div>
      <button type="button" class="membership-gate-btn" data-membership-upgrade>Start ${MEMBERSHIP_PLAN.trialDays}-day free trial</button>
      <div class="membership-gate-fine">Founding rate, locked in while you stay a member. Cancel anytime.</div>
      <div class="membership-gate-error" role="alert" hidden></div>
    </div>
  `;
  // A saved contract outranks whatever was picked on this device.
  ownedResortForPricing().then(id => {
    const el = container.querySelector("[data-membership-dues]");
    if (el && id) el.innerHTML = membershipDuesHTML(id);
  }).catch(() => { /* keep the generic line */ });
}

// ---- Price in the owner's own dues ----
// The gate states the yearly price as the dues on a few points at the resort the
// owner actually owns at. That resort comes from their first active
// contract when they have one (read directly: getContracts() returns []
// for non-members, and this is the non-member's screen), otherwise from
// "Where do you own?" on the gate, kept per device and also used to
// preselect Add contract's home resort after checkout.
const OWNED_RESORT_KEY = "dvc_owned_resort";

function readOwnedResortChoice() {
  try {
    const id = localStorage.getItem(OWNED_RESORT_KEY);
    return id && typeof DUES_PER_POINT === "object" && DUES_PER_POINT[id] ? id : null;
  } catch (_) { return null; }
}

async function ownedResortForPricing() {
  if (configured && currentSession) {
    const { data, error } = await supabase
      .from("contracts")
      .select("home_resort_id")
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1);
    if (!error && data?.[0]?.home_resort_id) return data[0].home_resort_id;
  }
  return readOwnedResortChoice();
}

// Whole points, worded so it's never false: "Less than 3" only when it's
// clearly under (2.72 at Saratoga Springs), "About 3" within a tenth of a
// point (3.01 at Grand Floridian).
function duesPointsPhrase(price, duesPerPoint) {
  const points = price / duesPerPoint;
  const near = Math.round(points);
  const [lead, n] = Math.abs(points - near) < 0.1 ? ["About", near] : ["Less than", Math.ceil(points)];
  return { lead, n, unit: n === 1 ? "point" : "points" };
}

function membershipDuesHTML(resortId) {
  if (typeof DUES_PER_POINT !== "object") return "";
  const price = MEMBERSHIP_PLAN.price;
  const dues = resortId && DUES_PER_POINT[resortId];
  if (dues) {
    const { lead, n, unit } = duesPointsPhrase(price, dues);
    return `${lead} the dues on ${n} ${ownedResortName(resortId)} ${unit}. <button type="button" class="membership-gate-own" data-membership-own>Change</button>`;
  }
  const counts = Object.values(DUES_PER_POINT).map(d => Math.round(price / d));
  const lo = Math.min(...counts), hi = Math.max(...counts);
  return `About the dues on ${lo === hi ? lo : `${lo}–${hi}`} points. <button type="button" class="membership-gate-own" data-membership-own>Where do you own?</button>`;
}

function ownedResortName(id) {
  const full = typeof RESORTS !== "undefined" ? RESORTS.find(r => r.id === id)?.name : null;
  return typeof shorthandResortName === "function" ? shorthandResortName(id, full || id) : (full || id);
}

// dvc-pickers.js is loaded on demand: most gated pages don't carry it.
function loadResortPicker() {
  if (window.DVCPickers) return Promise.resolve(window.DVCPickers);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "js/dvc-pickers.js";
    s.onload = () => (window.DVCPickers ? resolve(window.DVCPickers) : reject(new Error("picker missing")));
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest?.("[data-membership-own]");
  if (!btn) return;
  let pickers;
  try { pickers = await loadResortPicker(); } catch (_) { return; }
  pickers.open({
    title: "Where do you own?",
    selected: readOwnedResortChoice(),
    returnFocus: btn,
    onPick: id => {
      if (!id) return;
      try { localStorage.setItem(OWNED_RESORT_KEY, id); } catch (_) {}
      document.querySelectorAll("[data-membership-dues]").forEach(el => { el.innerHTML = membershipDuesHTML(id); });
      document.querySelector("[data-membership-own]")?.focus();
    },
  });
});

document.addEventListener("click", async (e) => {
  const btn = e.target.closest?.("[data-membership-upgrade]");
  if (!btn) return;
  const errorEl = btn.parentElement.querySelector(".membership-gate-error");
  btn.disabled = true;
  btn.textContent = "Opening checkout...";
  const result = await subscribeToMembership();
  if (result.url) {
    window.location.href = result.url;
    return;
  }
  btn.disabled = false;
  btn.textContent = `Start ${MEMBERSHIP_PLAN.trialDays}-day free trial`;
  if (errorEl) {
    errorEl.textContent = "Couldn't open checkout: " + (result.error || "unknown error");
    errorEl.hidden = false;
  }
});

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
  if (!configured || !currentSession || !(await hasMembership())) return [];
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("check_in", { ascending: false });
  noteRead("trips", error);
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
  if (!(await hasMembership())) return { error: MEMBERSHIP_REQUIRED_ERROR };
  const payload = { ...trip, user_id: currentSession.user.id };
  let { data, error } = await supabase.from("trips").insert(payload).select().single();
  // Confirmed funding must never be silently discarded by a compatibility retry.
  if (error && payload.points_source_breakdown?.version === 2) return { error: error.message };
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
  if (!(await hasMembership())) return { error: MEMBERSHIP_REQUIRED_ERROR };
  let { data, error } = await supabase.from("trips").update(patch).eq("id", id).select().single();
  if (error && patch.points_source_breakdown?.version === 2) return { error: error.message };
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

// Booking saves through save_trip_booking (migration 024): the trip and its
// optional balance deduction land in one transaction, keyed by a
// client-generated id so a retried tap returns the first save instead of
// writing a second booking or a second deduction.
// payload: { p_trip_id, p_mode: 'create'|'update', p_trip, p_deductions, p_reconcile }
async function saveTripBooking(payload) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  if (!(await hasMembership())) return { error: MEMBERSHIP_REQUIRED_ERROR };
  const { data, error } = await supabase.rpc("save_trip_booking", payload);
  if (error && /save_trip_booking/.test(error.message)) {
    return { error: "Bookings can't be saved until db/migrations/024_trip_bookings.sql is run in Supabase." };
  }
  return { data, error: error?.message };
}

// mode: 'canceled' (Disney cancellation rules), 'mistake' (put the points
// back exactly), or 'keep' (leave balances alone). Safe to retry.
async function deleteTripBooking(id, mode) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  if (!(await hasMembership())) return { error: MEMBERSHIP_REQUIRED_ERROR };
  const { data, error } = await supabase.rpc("delete_trip_booking", { p_trip_id: id, p_mode: mode });
  return { data, error: error?.message };
}

// Live (not yet reversed) deduction receipts, for showing what a booking
// took out of balances and re-planning an edit against them.
async function getTripDeductions() {
  if (!configured || !currentSession || !(await hasMembership())) return [];
  const { data, error } = await supabase.from("trip_deductions").select("*").is("reversed_at", null);
  if (error) {
    console.error("[DVCAuth] getTripDeductions failed:", error.message);
    return [];
  }
  return data;
}

async function deleteTrip(id) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { error } = await supabase.from("trips").delete().eq("id", id);
  return { error: error?.message };
}

// Saved itineraries are free (planning on public chart data, like the
// calendar itself), so they skip the membership check.
async function getItineraries() {
  if (!configured || !currentSession) return [];
  const { data, error } = await supabase
    .from("itineraries")
    .select("*")
    .order("created_at", { ascending: false });
  noteRead("itineraries", error);
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
  const table = supabase.from("itineraries");
  const row = { ...itinerary, user_id: currentSession.user.id };
  // The calendar keeps one random ID across retries of a new/copy save.
  const query = itinerary.id ? table.upsert(row, { onConflict: "id" }) : table.insert(row);
  const { data, error } = await query
    .select()
    .single();
  return { data, error: error?.message };
}

async function updateItinerary(id, itinerary) {
  if (!configured || !currentSession) return { error: "Not signed in" };
  const { name, year, segments, booking_contract_id } = itinerary;
  const { data, error } = await supabase.from("itineraries")
    .update({ name, year, segments, booking_contract_id })
    .eq("id", id).eq("user_id", currentSession.user.id).select().single();
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

// Resale deeds bought before Disney's 2019-01-19 restriction keep 7-month
// access to every resort, Riviera and later ones included.
const RESALE_RESTRICTION_START = "2019-01-19";
function isResaleGrandfathered(purchaseDate) {
  return typeof purchaseDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(purchaseDate) && purchaseDate.slice(0, 10) < RESALE_RESTRICTION_START && !purchaseDate.startsWith("2019");
}

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
    // the three home-only ones -- unless the deed was bought before the
    // restriction started (2019-01-19), which is grandfathered everywhere.
    // My Contracts stores acquisition as YYYY-01-01, so a 2019 purchase
    // can't be placed on either side of Jan 19 and is treated as restricted
    // (the safer error: a wrongly-open resort is a booking that fails).
    const grandfathered = isResaleGrandfathered(c.purchase_date);
    for (const id of allResortIds) {
      if (grandfathered || !HOME_ONLY_RESALE_RESORTS.has(id)) sevenMoResortIds.add(id);
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
  // Signed out, the phone menu puts Sign in first (nav.js); signed in,
  // the email and Sign out stay at the bottom.
  el.closest(".site-nav")?.classList.toggle("signed-out", !!configured && !session);

  if (!configured) {
    el.innerHTML = "";
    return;
  }

  if (session) {
    const email = session.user?.email || "Account";
    el.innerHTML = `<button type="button" class="account-btn" id="account-signout">${email} &middot; Sign out</button>`;
    document.getElementById("account-signout").addEventListener("click", signOut);
  } else {
    // One compact "Sign in" button; its panel holds the Google and email
    // options. Both stacked in the bar made it three rows tall. The panel
    // renders on first open, since Google's button measures itself and
    // can't size inside a hidden element. Styles live in nav.js.
    el.innerHTML = `<button type="button" class="account-btn" id="account-signin-toggle" aria-expanded="false" aria-controls="account-signin-panel">Sign in</button><div class="account-signin-panel" id="account-signin-panel" hidden></div>`;
    const toggle = document.getElementById("account-signin-toggle");
    const panel = document.getElementById("account-signin-panel");
    const setOpen = open => {
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      if (open && !panel.childElementCount) renderSignInButton(panel, "account-btn", "medium");
    };
    toggle.addEventListener("click", () => setOpen(panel.hidden));
    document.addEventListener("click", e => { if (!panel.hidden && !el.contains(e.target) && !e.target.closest(".dvc-emailcode-overlay")) setOpen(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) { setOpen(false); toggle.focus(); } });
  }
}

onAuthChange(renderAccountControl);
init();
// Runs the compatibility shim for any page still creating a sign-in button
// the old way (see enhanceAllSignInButtons() above) -- a MutationObserver
// catches one appearing later too, since those pages render their gate
// asynchronously once they know the user is signed out.
if (configured) {
  enhanceAllSignInButtons();
  new MutationObserver(enhanceAllSignInButtons).observe(document.body, { childList: true, subtree: true });
}

window.DVCAuth = {
  signInWithGoogle,
  renderSignInButton,
  signInWithEmailCode,
  verifyEmailCode,
  openEmailCodeModal,
  signOut,
  deleteAccount,
  onAuthChange,
  getSession,
  getContracts,
  readFailed,
  addContract,
  updateContract,
  deleteContract,
  getContractYearPoints,
  upsertContractYearPoints,
  recordPointMovement,
  reconcilePoints,
  getPointMovements,
  getPointReconciliations,
  getTripDeductionHistory,
  getBookingCancellations,
  readOwnerExport,
  deleteContractYearPoints,
  getUserBadges,
  upsertUserBadge,
  getBadgeRarityStats,
  incrementBadgeEvent,
  getProfile,
  updateProfile,
  getUserSettings,
  saveUserSettings,
  DEFAULT_USER_SETTINGS,
  getSubscription,
  hasMembership,
  renderMembershipGate,
  MEMBERSHIP_REQUIRED_ERROR,
  MEMBERSHIP_GATE_ENABLED,
  MEMBERSHIP_PLAN,
  membershipTermsLine,
  ownedResortChoice: readOwnedResortChoice,
  FREE_BADGE_IDS,
  subscribeToMembership,
  manageMembership,
  getTrips,
  addTrip,
  updateTrip,
  deleteTrip,
  saveTripBooking,
  deleteTripBooking,
  getTripDeductions,
  getItineraries,
  addItinerary,
  updateItinerary,
  deleteItinerary,
  getUserResortAccess,
  evaluateContractPerks,
  isConfigured: () => configured,
  isSessionResolved: () => sessionResolved,
};
