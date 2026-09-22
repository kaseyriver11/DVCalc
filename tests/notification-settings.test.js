const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../account.html'),'utf8');
function setup(updateProfile) {
  const nodes={};
  for(const id of ['notif-settings-status','notif-settings-save','n-email-enabled','n-lead-days','n-inapp-enabled'])nodes[id]={checked:true,value:'14',disabled:false,classList:{add(){},remove(){}}};
  const context=vm.createContext({window:{DVCAuth:{updateProfile}},document:{getElementById:id=>nodes[id],querySelectorAll:()=>Object.values(nodes)},closeNotifSettings(){},renderSignedIn:async()=>{}});
  vm.runInContext('let notificationSettingsSaving=false;let currentProfile={push_enabled:true,push_subscription:{pending:true}};',context);
  vm.runInContext(source.slice(source.indexOf('async function saveNotificationSettings()'),source.indexOf('async function handleDeleteAccount()')),context);
  return {nodes,save:()=>vm.runInContext('saveNotificationSettings()',context),profile:()=>vm.runInContext('currentProfile',context)};
}
test('settings save clears legacy push state and preserves selected working channels',async()=>{
  let patch;const ui=setup(async p=>{patch=p;return {};});
  ui.nodes['n-inapp-enabled'].checked=false;await ui.save();
  assert.equal(patch.push_enabled,false);assert.equal(patch.push_subscription,null);
  assert.equal(patch.reminder_opt_in,true);assert.equal(patch.in_app_notifications_enabled,false);assert.equal(patch.reminder_lead_days,14);
});
test('failed and thrown saves keep choices and allow retry without claiming success',async()=>{
  for(const fail of [async()=>({error:'offline'}),async()=>{throw Error('offline')}]){
    const ui=setup(fail);ui.nodes['n-lead-days'].value='30';await ui.save();
    assert.equal(ui.nodes['n-lead-days'].value,'30');assert.equal(ui.nodes['notif-settings-save'].disabled,false);
    assert.match(ui.nodes['notif-settings-status'].textContent,/retry/);assert.equal(ui.profile().push_enabled,true);
  }
});
test('duplicate save taps do not create overlapping profile writes',async()=>{
  let release,calls=0;const ui=setup(()=>{calls++;return new Promise(r=>release=r)});
  const first=ui.save();await ui.save();assert.equal(calls,1);release({});await first;
});
test('invalid lead time is not silently saved or replaced',async()=>{
  let calls=0;const ui=setup(async()=>{calls++;return {}});
  for(const value of ['', '0', '241', '1.5']){ui.nodes['n-lead-days'].value=value;await ui.save();}
  assert.equal(calls,0);
});
test('unavailable push has no permission request or enabled toggle',()=>{
  assert.doesNotMatch(source,/requestPermission\(|enablePushNotifications\(|id="n-push-enabled"/);
  assert.match(source,/notif-unavailable-badge">Unavailable/);
  assert.match(source,/window\.Notification\?\.permission === 'denied'/);
});
