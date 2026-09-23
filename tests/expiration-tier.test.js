const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const ctx = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(require.resolve('../dvc-dates.js'), 'utf8'), ctx);
const { urgencyTier, expirationTier } = ctx.window.DVCDates;

test('points that can only be used or lost are never calm', () => {
  assert.equal(urgencyTier(69), 'calm');
  assert.equal(expirationTier(69), 'warning');
  assert.equal(expirationTier(300), 'warning');
  assert.equal(expirationTier(45), 'warning');
  assert.equal(expirationTier(30), 'danger');
  assert.equal(expirationTier(0), 'danger');
});

test('home attention card and ledger use the expiration scale for use-by states', () => {
  const { attentionCard } = require('../dvc-home-summary.js');
  const tiers = { urgency: urgencyTier, expiration: expirationTier };
  const useBy = { kind: 'use-by', contract: { id: 'a' }, year: 2025, points: 40, expiresMs: 0, daysUntil: 69 };
  assert.equal(attentionCard(useBy, { name: 'A', tiers, formatDate: () => '', describe: () => ({ title: '' }) }).tone, 'warning'); // never calm
  const bankable = { kind: 'bankable', contract: { id: 'a' }, year: 2025, points: 40, deadline: { ms: 0, daysUntil: 69 } };
  assert.equal(attentionCard(bankable, { name: 'A', tiers, formatDate: () => '', describe: () => ({ title: '' }) }).tone, 'calm');
  assert.match(fs.readFileSync(require.resolve('../home.js'), 'utf8'), /tiers: \{ urgency: urgencyTier, expiration: expirationTier \}/);
  const account = fs.readFileSync(require.resolve('../account.html'), 'utf8');
  assert.equal((account.match(/expirationTier\(/g) || []).length, 3);
});
