// The labeled example dashboard (dvc-owner-preview.js) shown on signed-out
// Home and the Active Member gates: visibly an example, non-interactive,
// honest about manual entry, and one renderer for both places.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const P = require('../dvc-owner-preview.js');
const read = f => fs.readFileSync(require.resolve('../' + f), 'utf8').replace(/\r/g, '');
const auth = read('auth.js');
const home = read('home.js');
const account = read('account.html');

test('the example is labeled as an example, never as the visitor\'s data', () => {
  const html = P.html();
  assert.match(html, /class="dvcop-badge">Example</);
  assert.match(html, /Sample data, not your account/);
  assert.match(html, /aria-label="Example owner dashboard with sample data, not your account"/);
  // Only the caption (guidance about the product) addresses the visitor.
  const mock = html.slice(html.indexOf('dvcop-mock'), html.indexOf('<figcaption'));
  assert.doesNotMatch(mock, /\byour\b/i);
});

test('it shows the outcome: contracts together, recorded balances, the next action', () => {
  const html = P.html();
  assert.equal((html.match(/class="dvcop-row"/g) || []).length, 2);
  assert.match(html, /Recorded points left/);
  assert.match(html, /Next up/);
  assert.match(html, /banking deadline in \d+ days/); // relative, so the sample never goes stale
  assert.doesNotMatch(html, /20\d\d/);
});

test('it has nothing to click, type into, or submit', () => {
  const html = P.html();
  assert.doesNotMatch(html, /<a\b|<button|<input|<select|<textarea|<form|onclick|href=|tabindex/i);
  assert.match(html, /class="dvcop-mock" inert/);
});

test('it says owners enter their numbers and check them against Disney -- no connection implied', () => {
  const html = P.html();
  assert.match(html, /You enter your contracts and the balances Disney shows you, then check them against Disney/);
  assert.match(html, /doesn't connect to your Disney account/);
  assert.doesNotMatch(html.replace("doesn't connect to your Disney account", ''), /connect|sync|link your/i);
});

test('the preview script never touches owner data', () => {
  const src = read('dvc-owner-preview.js').replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(src, /DVCAuth|supabase|fetch\(|localStorage|sessionStorage/);
});

test('both gates use the one shared renderer, with one trial or sign-in action', () => {
  // Membership gate: the example sits above the single trial button.
  const gate = auth.match(/function renderMembershipGate\([^]*?\n\}/)[0];
  assert.match(gate, /window\.DVCOwnerPreview\.render\(\)/);
  assert.ok(gate.indexOf('${example}') < gate.indexOf('data-membership-upgrade'));
  assert.equal((gate.match(/<button|<a /g) || []).length, 1);
  // Home (non-member) and My Contracts ask for it; the other gated pages don't.
  assert.match(home.match(/function renderNonMember\(\) \{[^]*?\n\}/)[0], /preview: true/);
  assert.match(account.match(/async function renderSignedIn\(\) \{[^]*?return;/)[0], /preview: true/);
  // Signed-out Home: same renderer, then the one sign-in control.
  const signedOut = home.match(/function dashboardSignInHTML\(\) \{[^]*?\n\}/)[0];
  assert.match(signedOut, /window\.DVCOwnerPreview\.render\(\)/);
  assert.doesNotMatch(signedOut, /<a |<button/);
  for (const page of ['home.html', 'account.html']) assert.match(read(page), /<script src="dvc-owner-preview\.js"><\/script>/);
});

test('without the preview option the gate is unchanged', () => {
  const ctx = vm.createContext({ window: { DVCOwnerPreview: P }, injectEmailCodeStyles() {} });
  vm.runInContext(auth.match(/function renderMembershipGate\([^]*?\n\}/)[0], ctx);
  const plain = { innerHTML: '' }, withPreview = { innerHTML: '' };
  ctx.renderMembershipGate(plain, { title: 'T', body: 'B' });
  ctx.renderMembershipGate(withPreview, { title: 'T', body: 'B', preview: true });
  assert.doesNotMatch(plain.innerHTML, /dvcop/);
  assert.match(withPreview.innerHTML, /dvcop-badge">Example/);
  assert.match(withPreview.innerHTML, /Start 7-day free trial/);
  assert.match(withPreview.innerHTML, /Then \$49\.99\/yr/); // price unchanged
});

test('no membership surface says owners "connect" their contracts', () => {
  for (const f of ['account.html', 'home.js', 'auth.js', 'badges.html', 'bookings.html', 'trips.html', 'itineraries.html', 'itinerarycompare.html', 'use-points.html']) {
    assert.doesNotMatch(read(f), /connect your own|connect your contracts/i, f);
  }
  assert.match(account, /record and manage your contracts/);
});
