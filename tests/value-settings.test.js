const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup(save) {
  let timer;
  const context = vm.createContext({
    window:{DVCAuth:{saveUserSettings:save}},
    document:{getElementById:()=>null},
    clearTimeout:()=>{},setTimeout:callback=>{timer=callback;return 1;}
  });
  vm.runInContext('let settingsSaveTimer, settingsSaveQueue=Promise.resolve(), settingsRevision=0, settingsSaveNote="", userSettings={point_value_baseline:21};',context);
  const source=fs.readFileSync(require.resolve('../trips.html'),'utf8');
  vm.runInContext(source.slice(source.indexOf('function scheduleSettingsSave()'),source.indexOf('function attachAssumptionsListeners()')),context);
  return {context,run:code=>vm.runInContext(code,context),flush:()=>timer()};
}
test('assumption writes are serialized; a slow old request cannot overwrite the latest settings',async()=>{
  const calls=[];let release;
  const ui=setup(async settings=>{calls.push(settings.point_value_baseline);if(calls.length===1)await new Promise(r=>release=r);return {};});
  ui.run('scheduleSettingsSave()');ui.flush();await new Promise(setImmediate);
  ui.run('userSettings={point_value_baseline:35};scheduleSettingsSave()');ui.flush();await new Promise(setImmediate);
  assert.deepEqual(calls,[21]);release();await ui.run('settingsSaveQueue');
  assert.deepEqual(calls,[21,35]);assert.match(ui.run('settingsSaveNote'),/^Saved/);
});
test('failed assumptions stay labeled as preview; retry clears the failure only after success',async()=>{
  let fails=true;
  const ui=setup(async()=>fails?{error:'offline'}:{});
  ui.run('scheduleSettingsSave()');ui.flush();await ui.run('settingsSaveQueue');
  assert.match(ui.run('settingsSaveNote'),/Preview only/);
  fails=false;ui.run('scheduleSettingsSave()');ui.flush();await ui.run('settingsSaveQueue');
  assert.match(ui.run('settingsSaveNote'),/^Saved/);
});
