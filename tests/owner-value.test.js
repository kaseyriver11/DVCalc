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
test('a first partial-year trip cannot push the payback date later',()=>{
  const api=setup();
  const before=api.computeHouseMoneyStats([contract],[],defaults);
  const after=api.computeHouseMoneyStats([contract],[{check_out:'2026-04-01',credit:{cash:30,ownedPoints:3}}],defaults);
  assert.equal(after.velocitySource,'baseline-early');
  assert.ok(after.estimatedHouseMoneyDate<=before.estimatedHouseMoneyDate);
});
test('trip history blends in once it covers a full year of points',()=>{
  const stats=setup().computeHouseMoneyStats([contract],[{check_out:'2026-04-01',credit:{cash:300,ownedPoints:10}}],defaults);
  assert.equal(stats.velocitySource,'blended');
});
test('a sold contract stops paying dues at its end year and its sale proceeds come off the cost',()=>{
  const api=setup();
  const sold={...contract,purchase_date:'2020-01-01',is_active:false,ended_on:'2022-06-01',sale_proceeds:50};
  assert.equal(api.computeHouseMoneyStats([sold],[],defaults).totalOutlay,100+3*10-50);
  const undated={...sold,ended_on:null,sale_proceeds:null};
  assert.equal(api.computeHouseMoneyStats([undated],[],defaults).totalOutlay,100+7*10);
  const series=api.computeHouseMoneyStats([sold,contract],[],defaults).series;
  assert.equal(series.outlay[series.years.indexOf(2023)]-series.outlay[series.years.indexOf(2022)],0);
});
test('trip pace is value per point-year owned, not value per trip',()=>{
  const old={...contract,purchase_date:'2022-01-01'};
  const stats=setup().computeHouseMoneyStats([old],[{check_out:'2025-04-01',credit:{cash:300,ownedPoints:10}}],defaults);
  assert.equal(stats.velocitySource,'blended');
  assert.equal(stats.actualPace,300/(5*10)*10);
});
test('pace figures are value before dues, like the chart',()=>{
  const stats=setup().computeHouseMoneyStats([contract],[],defaults);
  assert.equal(stats.baselinePotential,10*20);
});
test('the invested-instead fund prices rooms from today, not from the purchase year',()=>{
  const old={...contract,purchase_date:'2016-01-01',purchase_price:100000};
  const s=setup().computeHouseMoneyStats([old],[],{...defaults,value_growth_rate:0.05}).series;
  const i=s.years.indexOf(2026);
  assert.equal(Math.round(s.altFund[i-1]-s.altFund[i]),10*20-10);
});
