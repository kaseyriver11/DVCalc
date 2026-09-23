// The Log a Trip / Record a Booking form never offers a check-out on or before check-in.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const page = fs.readFileSync(require.resolve('../trips.html'), 'utf8').replace(/\r/g, '');
const source = page.match(/function syncCheckoutMin\(\) \{[^]*?\n\}/)[0];

function form(checkIn, checkOut) {
  const fields = { 'f-checkin': { value: checkIn }, 'f-checkout': { value: checkOut, min: '' } };
  const ctx = vm.createContext({ document: { getElementById: id => fields[id] } });
  vm.runInContext(source, ctx);
  ctx.syncCheckoutMin();
  return fields['f-checkout'];
}

test('earliest check-out is the day after check-in, across a month boundary', () => {
  assert.equal(form('2027-01-31', '').min, '2027-02-01');
});
test('a check-out on or before a new check-in is cleared', () => {
  assert.equal(form('2027-02-05', '2027-02-02').value, '');
  assert.equal(form('2027-02-05', '2027-02-05').value, '');
});
test('a valid check-out is kept', () => {
  assert.equal(form('2027-02-05', '2027-02-09').value, '2027-02-09');
});
test('no check-in means no minimum', () => {
  assert.equal(form('', '2027-02-09').min, '');
});
