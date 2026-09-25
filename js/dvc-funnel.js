// First-contract activation events, sent to GoatCounter (already on every
// page) as custom events named "funnel/<step>". Only the step name is sent:
// never contract details, balances, emails or anything else about the owner.
//
// Steps, in order: home-cta, signin-shown, signin-email, signin-done,
// form-open, step-1-done, step-2-done, contract-saved, balance-saved or
// balance-skipped, dashboard-viewed.
//
// GoatCounter's script is injected after window load, so an event fired
// earlier is queued until window.goatcounter.count exists (up to ~15s).
// It never throws into the caller.
(function () {
  const queue = [];
  let polling = false;

  function flush() {
    const gc = window.goatcounter;
    if (!gc || typeof gc.count !== "function") return false;
    while (queue.length) {
      const step = queue.shift();
      try { gc.count({ path: "funnel/" + step, title: step, event: true }); } catch (_) { /* analytics is best effort */ }
    }
    return true;
  }

  function poll(attempts) {
    if (flush() || attempts <= 0) { polling = false; if (attempts <= 0) queue.length = 0; return; }
    setTimeout(() => poll(attempts - 1), 500);
  }

  function event(step) {
    queue.push(step);
    if (flush() || polling) return;
    polling = true;
    poll(30);
  }

  window.DVCFunnel = { event };
})();
