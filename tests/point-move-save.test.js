const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const moves = require('../js/dvc-point-moves.js');

function screen(api, storageFails = false) {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, { value: id === 'point-move-amount' ? '50' : '', disabled: false, hidden: true, textContent: '' });
    return elements.get(id);
  };
  const stored = new Map();
  const context = vm.createContext({
    DVCPointMoves: moves,
    crypto: { randomUUID: () => 'same-request-id' },
    window: { DVCAuth: { recordPointMovement: api } },
    document: { getElementById: element, querySelectorAll: () => [...elements.values()], querySelector: () => null, addEventListener: () => {} },
    sessionStorage: {
      setItem: (key, value) => { if (storageFails) throw Error('Storage blocked'); stored.set(key, value); },
      removeItem: key => stored.delete(key)
    }
  });
  vm.runInContext(fs.readFileSync(require.resolve('../js/account-point-moves.js'), 'utf8'), context);
  vm.runInContext(`
    renderPointMovePreview = () => {};
    closePointMove = async () => { pointMove = null; };
    pointMove = { contract: { id: 'owner-contract' }, kind: 'bank', year: 2026, busy: false, storageKey: 'pending',
      rows: [2026,2027].map(y => ({use_year_label:y,points_remaining:200,points_banked:0,points_borrowed:0,points_holding:0,balance_confirmed_at:'2026-09-22T00:00:00Z'})) };
  `, context);
  return { context, stored, element, save: () => vm.runInContext('savePointMove()', context) };
}

test('lost response retains the same request; retry does not create a second movement', async () => {
  const receipts = new Map();
  let calls = 0;
  const ui = screen(async payload => {
    calls++;
    if (receipts.has(payload.p_id)) return { data: receipts.get(payload.p_id) };
    receipts.set(payload.p_id, { saved: true });
    throw Error('Response lost after commit');
  });
  await ui.save();
  assert.equal(ui.stored.size, 1);
  assert.equal(ui.element('point-move-amount').disabled, true);
  assert.match(ui.element('point-move-error').textContent, /Retry this save/);
  await ui.save();
  assert.equal(calls, 2);
  assert.equal(receipts.size, 1);
  assert.equal(ui.stored.size, 0);
});

test('double tap while saving only sends one request', async () => {
  let release, calls = 0;
  const ui = screen(() => { calls++; return new Promise(resolve => { release = resolve; }); });
  const pending = ui.save();
  await ui.save();
  assert.equal(calls, 1);
  release({ data: {} });
  await pending;
});

test('blocked storage prevents sending an unsafe request', async () => {
  let calls = 0;
  const ui = screen(async () => { calls++; return { data: {} }; }, true);
  await ui.save();
  assert.equal(calls, 0);
  assert.match(ui.element('point-move-error').textContent, /Nothing was sent/);
});

test('stale-balance rejection clears the retry reference and asks for refresh', async () => {
  const ui = screen(async () => ({ error: 'Balances changed. Close this sheet and review the latest balances before trying again.' }));
  await ui.save();
  assert.equal(ui.stored.size, 0);
  assert.equal(ui.element('point-move-amount').disabled, false);
  assert.match(ui.element('point-move-error').textContent, /review the latest balances/);
});
