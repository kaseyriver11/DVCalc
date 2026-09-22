const test=require('node:test'),assert=require('node:assert/strict');
const {loggedUsage}=require('../dvc-trip-funding.js');
const contracts=[{id:'a',points_per_year:200,is_active:true},{id:'b',is_active:false}];
const trip=(allocations,outside=0)=>({points_used:allocations.reduce((n,a)=>n+a.points,0)+outside,points_source_breakdown:{version:2,allocations,transferred:outside,one_time:0,other:0}});
test('no logged stays is zero usage regardless of entitlement or balances',()=>{
  assert.deepEqual(loggedUsage([],contracts),{ownedPoints:0,outsidePoints:0,attributedStays:0,needsReview:0});
});
test('counts owned allocation separately from outside points without a cash value',()=>{
  assert.deepEqual(loggedUsage([trip([{contract_id:'a',points:60}],40)],contracts),{ownedPoints:60,outsidePoints:40,attributedStays:1,needsReview:0});
});
test('outside-only bookings do not become owned usage',()=>{
  const result=loggedUsage([trip([],100)],contracts);assert.equal(result.ownedPoints,0);assert.equal(result.outsidePoints,100);
});
test('legacy and invalid funding require review rather than guessing usage',()=>{
  const result=loggedUsage([{points_used:100},trip([{contract_id:'missing',points:80}]),{...trip([{contract_id:'a',points:50}]),points_used:100}],contracts);
  assert.equal(result.ownedPoints,0);assert.equal(result.needsReview,3);
});
test('historical inactive contracts and upcoming recorded stays retain attribution',()=>{
  const result=loggedUsage([{...trip([{contract_id:'b',points:120}]),check_in:'2027-06-01'}],contracts);
  assert.equal(result.ownedPoints,120);assert.equal(result.attributedStays,1);
});
test('ledger data cannot affect the logged metric; totals are not capped by estimated allotments',()=>{
  const stays=[trip([{contract_id:'a',points:500}])];
  assert.equal(loggedUsage(stays,contracts,[{points_remaining:9999,points_banked:9999}]).ownedPoints,500);
});
