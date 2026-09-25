const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const allocator=require('../js/dvc-plan-funding.js');
const page=fs.readFileSync(path.join(__dirname,'../itinerarycompare.html'),'utf8');
function setup(){
 const c=vm.createContext({window:{DVCPlanFunding:allocator},activeContracts:[],contractYearPoints:[],RESORTS:['ssr','akv','rivieraResort'].flatMap(id=>[2026,2027].map(year=>({id,year}))),getPointsForDate:()=>55,shorthandResortName:id=>id});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/dvc-dates.js'),'utf8'),c);
 c.window.DVCDates.todayInEastern=()=>({year:2026,month:9,day:21});
 const auth=fs.readFileSync(path.join(__dirname,'../js/auth.js'),'utf8');
 vm.runInContext(auth.slice(auth.indexOf('const HOME_ONLY_RESALE_RESORTS'),auth.indexOf('// Direct-purchase minimum points')),c);
 c.window.DVCAuth={getUserResortAccess:c.getUserResortAccess};
 for(const name of ['resortName','nightsBetween','stayDateRange','monthsBeforeCheckIn','formatShortDate','getYearRowForDate','fundingText','calcFeasibility'])vm.runInContext(page.match(new RegExp('function '+name+'\\([^]*?\\n\\}'))[0],c);
 c.add=(id,home,points,type='direct',year=2026,uy='Feb')=>{c.activeContracts.push({id,home_resort_id:home,purchase_type:type,points_per_year:150,use_year:uy,is_active:true});c.contractYearPoints.push({contract_id:id,use_year_label:year,balance_confirmed_at:'2026-09-22',points_remaining:points});};
 c.plan=(resort='akv',date='2026-10-01',end='2026-10-02')=>({year:Number(date.slice(0,4)),segments:[{resortId:resort,roomTypeId:'studio',checkIn:date,checkOut:end}]});
 return c;
}
test('Riviera resale cannot fund AKV even alongside an empty eligible contract',()=>{const c=setup();c.add('a','ssr',0);c.add('b','rivieraResort',100,'resale');const r=c.calcFeasibility(c.plan());assert.equal(r.badge,'Needs points');assert.match(r.detail,/55 pts not allocated/);assert.doesNotMatch(r.detail,/<strong>rivieraResort/);});
test('restricted-only ownership explicitly reports a contract restriction',()=>{const c=setup();c.add('b','rivieraResort',100,'resale');assert.equal(c.calcFeasibility(c.plan()).badge,'Contract restricted');});
test('shared balances cannot be reused for separate segments',()=>{const c=setup();c.add('a','ssr',60);const p=c.plan();p.segments.push({...p.segments[0],checkIn:'2026-10-02',checkOut:'2026-10-03'});assert.match(c.calcFeasibility(p).detail,/50 pts not allocated/);});
test('allocator reassigns flexible points so restricted segment stays fundable',()=>{const c=setup();c.add('flex','ssr',55);c.add('restricted','rivieraResort',55,'resale');const p=c.plan('rivieraResort');p.segments.push(c.plan('akv','2026-10-02','2026-10-03').segments[0]);assert.equal(c.calcFeasibility(p).badge,'Points covered');});
test('funding from a closed seven-month window is not shown as available now',()=>{const c=setup();c.add('a','ssr',100,'direct',2027);assert.equal(c.calcFeasibility(c.plan('akv','2027-06-01','2027-06-02')).badge,'Window not open');});
test('each night uses its own cycle; later balance cannot hide an earlier shortage',()=>{const c=setup();c.add('a','ssr',0);c.contractYearPoints.push({contract_id:'a',use_year_label:2027,balance_confirmed_at:'2026-09-22',points_remaining:150});const p=c.plan('ssr','2027-01-31','2027-02-02');assert.match(c.calcFeasibility(p).detail,/55 pts not allocated/);assert.match(c.calcFeasibility(p).detail,/Feb 2027/);});
test('unrecorded balances need input, missing charts and past stays require review',()=>{const c=setup();c.add('a','ssr',150);c.contractYearPoints=[];assert.equal(c.calcFeasibility(c.plan()).badge,'Balance not confirmed');c.getPointsForDate=()=>null;assert.equal(c.calcFeasibility(c.plan()).badge,'Needs review');c.getPointsForDate=()=>55;assert.equal(c.calcFeasibility(c.plan('ssr','2026-08-01','2026-08-02')).badge,'Needs review');});
test('holding and speculative future borrowing do not create a success indicator',()=>{const c=setup();c.add('a','ssr',0);c.contractYearPoints[0].points_holding=100;const r=c.calcFeasibility(c.plan());assert.equal(r.badge,'Review holding points');assert.match(r.detail,/Holding points excluded/);});
test('already banked and borrowed points are usable only in their recorded cycle',()=>{const c=setup();c.add('a','ssr',5);Object.assign(c.contractYearPoints[0],{points_banked:25,points_borrowed:25});assert.equal(c.calcFeasibility(c.plan()).badge,'Points covered');});
// Rollover, not clamping: Disney opens the window for a check-in whose
// same-day-N-months-earlier doesn't exist on the 1st of the following month
// (Sep 30 - 7 months = "Feb 30" = Mar 2). Matches app.js, compare.html,
// suggest.html and dvc-dates.js; the old clamp put this page a day early.
test('booking-window subtraction rolls over like every other page',()=>{const c=setup();assert.equal(c.monthsBeforeCheckIn('2027-09-30',7),'2027-03-02');assert.equal(c.monthsBeforeCheckIn('2027-09-15',7),'2027-02-15');});
