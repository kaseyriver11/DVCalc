const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../account.html'), 'utf8');
function form(values = {}, chosen = true) {
  const fields = Object.fromEntries(['f-points', 'f-price', 'f-interest', 'f-acquisition-year', 'resort-chip-search', 'form-error'].map(id => [id, { value: values[id] ?? '', style: {}, focus() { this.focused = true; } }]));
  const c = vm.createContext({ useYearChosen: chosen, document: { getElementById: id => fields[id], querySelector: () => ({ focus() {} }) }, showStudioStep(step) { c.step = step; } });
  vm.runInContext(source.match(/function validateContractStep\([^]*?\n\}/)[0], c);
  return { c, fields };
}
test('missing, zero, negative and fractional points return to the points step', () => {
  for (const value of ['', '0', '-1', '150.5']) {
    const { c, fields } = form({ 'f-points': value });
    assert.equal(c.validateContractStep(2), false);
    assert.equal(c.step, 2); assert.equal(fields['f-points'].focused, true);
  }
});
test('use year must be chosen explicitly and whole points are accepted', () => {
  assert.equal(form({ 'f-points': '200' }, false).c.validateContractStep(2), false);
  assert.equal(form({ 'f-points': '200' }).c.validateContractStep(2), true);
});
test('optional financial entries validate before saving', () => {
  assert.equal(form().c.validateContractStep(3), true);
  assert.equal(form({ 'f-price': '-10' }).c.validateContractStep(3), false);
  assert.equal(form({ 'f-acquisition-year': '1900' }).c.validateContractStep(3), false);
  assert.equal(form({ 'f-acquisition-year': '2020.5' }).c.validateContractStep(3), false);
  assert.equal(form({ 'f-price': '0', 'f-acquisition-year': '2020' }).c.validateContractStep(3), true);
  assert.equal(form({ 'f-interest': '-1' }).c.validateContractStep(3), false);
  assert.equal(form({ 'f-interest': '1200' }).c.validateContractStep(3), true);
});

// UX2-04: editing a contract must not rewrite a known purchase date.
function purchaseDate(yearValue, storedDate) {
  const c = vm.createContext({});
  vm.runInContext(source.match(/let editingPurchaseDate = null;\nfunction acquisitionYearToPurchaseDate\([^]*?\n\}/)[0].replace(/\r/g, '') + `\neditingPurchaseDate = ${JSON.stringify(storedDate)};`, c);
  return c.acquisitionYearToPurchaseDate({ value: yearValue });
}
test('an unchanged acquisition year keeps the stored full purchase date', () => {
  assert.equal(purchaseDate('2020', '2020-06-15'), '2020-06-15');
});
test('changing the acquisition year stores January 1 of the new year', () => {
  assert.equal(purchaseDate('2021', '2020-06-15'), '2021-01-01');
});
test('a new contract with no stored date uses January 1', () => {
  assert.equal(purchaseDate('2024', null), '2024-01-01');
  assert.equal(purchaseDate('', null), null);
});
