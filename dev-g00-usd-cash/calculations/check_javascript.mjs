// Node.js 18+ optional validation tool. Does not replace a real browser test.
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
let code=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean).join('\n');
code=code.slice(0,code.lastIndexOf('loadDashboardData().then('));
const data=JSON.parse(fs.readFileSync(path.join(root,'data.js'),'utf8').split('=').slice(1).join('=').trim().slice(0,-1));
let fetches=0;const context=vm.createContext({window:{DASHBOARD_DATA:data},location:{protocol:'file:'},document:{querySelector:()=>({content:data.summary.dashboard})},fetch:()=>{fetches++;throw Error('Unexpected network call')},Date,Math,Number,Intl,Error,console});vm.runInContext(code,context);
const rows=[];function test(id,fn,expected){let actual;try{actual=fn();rows.push({id,expected,actual,pass:actual===expected});}catch(e){rows.push({id,expected,error:e.message,pass:false});}}
let loaded=await vm.runInContext('loadDashboardData()',context);rows.push({id:'file-protocol saved-data loader',expected:'same object, zero network requests',actual:{same:loaded===data,fetches},pass:loaded===data&&fetches===0});
context.payload=data;
test('valid dataset accepted',()=>vm.runInContext('checkData(payload.summary,payload.data); true',context),true);
let q=data.data.instruments[0];context.q=q;
test('JS matches Python real amount within one cent',()=>vm.runInContext('Math.abs(calc(100000,q.discount_pct,q.days,3).real-q.default_result.real_end)<.01',context),true);
test('higher inflation reduces real proceeds',()=>vm.runInContext('calc(100000,q.discount_pct,q.days,6).real<calc(100000,q.discount_pct,q.days,3).real',context),true);
test('nominal independent of inflation',()=>vm.runInContext('calc(100000,q.discount_pct,q.days,6).nom===calc(100000,q.discount_pct,q.days,3).nom',context),true);
test('doubled principal doubles real proceeds',()=>vm.runInContext('calc(200000,q.discount_pct,q.days,3).real===2*calc(100000,q.discount_pct,q.days,3).real',context),true);
test('invalid principal rejects',()=>vm.runInContext('(()=>{try{calc(0,4,91,3);return false}catch(e){return true}})()',context),true);
test('nonfinite input rejects',()=>vm.runInContext('(()=>{try{calc(NaN,4,91,3);return false}catch(e){return true}})()',context),true);
test('freshness on build day',()=>vm.runInContext('freshness(payload.data,new Date("2026-10-27T12:00:00Z")).stale',context),false);
test('staleness after 90 days',()=>vm.runInContext('freshness(payload.data,new Date("2027-01-25T12:00:00Z")).stale',context),true);
context.bad=JSON.parse(JSON.stringify(data));context.bad.data.config.rate_unit='basis-points';
test('wrong unit rejected',()=>vm.runInContext('(()=>{try{checkData(bad.summary,bad.data);return false}catch(e){return true}})()',context),true);
context.bad=JSON.parse(JSON.stringify(data));context.bad.data.instruments[0].discount_pct=null;
test('missing latest quote rejected',()=>vm.runInContext('(()=>{try{checkData(bad.summary,bad.data);return false}catch(e){return true}})()',context),true);
test('October 2025 CPI stays null',()=>data.data.cpi.levels[data.data.cpi.dates.indexOf('2025-10')]===null,true);
const report={environment:'Node VM with minimal metadata stub; not a rendered browser',checks:rows,all_pass:rows.every(x=>x.pass)};
fs.writeFileSync(path.join(root,'evidence/javascript_checks.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({checks:rows.length,all_pass:report.all_pass}));if(!report.all_pass)process.exit(1);
