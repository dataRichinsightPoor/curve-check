import test from 'node:test';
import assert from 'node:assert/strict';
import {SOURCE_SCHEMA,parseRaw,reconstruct,sourceConclusion,sourceDemo,weakSignalDemo,signalAudit,restoreSource,verifiedSimulation} from '../web/source-engine.js';
import {audit} from '../web/engine.js';
const text=sourceDemo();
test('raw reconstruction retains all samples and independent control observations',()=>{
 const r=reconstruct(text);assert.equal(r.records.length,45);assert.equal(r.samples.length,39);assert.equal(r.neutral.mean,100);assert.equal(r.full.mean,0);assert.equal(r.neutral.sd,1);assert.equal(r.full.sd,1);
});
test('independent controls retain tiny effect; self scaling expands its displayed span',()=>{
 const r=reconstruct(text);assert.ok(r.controlSpan>4&&r.controlSpan<4.2);assert.equal(Math.min(...r.variants.self.map(r=>r.y)),0);assert.equal(Math.max(...r.variants.self.map(r=>r.y)),100);assert.deepEqual(r.variants.control.map(r=>r.x),r.samples.map(r=>r.x));
});
test('missing control observations cannot be fabricated from extrema',()=>{
 assert.throws(()=>reconstruct(text.split('\n').filter(s=>!s.startsWith('full,')).join('\n')),/Missing full/);
});
test('swapped references are rejected',()=>{
 assert.throws(()=>reconstruct(text.replaceAll('neutral','temporary').replaceAll('full','neutral').replaceAll('temporary','full')),/Neutral mean/);
});
test('unknown roles, scripts, blank signals and infinite signals rejected',()=>{
 for(const s of ['artifact,,1','sample,1,<script>','sample,1,','sample,1,Infinity'])assert.throws(()=>parseRaw(text+'\n'+s));
});
test('dose range and distinct-dose bounds match curve engine',()=>{
 for(const s of ['sample,-1,100','sample,1e-13,100','sample,1e13,100'])assert.throws(()=>parseRaw(text+'\n'+s));
 assert.throws(()=>parseRaw('role,concentration,signal\nneutral,,100\nfull,,0\nsample,1,50'));
});
test('zero sample dose is retained exactly',()=>{
 const r=reconstruct(text+'\nsample,0,100');assert.equal(r.variants.control.at(-1).x,0);assert.equal(r.variants.control.at(-1).y,100);
});
test('out-of-control-range observations retained without clipping',()=>{
 const r=reconstruct(text+'\nsample,0,160');assert.equal(r.variants.control.at(-1).y,160);assert.ok(r.flags.some(t=>t.includes('retained')));
});
test('constant samples have no defined self-scaled branch',()=>{
 const r=reconstruct(text.replace(/sample,([^,\n]+),[^\n]+/g,'sample,$1,98'));assert.equal(r.variants.self,null);assert.equal(r.controlSpan,0);
});
test('single control well yields unknown SD and explicit warning',()=>{
 const r=reconstruct(text.replace('neutral,,99\n','').replace('neutral,,101\n',''));assert.equal(r.neutral.sd,null);assert.ok(r.flags.some(s=>s.includes('one well')));
});
test('claim cannot be promoted by self-scaling or target label',()=>{
 const r=reconstruct(text);assert.match(sourceConclusion(r,'self','target'),/withheld/);assert.match(sourceConclusion(r,'control','target'),/attribution remains unverified/);
});
test('raw records round trip; stored numerical conclusions are ignored',()=>{
 const d=restoreSource({schema:SOURCE_SCHEMA,rawCSV:text,rule:'control',scope:'target',metadata:{source:'test'},numerical:{relativeSupported:true},claim:'Validated'});
 assert.equal(d.rawCSV,text);assert.deepEqual(d.result,reconstruct(text));assert.equal(d.claim,undefined);
});
test('invalid source records cannot be restored',()=>{
 for(const d of [{},{schema:SOURCE_SCHEMA,rawCSV:text,rule:'unknown'}])assert.throws(()=>restoreSource(d));
});
test('weak-response generator is deterministic and separates effect from noise',()=>{
 assert.equal(weakSignalDemo(20,10),weakSignalDemo(20,10));assert.notEqual(weakSignalDemo(20,10),weakSignalDemo(20,1));
 const r=reconstruct(weakSignalDemo(20,0));assert.ok(r.controlSpan>19&&r.controlSpan<20);assert.equal(r.samples.length,39);
});
test('zero-effect zero-noise data are truly constant without a finite AICc contrast',()=>{
 const r=reconstruct(weakSignalDemo(0,0)),s=signalAudit(r.variants.control,null);assert.equal(s.span,0);assert.equal(s.flatRMSE,0);assert.equal(s.flatAicc,null);
});
test('constant-model AICc uses two parameters on the same concentration means',()=>{
 const r=reconstruct(weakSignalDemo(20,10)),a=audit(r.variants.control),s=signalAudit(r.variants.control,a.fit),n=s.groups.length;
 assert.ok(Math.abs(s.flatAicc-(n*Math.log(s.flatSSE/n)+4+12/(n-3)))<1e-10);
 assert.ok(Math.abs(s.deltaAicc-(a.fit.aicc-s.flatAicc))<1e-10);assert.ok(s.meanNoise>0);
});
test('weak-response generator rejects invalid effect and noise settings',()=>{
 assert.throws(()=>weakSignalDemo(101,1));assert.throws(()=>weakSignalDemo(20,-1));
});
test('edge contrast uses fixed disjoint positive-dose groups, not observed extrema',()=>{
 const rows=[{x:0,y:500},...[1,2,3,4,5,6,7].map((x,i)=>({x,y:[100,98,102,-500,80,82,78][i]}))];
 const s=signalAudit(rows);
 assert.equal(s.edgeCount,3);assert.equal(s.lowEdge,100);assert.equal(s.highEdge,80);assert.equal(s.edgeContrast,20);assert.equal(s.span,1000);
 assert.equal(signalAudit(rows.slice(1,6)).edgeCount,2);
});
test('simulation truth requires exact regeneration and a valid seed',()=>{
 const recipe={generator:'weak-signal-v1',effect:20,noise:20,seed:42},text=weakSignalDemo(20,20,42);
 assert.deepEqual(verifiedSimulation(recipe,text),recipe);
 assert.equal(verifiedSimulation({...recipe,effect:0},text),null);
 assert.equal(verifiedSimulation(recipe,text+'\n'),null);
 assert.equal(verifiedSimulation(null,text),null);
 assert.equal(verifiedSimulation({generator:'weak-signal-v1'},weakSignalDemo()),null);
 for(const seed of [0,-1,1.5,1000000,NaN])assert.throws(()=>weakSignalDemo(20,20,seed),/seed/);
 assert.notEqual(text,weakSignalDemo(20,20,43));
});
test('matched weak and flat presets retain identical controls and random well errors',()=>{
 const weak=parseRaw(weakSignalDemo(20,20,42)),flat=parseRaw(weakSignalDemo(0,20,42));
 assert.deepEqual(weak.filter(r=>r.role!=='sample'),flat.filter(r=>r.role!=='sample'));
});
test('optional simulation recipe is restored without trusting forged truth',()=>{
 const recipe={generator:'weak-signal-v1',effect:0,noise:20,seed:42};
 const value={schema:SOURCE_SCHEMA,rawCSV:weakSignalDemo(0,20,42),rule:'control',simulation:recipe};
 assert.deepEqual(restoreSource(value).simulation,recipe);
 assert.equal(restoreSource({...value,simulation:{...recipe,effect:20}}).simulation,null);
});
