const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const defaults = {point_value_baseline:20,dues_growth_rate:0,value_growth_rate:0,opportunity_cost_rate:0};
function setup(month = 8) {
  const context = vm.createContext({
    window:{DVCAuth:{DEFAULT_USER_SETTINGS:defaults}},
    Date:class extends Date { constructor(...args) { super(...(args.length ? args : [2026,month,22])); } },
    RESORT_INVESTMENT_DATA:{test:{resalePricePerPoint:10,contractExpirationYear:2070}},
    DUES_HISTORY:{test:{2026:1}},getDuesForYear:()=>1
  });
  vm.runInContext(fs.readFileSync(require.resolve('../dvc-owner-value.js'),'utf8'),context);
  return context.window.DVCOwnerValue.create(t=>t.credit);
}
const contract = {id:'c',home_resort_id:'test',purchase_type:'direct',purchase_date:'2026-01-01',purchase_price:100,points_per_year:10,is_active:true};
test('calendar-year crossover includes future dues and does not slide with the current month',()=>{
  for(const month of [0,8,11]) {
    const stats=setup(month).computeHouseMoneyStats([contract],[],defaults);
    assert.equal(stats.totalOutlay,110);
    assert.equal(stats.estimatedHouseMoneyDate.getFullYear(),2027);
    assert.equal(stats.estimatedHouseMoneyDate.getMonth(),6); // ceil(110 / (200-10) * 12)
  }
});
test('saved assumptions change projections, not logged owner-funded stay value',()=>{
  const api=setup(), trips=[{check_out:'2026-04-01',credit:{cash:30,ownedPoints:3}}];
  const low=api.computeHouseMoneyStats([contract],trips,{...defaults,point_value_baseline:15});
  const high=api.computeHouseMoneyStats([contract],trips,{...defaults,point_value_baseline:35});
  assert.equal(low.lifetimeValue,30);assert.equal(high.lifetimeValue,30);
  assert.ok(high.annualVelocity>low.annualVelocity);
  assert.ok(high.estimatedHouseMoneyDate<=low.estimatedHouseMoneyDate);
});
test('rounding cannot declare payback before the full cost is covered',()=>{
  const stats=setup().computeHouseMoneyStats([contract],[{check_out:'2026-04-01',credit:{cash:109.9,ownedPoints:10}}],defaults);
  assert.equal(stats.paybackPct,99);assert.ok(stats.remaining>0);
});
test('no logged stays means zero recorded value and baseline-only projection',()=>{
  const stats=setup().computeHouseMoneyStats([contract],[],defaults);
  assert.equal(stats.lifetimeValue,0);assert.equal(stats.velocitySource,'baseline');assert.equal(stats.paybackPct,0);
});
test('missing funding and outside-only stays do not contribute owned value',()=>{
  const stats=setup().computeHouseMoneyStats([contract],[{check_out:'2026-04-01',credit:null},{check_out:'2026-04-01',credit:{cash:0,ownedPoints:0}}],defaults);
  assert.equal(stats.lifetimeValue,0);assert.equal(stats.velocitySource,'baseline');
});
test('no active contracts means no future ownership projection',()=>{
  const stats=setup().computeHouseMoneyStats([{...contract,is_active:false}],[],defaults);
  assert.equal(stats.estimatedHouseMoneyDate,null);assert.equal(stats.series.years.at(-1),2026);
});
test('both screens call the shared model and Home loads saved assumptions',()=>{
  for(const file of ['home.js','trips.html']){
    const s=fs.readFileSync(require.resolve('../'+file),'utf8');
    assert.match(s,/window\.DVCOwnerValue\.create\(tripCashValue\)/);
    assert.doesNotMatch(s,/function computeHouseMoneyStats\(/);
    assert.match(s,/DVCAuth\.getUserSettings\(\)/);
  }
});
