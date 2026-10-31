import test from 'node:test';
import assert from 'node:assert/strict';
import {predict,parseCSV,groupRows,fit,profile,audit,generate,CASES,MODES,targetDose,crossings,leaveOneDoseOut} from '../web/engine.js';

const full=()=>generate('complete');
test('relative midpoint is exactly halfway between asymptotes',()=>{
  assert.equal(predict(10,{bottom:20,top:100,m:1,h:1.5}),60);
});
test('zero is evaluated at the exact top, not a fake positive dose',()=>{
  assert.equal(predict(0,{bottom:0,top:101,m:-5,h:2}),101);
});
test('absolute and relative crossing differ for a partial response',()=>{
  assert.ok(Math.abs(targetDose({bottom:20,top:100,m:1,h:1})-50/3)<1e-10);
});
test('absolute midpoint is absent above a 50% lower plateau',()=>{
  assert.equal(targetDose({bottom:65,top:100,m:1,h:1}),null);
  assert.equal(targetDose({bottom:50,top:100,m:1,h:1}),null);
});
test('CSV accepts an exact header, repeats and true zero',()=>{
  const r=parseCSV('concentration,response\n0,100\n.1,98\n.1,99\n1,85\n10,50\n100,8\n1000,2');
  assert.equal(r.length,7);assert.equal(groupRows(r)[1].n,2);
});
for(const [name,text] of [
  ['negative concentration','-1,100'],['NaN response','1,NaN'],['missing cell','1,'],
  ['extra column','1,100,plate1'],['unrecognized header','drug,activity'],['clipped normalization','1,200'],
  ['nonfinite concentration','Infinity,90']
])test(`CSV rejects ${name}`,()=>assert.throws(()=>parseCSV(text+'\n.1,90\n1,85\n10,50\n100,8\n1000,2')));
test('CSV rejects fewer than five positive doses',()=>assert.throws(()=>parseCSV('0,100\n1,90\n1,91\n10,50\n100,0')));
test('CSV caps total observations',()=>assert.throws(()=>parseCSV(Array(1002).fill('1,2').join('\n'))));
test('CSV caps unique doses',()=>assert.throws(()=>parseCSV(Array.from({length:101},(_,i)=>`${i+1},80`).join('\n'))));
test('concentration means have equal fitting weight regardless of replication count',()=>{
  const a=[1,2,3,4,5].map((x,i)=>({x,y:100-i*15}));
  const b=[...a,...Array(20).fill(a[2])];
  const f=fit(groupRows(a)),g=fit(groupRows(b));assert.ok(Math.abs(f.sse-g.sse)<1e-8);
});
test('seeded synthetic experiments reproduce exactly',()=>assert.deepEqual(generate('complete'),generate('complete')));
test('different seeds change observations',()=>assert.notDeepEqual(full(),generate('complete',{seed:43})));
test('complete curve supports both quantities under teaching criteria',()=>{
  const a=audit(full());assert.ok(a.relativeSupported);assert.ok(a.absoluteSupported);
  assert.ok(a.profile.lower<a.fit.m && a.fit.m<a.profile.upper);
});
test('truncated curve is not endorsed and is not assigned an unconditional bound',()=>{
  const a=audit(generate('truncated'));assert.equal(a.relativeSupported,false);
  assert.equal(a.absoluteStatus,'50% not reached');assert.match(a.absoluteText,/finite IC50/);
});
test('partial effect supports relative but not absolute IC50',()=>{
  const a=audit(generate('partial'));assert.ok(a.relativeSupported);assert.equal(a.absolute,null);assert.equal(a.absoluteSupported,false);
});
test('flat data do not receive relative endorsement',()=>assert.equal(audit(generate('flat')).relativeSupported,false));
test('left-range series reports conditional rather than exact potency',()=>{
  const a=audit(generate('left'));assert.equal(a.absoluteStatus,'Below tested range');assert.match(a.absoluteText,/conditional/);
});
test('high-dose rebound is a model mismatch',()=>{
  const a=audit(generate('hook'));assert.ok(a.reversed);assert.equal(a.absoluteStatus,'Model mismatch');
});
test('shallow curve can bracket absolute threshold without identifying relative midpoint',()=>{
  const a=audit(generate('shallow'));assert.equal(a.relativeSupported,false);assert.ok(a.absoluteSupported);
});
test('influential concentration produces review flags',()=>assert.ok(audit(generate('outlier')).flags.length>0));
test('fixed models enforce their declared parameters',()=>{
  const groups=groupRows(full());
  assert.equal(fit(groups,'bottom').bottom,0);assert.equal(fit(groups,'both').top,100);assert.equal(fit(groups,'slope').h,1);
});
test('unvalidated controls disable absolute threshold support',()=>{
  const a=audit(full(),'free',false);assert.equal(a.absoluteSupported,false);assert.equal(a.absoluteStatus,'Reference undefined');
});
test('all numerical fits remain finite and ordered across every case and mode',()=>{
  for(const c of CASES)for(const mode of Object.keys(MODES)){
    const f=fit(groupRows(generate(c.id)),mode);
    for(const k of ['sse','m','h','top','bottom'])assert.ok(Number.isFinite(f[k]),`${c.id} ${mode} ${k}`);
    assert.ok(f.top>=f.bottom);assert.ok(f.h>=.1-1e-12&&f.h<=5+1e-12);
  }
});
test('observed crossing interpolates in log dose',()=>{
  const c=crossings([{x:1,y:75},{x:100,y:25}],50)[0];assert.equal(c.estimate,10);
});
test('an exact 50% observation is counted once, not as two adjacent brackets',()=>{
  const c=crossings([{x:1,y:75},{x:10,y:50},{x:100,y:25}],50);
  assert.equal(c.length,1);assert.equal(c[0].estimate,10);
});
test('a plateau exactly at the threshold is not a unique crossing',()=>{
  assert.equal(crossings([{x:1,y:75},{x:10,y:50},{x:100,y:50}],50).length,2);
});
test('AICc includes variance parameter and is unavailable at insufficient n',()=>{
  const g=groupRows(full()).slice(0,6);assert.equal(fit(g,'free').aicc,null);
});
test('zero residual variance is not sold as an exact confidence interval',()=>{
  const g=Array.from({length:10},(_,i)=>({x:10**(-2+i*.6),y:predict(10**(-2+i*.6),{bottom:0,top:100,m:1,h:1})}));
  const f=fit(g,'both'),p=profile(g,f);assert.equal(p.available,false);
});
test('dose omission does not mutate inputs and reports all positive groups',()=>{
  const rows=full(),copy=JSON.stringify(rows),r=leaveOneDoseOut(rows);
  assert.equal(r.records.length,13);assert.equal(JSON.stringify(rows),copy);assert.ok(r.maximum>=r.minimum);
});
