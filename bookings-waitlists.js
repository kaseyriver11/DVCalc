// Waitlist requests and canceled-booking history on Bookings & Stays
// (Prompt 5, migration 027). Pure rules live in dvc-waitlists.js; this file
// renders and wires them, using bookings.html's globals (trips, RESORTS,
// uniqueResorts, openTripForm, renderSignedIn, ...).
//
// A waitlist is the owner's note of a request they made with Disney. It
// never takes points, never counts toward Membership Value or stay counts,
// and DVC Companion never submits or watches it. "Disney confirmed this"
// opens the normal Record a Booking form prefilled; the request is marked
// fulfilled by save_trip_booking in the same transaction as the booking.
let waitlists = [];
let bookingCancellations = [];
let waitlistsMissing = false;
let waitlistReadFailed = false;
let editingWaitlist = null;   // { id, isNew }
// A new request's id, kept until a save succeeds -- reopening Add after a
// lost response retries the same id instead of adding a duplicate.
let pendingNewWaitlistId = null;
let waitlistSaveInFlight = false;
let waitlistReminder = null;
let convertingWaitlistId = null;

const W = () => window.DVCWaitlists;
const wlEsc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const wlDay = s => new Date(s + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const wlRoomName = (resortId, roomTypeId) => RESORTS.find(r => r.id === resortId && r.roomTypes.some(rt => rt.id === roomTypeId))?.roomTypes.find(rt => rt.id === roomTypeId)?.name || roomTypeId;
const wlResort = id => shorthandResortName(id, resortName(id));
function wlTripLabel(t) { return `${wlResort(t.resort_id)} · ${formatTripDateRange(t.check_in, t.check_out)}`; }

async function loadWaitlistData() {
  const [w, c] = await Promise.all([window.DVCAuth.getWaitlists(), window.DVCAuth.getBookingCancellations()]);
  waitlists = w.rows; bookingCancellations = c.rows;
  waitlistsMissing = w.missing || c.missing;
  waitlistReadFailed = window.DVCAuth.readFailed("waitlists", "booking_cancellations");
}

// ---- Waitlists section (below Needs review, above the stay groups) ----
function waitlistCardHTML(w, today) {
  const r = W().review(w, today);
  const backup = w.backup_trip_id ? trips.find(t => t.id === w.backup_trip_id) : null;
  const fulfilled = w.fulfilled_trip_id ? trips.find(t => t.id === w.fulfilled_trip_id) : null;
  const lines = [
    `<div class="stay-detail-line">${wlEsc(wlRoomName(w.resort_id, w.room_type_id))} &middot; requested ${wlDay(w.requested_on)}</div>`,
    w.backup_trip_id ? `<div class="stay-detail-line">Backup booking: ${backup ? wlEsc(wlTripLabel(backup)) : "no longer recorded"}</div>` : "",
    w.status === "pending" && w.remind_days_before ? `<div class="stay-detail-line${r.due ? " warn" : " muted"}">${r.due ? `Review now: check-in is in ${r.daysToCheckIn} day${r.daysToCheckIn === 1 ? "" : "s"}. Check its status on Disney's member site.` : `Reminder to review on ${wlDay(r.reviewOn)}`}</div>` : "",
    w.status === "pending" && r.passed ? `<div class="stay-detail-line warn">Check-in has passed. Mark it canceled, or record the booking if Disney confirmed it.</div>` : "",
    w.status === "fulfilled" ? `<div class="stay-detail-line">${fulfilled ? `Recorded as a booking: ${wlEsc(wlTripLabel(fulfilled))}` : "Recorded as a booking (since removed)"}</div>` : "",
    w.status === "canceled" && w.canceled_at ? `<div class="stay-detail-line muted">Canceled ${wlDay(w.canceled_at.slice(0, 10))}</div>` : "",
    w.notes ? `<div class="stay-detail-line muted">${wlEsc(w.notes)}</div>` : "",
  ].join("");
  const actions = w.status === "pending"
    ? `<button type="button" class="small-btn primary" data-waitlist-confirm="${w.id}">Disney confirmed this</button><button type="button" class="small-btn" data-waitlist-edit="${w.id}">Edit</button><button type="button" class="small-btn danger" data-waitlist-cancel="${w.id}">Cancel request</button>`
    : w.status === "canceled" ? `<button type="button" class="small-btn" data-waitlist-reopen="${w.id}">Reopen</button>` : "";
  return `<article class="waitlist-card ${w.status}${r.due ? " due" : ""}">
      <div class="waitlist-top"><span class="stay-row-resort">${wlEsc(wlResort(w.resort_id))}</span><span class="waitlist-status ${w.status}">${W().STATUS[w.status]}</span></div>
      <div class="stay-row-dates">${formatTripDateRange(w.check_in, w.check_out)}</div>
      ${lines}
      ${actions ? `<div class="stay-details-actions waitlist-actions">${actions}</div>` : ""}
    </article>`;
}

function waitlistSectionHTML() {
  if (waitlistsMissing) return "";
  const today = localToday();
  const { pending, closed } = W().partition(waitlists);
  if (!pending.length && !closed.length && !waitlistReadFailed) return "";
  return `<section class="section stay-group waitlists" id="waitlists" aria-labelledby="waitlists-title">
      <h2 id="waitlists-title">Waitlists</h2>
      <p class="section-sub">Requests you've made with Disney, as you recorded them. They don't use points or count toward membership value until you record the booking Disney confirms.</p>
      ${waitlistReadFailed ? `<p class="stay-detail-line warn" role="alert">Couldn't load your waitlist requests right now. Nothing has been lost.</p>` : ""}
      ${pending.length ? pending.map(w => waitlistCardHTML(w, today)).join("") : waitlistReadFailed ? "" : `<p class="empty-note">No pending requests.</p>`}
      ${closed.length ? `<details class="stay-year waitlist-closed"><summary><span>Closed requests</span><span class="stay-year-count">${closed.length}</span></summary>${closed.map(w => waitlistCardHTML(w, today)).join("")}</details>` : ""}
    </section>`;
}

// ---- Canceled bookings (history kept by delete_trip_booking 'canceled') ----
function cancellationHistoryHTML() {
  if (waitlistsMissing || !bookingCancellations.length) return "";
  const nameFor = id => deductionContractName(contracts.find(c => c.id === id));
  return `<section class="section stay-group" id="canceled-bookings" aria-labelledby="canceled-title">
      <details class="stay-year"><summary><span id="canceled-title">Canceled with Disney</span><span class="stay-year-count">${bookingCancellations.length}</span></summary>
      ${bookingCancellations.map(c => `<div class="canceled-row">
          <div class="waitlist-top"><span class="stay-row-resort">${wlEsc(wlResort(c.resort_id))}</span><span class="stay-row-points">${c.points_used.toLocaleString()} pts</span></div>
          <div class="stay-row-dates">${formatTripDateRange(c.check_in, c.check_out)}</div>
          ${c.disney_confirmation_number ? `<div class="stay-detail-line">Disney confirmation (as entered): ${wlEsc(c.disney_confirmation_number)}</div>` : ""}
          <div class="stay-detail-line muted">Recorded as canceled ${wlDay(c.canceled_on)}, ${c.days_before_check_in > 0 ? `${c.days_before_check_in} day${c.days_before_check_in === 1 ? "" : "s"} before check-in` : c.days_before_check_in === 0 ? "on check-in day" : "after check-in"}</div>
          ${W().cancellationOutcome(c, nameFor).map(line => `<div class="stay-detail-line">${wlEsc(line)}</div>`).join("")}
        </div>`).join("")}
      </details>
    </section>`;
}

// ---- Add / edit form ----
function waitlistModalHTML() {
  const select = (id, label) => `<div class="form-field"><label for="${id}-trigger">${label}</label><div class="custom-select"><select id="${id}" class="native-select"></select><button type="button" class="custom-select-trigger" id="${id}-trigger"><span class="custom-select-value"></span><span class="custom-select-arrow"></span></button><div class="custom-select-dropdown"></div></div></div>`;
  return `<div class="modal-overlay" id="waitlist-modal">
      <div class="modal-box trip-modal-box" role="dialog" aria-modal="true" aria-labelledby="waitlist-title">
        <div class="modal-header"><h3 id="waitlist-title">Waitlist request</h3><button type="button" class="modal-close" id="waitlist-close" aria-label="Close">&times;</button></div>
        <p class="funding-help">Record a waitlist request you made with Disney. DVC Companion doesn't submit or watch waitlists.</p>
        <div class="form-error" id="waitlist-error" role="alert" style="display:none;"></div>
        <div class="form-group">
          <div class="form-group-label">What you asked for</div>
          ${select("wl-resort", "Resort")}
          ${select("wl-room", "Room Type")}
          <div class="form-row-2">
            <div class="form-field"><label for="wl-checkin">Check-in</label><input type="date" id="wl-checkin"></div>
            <div class="form-field"><label for="wl-checkout">Check-out</label><input type="date" id="wl-checkout"></div>
          </div>
          <div class="form-field"><label for="wl-requested">Requested on</label><input type="date" id="wl-requested"></div>
        </div>
        <div class="form-group">
          <div class="form-group-label">Backup and reminder</div>
          ${select("wl-backup", "Backup booking (optional)")}
          <div class="form-field"><span class="form-field-label">Remind me to review it</span>
            <div class="wl-chips" role="group" aria-label="Review reminder">${W().REMINDER_CHOICES.map(v => `<button type="button" class="wl-chip" data-remind="${v ?? ""}" aria-pressed="false">${v ? `${v} days before check-in` : "No reminder"}</button>`).join("")}</div>
            <small class="funding-help">Shown here and emailed once, if you use email reminders. It's a reminder to check Disney, not a status update.</small>
          </div>
          <div class="form-field"><label for="wl-notes">Notes (optional)</label><textarea id="wl-notes" rows="2" maxlength="500"></textarea></div>
        </div>
        <div class="form-actions"><button type="button" class="save-btn" id="waitlist-save">Save request</button><button type="button" class="cancel-btn" id="waitlist-cancel">Cancel</button></div>
      </div>
    </div>`;
}

function populateWaitlistRooms(resortId, selected) {
  const years = [...new Set(RESORTS.filter(r => r.id === resortId).map(r => r.year))].sort((a, b) => b - a);
  const resort = RESORTS.find(r => r.id === resortId && r.year === years[0]);
  const room = document.getElementById("wl-room");
  room.innerHTML = (resort?.roomTypes || []).map(rt => `<option value="${rt.id}" ${rt.id === selected ? "selected" : ""}>${wlEsc(rt.name)}</option>`).join("");
  room._customSelectRender?.();
}
function setWaitlistReminder(v) {
  waitlistReminder = v;
  document.querySelectorAll("#waitlist-modal [data-remind]").forEach(b => b.setAttribute("aria-pressed", String((b.dataset.remind || null) == (v == null ? null : String(v)))));
}

function openWaitlistForm(w) {
  editingWaitlist = w ? { id: w.id, isNew: false } : { id: pendingNewWaitlistId ||= crypto.randomUUID(), isNew: true };
  const resort = document.getElementById("wl-resort");
  resort.value = w?.resort_id || resort.value;
  populateWaitlistRooms(resort.value, w?.room_type_id);
  document.getElementById("wl-checkin").value = w?.check_in || "";
  document.getElementById("wl-checkout").value = w?.check_out || "";
  document.getElementById("wl-requested").value = w?.requested_on || localToday();
  document.getElementById("wl-requested").max = localToday();
  document.getElementById("wl-checkin").min = w ? "" : localToday();
  const backup = document.getElementById("wl-backup");
  const upcoming = trips.filter(t => t.check_out >= localToday()).sort((a, b) => a.check_in.localeCompare(b.check_in));
  backup.innerHTML = `<option value="">No backup booking</option>` + upcoming.map(t => `<option value="${t.id}">${wlEsc(wlTripLabel(t))}</option>`).join("");
  backup.value = w?.backup_trip_id && upcoming.some(t => t.id === w.backup_trip_id) ? w.backup_trip_id : "";
  backup._customSelectRender?.();
  resort._customSelectRender?.();
  setWaitlistReminder(w?.remind_days_before ?? null);
  document.getElementById("wl-notes").value = w?.notes || "";
  document.getElementById("waitlist-error").style.display = "none";
  document.getElementById("waitlist-title").textContent = w ? "Edit waitlist request" : "Add a waitlist request";
  document.getElementById("waitlist-modal").classList.add("open");
}
function closeWaitlistForm() {
  if (waitlistSaveInFlight) return;
  editingWaitlist = null;
  document.getElementById("waitlist-modal").classList.remove("open");
}

async function saveWaitlistForm() {
  if (waitlistSaveInFlight || !editingWaitlist) return;
  const errorEl = document.getElementById("waitlist-error");
  const row = {
    id: editingWaitlist.id,
    resort_id: document.getElementById("wl-resort").value,
    room_type_id: document.getElementById("wl-room").value,
    check_in: document.getElementById("wl-checkin").value,
    check_out: document.getElementById("wl-checkout").value,
    requested_on: document.getElementById("wl-requested").value,
    backup_trip_id: document.getElementById("wl-backup").value || null,
    remind_days_before: waitlistReminder,
    notes: document.getElementById("wl-notes").value.trim() || null,
  };
  const problem = W().validate(row, { today: localToday(), isNew: editingWaitlist.isNew });
  if (problem) { errorEl.textContent = problem; errorEl.style.display = "block"; return; }
  const btn = document.getElementById("waitlist-save");
  waitlistSaveInFlight = true;
  btn.disabled = true;
  btn.textContent = "Saving…";
  let result;
  try {
    result = await window.DVCAuth.saveWaitlist(row, { isNew: editingWaitlist.isNew });
  } catch (e) {
    result = { error: e.message || "Couldn't reach the server." };
  } finally {
    waitlistSaveInFlight = false;
    btn.disabled = false;
    btn.textContent = "Save request";
  }
  if (result.error) {
    // The form keeps what was typed, and a new request keeps its id, so a
    // retry after a lost response can't add it twice.
    errorEl.textContent = "Couldn't save: " + result.error;
    errorEl.style.display = "block";
    return;
  }
  if (editingWaitlist.isNew) pendingNewWaitlistId = null;
  editingWaitlist = null;
  document.getElementById("waitlist-modal").classList.remove("open");
  renderSignedIn();
}

async function changeWaitlistStatus(id, status, button) {
  if (button.disabled) return;
  button.disabled = true;
  const result = await window.DVCAuth.setWaitlistStatus(id, status);
  if (result.error) {
    button.disabled = false;
    pendingWarning = "Couldn't update that waitlist request: " + wlEsc(result.error);
  }
  renderSignedIn();
}

// "Disney confirmed this": the normal Record a Booking form, prefilled with
// what was requested. The owner confirms Disney's actual dates, points and
// sources; save_trip_booking marks the request fulfilled only if the
// booking saves.
function convertWaitlist(w) {
  openTripForm(null, { ...W().bookingDraft(w), waitlist_id: w.id });
}

function wireWaitlists() {
  const modal = document.getElementById("waitlist-modal");
  if (!modal) return;
  const resort = document.getElementById("wl-resort");
  resort.innerHTML = uniqueResorts().map(r => `<option value="${r.id}">${wlEsc(r.name)}</option>`).join("");
  ["wl-resort", "wl-room", "wl-backup"].forEach(id => window.DVCUI.initCustomSelect(document.getElementById(id)));
  populateWaitlistRooms(resort.value, null);
  resort.addEventListener("change", () => populateWaitlistRooms(resort.value, null));
  document.getElementById("wl-checkin").addEventListener("change", e => {
    const out = document.getElementById("wl-checkout");
    if (e.target.value) { const next = new Date(Date.parse(e.target.value + "T00:00:00Z") + 86400000).toISOString().slice(0, 10); out.min = next; if (out.value && out.value <= e.target.value) out.value = ""; }
  });
  modal.querySelectorAll("[data-remind]").forEach(b => b.addEventListener("click", () => setWaitlistReminder(b.dataset.remind ? Number(b.dataset.remind) : null)));
  document.getElementById("waitlist-save").addEventListener("click", saveWaitlistForm);
  document.getElementById("waitlist-cancel").addEventListener("click", closeWaitlistForm);
  document.getElementById("waitlist-close").addEventListener("click", closeWaitlistForm);
  modal.addEventListener("click", e => { if (e.target.id === "waitlist-modal") closeWaitlistForm(); });
  document.querySelectorAll(".js-add-waitlist").forEach(b => b.addEventListener("click", () => openWaitlistForm(null)));
}

function wireWaitlistActions(list) {
  list.addEventListener("click", e => {
    const b = e.target.closest("[data-waitlist-confirm],[data-waitlist-edit],[data-waitlist-cancel],[data-waitlist-reopen]");
    if (!b) return;
    const w = waitlists.find(x => x.id === (b.dataset.waitlistConfirm || b.dataset.waitlistEdit || b.dataset.waitlistCancel || b.dataset.waitlistReopen));
    if (!w) return;
    if (b.dataset.waitlistConfirm) convertWaitlist(w);
    else if (b.dataset.waitlistEdit) openWaitlistForm(w);
    else if (b.dataset.waitlistCancel) changeWaitlistStatus(w.id, "canceled", b);
    else changeWaitlistStatus(w.id, "pending", b);
  });
}
