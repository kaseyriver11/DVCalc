// "Canceled with Disney" history on Bookings & Stays (Prompt 5, migration
// 027). delete_trip_booking('canceled') keeps an immutable record of the
// booking and what happened to its points; this renders it. Uses
// bookings.html's globals (contracts, shorthandResortName, resortName,
// formatTripDateRange, deductionContractName).
let bookingCancellations = [];
let cancellationsMissing = false;

const cancelEsc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const cancelDay = s => new Date(s + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

async function loadCancellationHistory() {
  const r = await window.DVCAuth.getBookingCancellations();
  bookingCancellations = r.rows;
  cancellationsMissing = r.missing;
}

function cancellationHistoryHTML() {
  if (cancellationsMissing || !bookingCancellations.length) return "";
  const nameFor = id => deductionContractName(contracts.find(c => c.id === id));
  const when = n => n > 0 ? `${n} day${n === 1 ? "" : "s"} before check-in` : n === 0 ? "on check-in day" : "after check-in";
  return `<section class="section stay-group" id="canceled-bookings" aria-labelledby="canceled-title">
      <details class="stay-year"><summary><span id="canceled-title">Canceled with Disney</span><span class="stay-year-count">${bookingCancellations.length}</span></summary>
      ${bookingCancellations.map(c => `<div class="canceled-row">
          <div class="canceled-top"><span class="stay-row-resort">${cancelEsc(shorthandResortName(c.resort_id, resortName(c.resort_id)))}</span><span class="stay-row-points">${c.points_used.toLocaleString()} pts</span></div>
          <div class="stay-row-dates">${formatTripDateRange(c.check_in, c.check_out)}</div>
          ${c.disney_confirmation_number ? `<div class="stay-detail-line">Disney confirmation (as entered): ${cancelEsc(c.disney_confirmation_number)}</div>` : ""}
          <div class="stay-detail-line muted">Recorded as canceled ${cancelDay(c.canceled_on)}, ${when(c.days_before_check_in)}</div>
          ${window.DVCBookingRecords.cancellationOutcome(c, nameFor).map(line => `<div class="stay-detail-line">${cancelEsc(line)}</div>`).join("")}
        </div>`).join("")}
      </details>
    </section>`;
}
