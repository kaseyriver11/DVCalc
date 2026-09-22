const test=require('node:test'),assert=require('node:assert/strict');
const api=require('../dvc-compare-handoff.js');
const resorts=[2026,2027].map(year=>({id:'animalKingdom',year,roomTypes:[{id:'valueStudio'}]}));
const stay={resortId:'animalKingdom',roomTypeId:'valueStudio',checkIn:'2026-10-12',checkOut:'2026-10-17',segment:null};
test('standalone selection carries exact resort, room, dates and visible month without saved state',()=>{
  const url=api.url(stay),selection=api.read(new URL(url,'https://example.test').searchParams);
  const result=api.apply(selection,{resortId:'copperCreek',year:2026,month:8},resorts).state;
  for(const key of ['resortId','roomTypeId','checkIn','checkOut'])assert.equal(result[key],stay[key]);
  assert.equal(result.month,9);assert.equal(result.year,2026);assert.deepEqual(result.segments,[]);
});
test('standalone selection discards stale split dates but retains unrelated settings',()=>{
  const state=api.apply(stay,{rentalRate:24,customCashRate:999,segments:[{checkIn:'2026-01-01'}]},resorts).state;
  assert.deepEqual(state.segments,[]);assert.equal(state.customCashRate,null);assert.equal(state.rentalRate,24);
});
test('changed comparison dates take precedence over the calendar round-trip snapshot',()=>{
  const result=api.apply({...stay,segment:'current'},{checkIn:'2026-09-01',checkOut:'2026-09-04',segments:[]},resorts);
  assert.equal(result.state.checkIn,'2026-10-12');assert.equal(result.state.checkOut,'2026-10-17');
});
test('replacing a completed split segment leaves the current segment unchanged',()=>{
  const original={resortId:'other',checkIn:'2026-10-17',checkOut:'2026-10-20',segments:[{...stay,resortId:'original'}]};
  const result=api.apply({...stay,segment:'0'},original,resorts).state;
  assert.equal(result.segments[0].resortId,'animalKingdom');assert.equal(result.resortId,'other');assert.equal(result.checkIn,'2026-10-17');assert.equal(original.segments[0].resortId,'original');
});
test('split changes cannot silently create gaps or update a missing segment',()=>{
  assert.ok(api.apply({...stay,segment:'0'},{segments:[]},resorts).error);
  assert.ok(api.apply({...stay,segment:'current'},{segments:[{checkOut:'2026-10-10'}]},resorts).error);
  assert.ok(api.apply({...stay,segment:'0'},{segments:[{checkIn:'2026-10-11',checkOut:stay.checkOut}]},resorts).error);
});
test('cross-year dates require charts for both years but checkout is excluded',()=>{
  const cross={...stay,checkIn:'2026-12-30',checkOut:'2027-01-02'};
  assert.ok(api.apply(cross,{},resorts).state);assert.ok(api.apply(cross,{},resorts.slice(0,1)).error);
  assert.ok(api.apply({...cross,checkOut:'2027-01-01'},{},resorts.slice(0,1)).state);
});
test('invalid dates, reversed stays and missing rooms fail explicitly',()=>{
  for(const patch of [{checkIn:'2026-02-30'},{checkOut:stay.checkIn},{roomTypeId:'missing'},{resortId:'missing'},{checkOut:'2027-10-17'}])assert.ok(api.apply({...stay,...patch},{},resorts).error);
  assert.equal(api.read(new URLSearchParams('resort=animalKingdom')),null);
});
