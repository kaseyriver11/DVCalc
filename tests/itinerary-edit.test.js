const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../js/app.js'),'utf8');
function setup({mode='update',save}={}) {
  const rows=new Map([['original',{id:'original',name:'AKV Option'}]]),calls=[];
  const session={user:{id:'owner'}};
  const api={getSession:()=>session,updateItinerary:async(id,p)=>{calls.push(['update',id,p]);if(save)return save(id,p);if(!rows.has(id))return {error:'Not found'};rows.set(id,{id,...p});return {data:rows.get(id)}},addItinerary:async p=>{calls.push(['add',p.id,p]);if(save)return save(p.id,p);rows.set(p.id,p);return {data:p}}};
  const input={value:'AKV Revised'};
  const context=vm.createContext({window:{DVCAuth:api},document:{getElementById:()=>input},crypto:{randomUUID:()=> 'new-copy'},renderSummary(){},refreshUserItineraries(){},setTimeout(){},getSelectedContract:()=>({id:'contract'}),getFullItinerarySegments:()=>[{resortId:'akv',roomTypeId:'studio',checkIn:'2026-10-12',checkOut:'2026-10-17'}]});
  vm.runInContext(`let state={year:2026,itineraryEdit:{id:'original',name:'AKV Option',ownerId:'owner'}};let itinerarySaveMode=${JSON.stringify(mode)},itinerarySaveStatus=null,itinerarySaveError='',itineraryNameDraft=null,showingItinerarySaveForm=true;`,context);
  vm.runInContext(source.match(/function editingItinerary\(\)[\s\S]*?\n\}/)[0],context);
  const a=source.indexOf('async function confirmSaveItinerary()'),b=source.indexOf('// Once a complete single-resort',a);
  vm.runInContext(source.slice(a,b),context);
  return {rows,calls,context,input,session,run:()=>vm.runInContext('confirmSaveItinerary()',context)};
}
test('Save Changes renames the same record and retains Booking As',async()=>{
  const ui=setup();await ui.run();assert.equal(ui.rows.size,1);assert.equal(ui.rows.get('original').name,'AKV Revised');assert.equal(ui.rows.get('original').booking_contract_id,'contract');assert.equal(ui.calls[0][0],'update');
});
test('Save as Copy adds a separate record and leaves the original intact',async()=>{
  const ui=setup({mode:'copy'});await ui.run();assert.equal(ui.rows.size,2);assert.equal(ui.rows.get('original').name,'AKV Option');assert.equal(vm.runInContext('state.itineraryEdit.id',ui.context),'new-copy');
});
test('failed updates keep identity and entered name; never fall back to inserting',async()=>{
  const ui=setup({save:async()=>({error:'Not found'})});await ui.run();assert.equal(ui.calls[0][0],'update');assert.equal(ui.rows.size,1);assert.equal(vm.runInContext('itineraryNameDraft',ui.context),'AKV Revised');assert.equal(vm.runInContext('itinerarySaveStatus',ui.context),'error');
});
test('copy retry uses the same ID after an uncertain response',async()=>{
  let first=true;const ui=setup({mode:'copy',save:async(id,p)=>{if(first){first=false;throw Error('Lost response')}return {data:{id,...p}}}});await ui.run();await ui.run();assert.deepEqual(ui.calls.map(c=>c[1]),['new-copy','new-copy']);
});
test('double taps send one save and another account cannot update the itinerary',async()=>{
  let release;const ui=setup({save:(id,p)=>new Promise(r=>release=()=>r({data:{id,...p}}))});const first=ui.run();await ui.run();assert.equal(ui.calls.length,1);release();await first;
  const other=setup();other.session.user.id='different-owner';await other.run();assert.equal(other.calls.length,0);
});
test('blank names do not call persistence',async()=>{const ui=setup();ui.input.value=' ';await ui.run();assert.equal(ui.calls.length,0);assert.match(vm.runInContext('itinerarySaveError',ui.context),/Enter a name/);});

test('persistence updates only the signed-in owner record and copies use retry-safe IDs',async()=>{
  const calls=[];const query={};for(const method of ['upsert','insert','update','eq','select'])query[method]=(...args)=>{calls.push([method,...args]);return query};query.single=async()=>({data:{id:'saved'}});
  const context=vm.createContext({configured:true,currentSession:{user:{id:'owner'}},supabase:{from:()=>query},hasMembership:async()=>true});
  const auth=fs.readFileSync(require.resolve('../js/auth.js'),'utf8');
  for(const name of ['addItinerary','updateItinerary'])vm.runInContext(auth.match(new RegExp('async function '+name+'\\([^]*?\\n\\}'))[0],context);
  await context.updateItinerary('original',{name:'Revised',year:2026,segments:[],booking_contract_id:'c',user_id:'wrong-owner'});
  assert.ok(calls.some(c=>c[0]==='eq'&&c[1]==='id'&&c[2]==='original'));
  assert.ok(calls.some(c=>c[0]==='eq'&&c[1]==='user_id'&&c[2]==='owner'));
  assert.equal(calls.find(c=>c[0]==='update')[1].user_id,undefined);
  calls.length=0;await context.addItinerary({id:'retry-id',name:'Copy',user_id:'wrong-owner'});
  assert.equal(calls[0][0],'upsert');assert.equal(calls[0][1].id,'retry-id');assert.equal(calls[0][1].user_id,'owner');
});
