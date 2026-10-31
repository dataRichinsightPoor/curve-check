import test from 'node:test';
import assert from 'node:assert/strict';
import {CASES,generate,audit} from '../web/engine.js';
import {normalizeRaw,effectDose,twinResponse,INTERVENTIONS} from '../web/scenarios.js';
test('28 unique scenarios are available',()=>{assert.equal(CASES.length,28);assert.equal(new Set(CASES.map(c=>c.id)).size,28);});
test('artifact primary observations are exactly identical to comparator',()=>{
  for(const id of ['reporter','cell-loss','solvent','position'])assert.deepEqual(generate(id),generate('complete'));
});
test('artifact curve passes numerical localization without validating attribution',()=>{
  assert.ok(audit(generate('reporter')).relativeSupported);
});
test('all toy causes share their primary signal',()=>{
  for(const x of [.01,1,10,100,10000])for(let h=1;h<5;h++)assert.equal(twinResponse(h,0,x),twinResponse(0,0,x));
});
test('every intervention applies its stipulated binary mask',()=>{
  for(let k=0;k<INTERVENTIONS.length;k++)for(let h=0;h<5;h++)assert.equal(twinResponse(h,k,10),INTERVENTIONS[k].mask[h]?52:100);
});
test('self min-max makes a four-unit effect look like full-scale response',()=>{
  assert.deepEqual(normalizeRaw([100,98,96],96,100),[100,50,0]);
  assert.deepEqual(normalizeRaw([100,98,96],0,100),[100,98,96]);
});
test('invalid or degenerate normalization references are rejected',()=>{
  for(const controls of [[1,1],[2,1],[NaN,1],[0,Infinity]])assert.throws(()=>normalizeRaw([1],...controls));
});
test('parallel curves have constant dose ratio at every tested effect',()=>{
  for(const e of [.01,.2,.5,.8,.99])assert.ok(Math.abs(effectDose(Math.log10(20),1,e)/effectDose(1,1,e)-2)<1e-12);
});
test('nonparallel curves retain midpoint ratio but differ at 20 and 80 percent',()=>{
  const ratio=e=>effectDose(Math.log10(20),.5,e)/effectDose(1,1,e);
  assert.ok(Math.abs(ratio(.2)-.5)<1e-12);assert.ok(Math.abs(ratio(.5)-2)<1e-12);assert.ok(Math.abs(ratio(.8)-8)<1e-12);
});
test('effect dose rejects endpoints and nonpositive slopes',()=>{
  for(const [h,e] of [[1,0],[1,1],[0,.5],[-1,.5]])assert.throws(()=>effectDose(1,h,e));
});
test('sparse scenario has five positive dose groups and is not localized',()=>{
  assert.equal(new Set(generate('sparse').map(r=>r.x)).size,5);assert.equal(audit(generate('sparse')).relativeSupported,false);
});
