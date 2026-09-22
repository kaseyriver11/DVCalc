const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const keys=['points_remaining','points_banked','points_borrowed','points_holding'];
function screen(save,years=[2026]) {
  const nodes={};
  const node=id=>nodes[id] ||= {textContent:'',hidden:true,disabled:false,scrollIntoView(){}};
  const cards=years.map(year=>{
    const saved={points_remaining:10,points_banked:0,points_borrowed:0,points_holding:0};
    const total={value:'30'};
    const buckets=keys.slice(1).map(key=>({value:'0',dataset:{balanceBucket:key}}));
    const card={dataset:{balanceYear:String(year),beforeTotal:'10',savedBuckets:JSON.stringify(saved)},scrollIntoView(){},
      querySelector:selector=>selector==='[data-balance-total]'?total:node(year+selector),querySelectorAll:()=>buckets};
    total.closest=()=>card;buckets.forEach(input=>input.closest=()=>card);return card;
  });
  const context=vm.createContext({window:{DVCBalances:require('../dvc-balances.js'),DVCAuth:{upsertContractYearPoints:save}},
    document:{getElementById:node,querySelectorAll:selector=>selector==='[data-balance-year]'?cards:[]}});
  vm.runInContext(`let balanceSetupBusy=false,balanceSetupFailed=false,balanceSetupSaved=new Map(),balanceSetupContract={id:'c'},balanceSetupRows={c:${JSON.stringify(years.map(year=>({contract_id:'c',use_year_label:year,points_remaining:10,points_banked:0,points_borrowed:0,points_holding:0,balance_confirmed_at:'saved'})))}};let closed=false;`,context);
  const source=fs.readFileSync(require.resolve('../account.html'),'utf8'),start=source.indexOf('function updateBalanceCorrectionPreview('),end=source.indexOf("document.addEventListener('keydown'",start);
  vm.runInContext(source.slice(start,end),context);vm.runInContext('closeBalanceSetup=async()=>{closed=true}',context);
  return {cards,node,context,save:()=>vm.runInContext('saveBalanceSetup()',context),edit:(index,value)=>{cards[index].querySelector('[data-balance-total]').value=value;context.editInput=cards[index].querySelector('[data-balance-total]');vm.runInContext('updateBalanceCorrectionPreview(editInput)',context);},rows:()=>vm.runInContext('balanceSetupRows.c',context)};
}
test('failed 10 to 30 correction preserves the confirmed 10 and exposes retry/discard',async()=>{
  let fail=true;const ui=screen(async row=>fail?{error:'Offline'}:{data:row});ui.edit(0,'30');await ui.save();
  assert.equal(ui.rows()[0].points_remaining,10);assert.equal(ui.cards[0].querySelector('[data-balance-total]').value,'30');
  assert.equal(ui.node('2026.balance-card-status').textContent,'Save not confirmed');
  assert.equal(ui.node('save-balances').textContent,'Retry save');assert.equal(ui.node('skip-balances').textContent,'Discard edits');
  fail=false;await ui.save();assert.equal(ui.rows()[0].points_remaining,30);assert.equal(vm.runInContext('closed',ui.context),true);
});
test('partial success retries only the unconfirmed year',async()=>{
  let fail=true;const calls=[];const ui=screen(async row=>{calls.push(row.use_year_label);return row.use_year_label===2027&&fail?{error:'Offline'}:{data:row}},[2026,2027]);
  await ui.save();assert.equal(ui.rows()[0].points_remaining,30);assert.equal(ui.rows()[1].points_remaining,10);
  fail=false;await ui.save();assert.deepEqual(calls,[2026,2027,2027]);
});
test('editing a confirmed partial save marks it unsaved and updates its baseline accurately',async()=>{
  const ui=screen(async row=>row.use_year_label===2027?{error:'Offline'}:{data:row},[2026,2027]);await ui.save();ui.edit(0,'40');
  assert.equal(ui.cards[0].dataset.beforeTotal,'30');assert.equal(ui.node('2026.balance-card-status').textContent,'Unsaved changes');assert.equal(ui.rows()[0].points_remaining,30);
  assert.match(ui.node('2026.balance-correction-preview').textContent,/Last confirmed: 30.*Proposed: 40/);
});
test('unchanged balances and skipped years do not generate writes',async()=>{
  let calls=0;const ui=screen(async()=>{calls++;return {}},[2026,2027]);ui.edit(0,'10');ui.edit(1,'');await ui.save();assert.equal(calls,0);
});
test('an uncertain response is not reported as a failed database write',async()=>{
  const ui=screen(async()=>{throw Error('Connection lost')});await ui.save();
  assert.match(ui.node('balance-setup-error').textContent,/couldn't confirm/);assert.equal(ui.cards[0].dataset.saveUnknown,'true');assert.equal(ui.rows()[0].points_remaining,10);
  ui.edit(0,'10');assert.equal(ui.node('2026.balance-card-status').textContent,'Save not confirmed');
});
