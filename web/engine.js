// Original numerical implementation. No runtime dependencies.
import {EXTRA_CASES} from './scenarios.js';
export const VERSION = '0.4.0';
export const MODES = {
  free: {name: 'Free 4PL', p: 4},
  bottom: {name: 'Bottom = 0', p: 3},
  both: {name: 'Top = 100; bottom = 0', p: 2},
  slope: {name: 'Hill slope = 1', p: 3}
};
export const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export function predict(x, f) {
  if (x === 0) return f.top;
  return f.bottom + (f.top - f.bottom) / (1 + 10 ** clamp(f.h * (Math.log10(x) - f.m), -300, 300));
}
export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(s => s.trim());
  if (lines.length > 1001) throw Error('Maximum 1,000 observations per audit.');
  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    const cells = lines[i].trim().split(/[,\t;]/).map(s => s.trim());
    if (i === 0 && /^(concentration|dose)$/i.test(cells[0]) && /^response$/i.test(cells[1]) && cells.length === 2) continue;
    if (cells.length !== 2 || cells.some(s => s === '')) throw Error(`Line ${i + 1}: use exactly two columns, concentration,response.`);
    const [x,y] = cells.map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1e12 || (x > 0 && x < 1e-12))
      throw Error(`Line ${i + 1}: finite responses and concentrations from 0 or 1e-12 to 1e12 are required.`);
    if (y < -50 || y > 150) throw Error(`Line ${i + 1}: response must be normalized remaining activity between -50 and 150%. Do not clip data; investigate normalization.`);
    rows.push({x,y});
  }
  if (rows.length < 5) throw Error('Provide at least five observations.');
  if (new Set(rows.filter(r => r.x > 0).map(r => r.x)).size < 5) throw Error('Provide at least five distinct positive concentrations.');
  if (new Set(rows.map(r => r.x)).size > 100) throw Error('Maximum 100 distinct concentrations per audit.');
  return rows;
}
export function groupRows(rows) {
  const map = new Map();
  for (const {x,y} of rows) { if (!map.has(x)) map.set(x, []); map.get(x).push(y); }
  return [...map].sort((a,b) => a[0]-b[0]).map(([x,ys]) => {
    const y = mean(ys), ss = ys.reduce((s,v) => s + (v-y)**2, 0);
    return {x, y, ys, n: ys.length, sd: ys.length > 1 ? Math.sqrt(ss/(ys.length-1)) : null};
  });
}
function golden(fn, lo, hi, steps=32) {
  const q = (Math.sqrt(5)-1)/2;
  let a=hi-q*(hi-lo), b=lo+q*(hi-lo), fa=fn(a), fb=fn(b);
  for(let i=0;i<steps;i++) {
    if(fa<fb) { hi=b; b=a; fb=fa; a=hi-q*(hi-lo); fa=fn(a); }
    else { lo=a; a=b; fa=fb; b=lo+q*(hi-lo); fb=fn(b); }
  }
  return fa<fb ? a:b;
}
// Conditional bounded linear least squares in bottom and top, given m and h.
// Enumerate the interior, box edges and the T=B edge of the feasible triangle.
export function conditional(groups, m, h, mode='free') {
  const z = groups.map(g => g.x===0 ? 1 : 1/(1+10**clamp(h*(Math.log10(g.x)-m),-300,300)));
  let aa=0,ab=0,bb=0,ay=0,by=0;
  groups.forEach((g,i)=>{ const a=1-z[i], b=z[i]; aa+=a*a; ab+=a*b; bb+=b*b; ay+=a*g.y; by+=b*g.y; });
  let candidates=[];
  if(mode==='both') candidates=[[0,100]];
  else if(mode==='bottom') candidates=[[0,clamp(by/Math.max(bb,1e-300),0,150)]];
  else {
    const det=aa*bb-ab*ab;
    if(det>1e-16) candidates.push([(ay*bb-by*ab)/det,(by*aa-ay*ab)/det]);
    for(const B of [-50,150]) candidates.push([B,clamp((by-ab*B)/Math.max(bb,1e-300),B,150)]);
    for(const T of [-50,150]) candidates.push([clamp((ay-ab*T)/Math.max(aa,1e-300),-50,T),T]);
    const flat=clamp(mean(groups.map(g=>g.y)),-50,150); candidates.push([flat,flat]);
  }
  let best={sse:Infinity};
  for(const [bottom,top] of candidates) {
    if(bottom < -50-1e-8 || top > 150+1e-8 || top<bottom) continue;
    const sse=groups.reduce((s,g,i)=>s+(g.y-bottom-(top-bottom)*z[i])**2,0);
    if(sse<best.sse) best={bottom,top,m,h,sse,mode};
  }
  return best;
}
function atM(groups,m,mode) {
  if(mode==='slope') return conditional(groups,m,1,mode);
  const lo=Math.log10(.1), hi=Math.log10(5), count=28;
  let vals=[];
  for(let i=0;i<=count;i++) { const l=lo+(hi-lo)*i/count; vals.push({l,f:conditional(groups,m,10**l,mode)}); }
  vals.sort((a,b)=>a.f.sse-b.f.sse);
  let best=vals[0].f;
  for(const v of vals.slice(0,2)) {
    const l=golden(k=>conditional(groups,m,10**k,mode).sse,Math.max(lo,v.l-(hi-lo)/count),Math.min(hi,v.l+(hi-lo)/count));
    const f=conditional(groups,m,10**l,mode); if(f.sse<best.sse) best=f;
  }
  return best;
}
export function fit(groups,mode='free') {
  const logs=groups.filter(g=>g.x>0).map(g=>Math.log10(g.x)), lo=Math.min(...logs)-4, hi=Math.max(...logs)+4;
  const count=90, grid=[];
  for(let i=0;i<=count;i++) grid.push(atM(groups,lo+(hi-lo)*i/count,mode));
  grid.sort((a,b)=>a.sse-b.sse);
  let best=grid[0];
  for(const start of grid.slice(0,3)) {
    const m=golden(v=>atM(groups,v,mode).sse,Math.max(lo,start.m-(hi-lo)/count),Math.min(hi,start.m+(hi-lo)/count),25);
    const f=atM(groups,m,mode); if(f.sse<best.sse) best=f;
  }
  const n=groups.length, k=MODES[mode].p+1, sst=groups.reduce((s,g)=>s+(g.y-mean(groups.map(v=>v.y)))**2,0);
  return {...best,lo,hi,n,rmse:Math.sqrt(best.sse/n),r2:sst>1e-12 ? 1-best.sse/sst : null,
    aicc:n>k+1 ? n*Math.log(Math.max(best.sse/n,1e-20))+2*k+2*k*(k+1)/(n-k-1) : null,
    boundary:best.m-lo<.01 || hi-best.m<.01 || best.h<.101 || best.h>4.99 ||
      best.bottom< -49.99 || best.top>149.99 || best.top-best.bottom<.01};
}
export function profile(groups,f) {
  // Unknown common Gaussian variance profiled out: LR = n log(SSE(m)/SSEmin).
  const xs=[f.m];
  for(let i=0;i<=140;i++) xs.push(f.lo+(f.hi-f.lo)*i/140);
  for(let i=0;i<=120;i++) xs.push(clamp(f.m-1+2*i/120,f.lo,f.hi));
  const pts=[...new Set(xs)].sort((a,b)=>a-b).map(m=>{
    const g=atM(groups,m,f.mode);
    return {m,lr:Math.max(0,groups.length*Math.log(Math.max(g.sse,1e-20)/Math.max(f.sse,1e-20))),sse:g.sse};
  });
  const center=pts.findIndex(v=>v.m===f.m), cutoff=3.841458820694124;
  let left=center,right=center;
  while(left>0 && pts[left-1].lr<=cutoff) left--;
  while(right<pts.length-1 && pts[right+1].lr<=cutoff) right++;
  const cross=(a,b)=>a.m+(cutoff-a.lr)*(b.m-a.m)/(b.lr-a.lr);
  const lower=left===0 ? null : cross(pts[left-1],pts[left]);
  const upper=right===pts.length-1 ? null : cross(pts[right],pts[right+1]);
  const disconnected=pts.some((p,i)=>(i<left || i>right) && p.lr<=cutoff);
  return {points:pts,lower,upper,cutoff,disconnected,available:groups.length>MODES[f.mode].p+1 && f.sse>1e-8,
    method:'Approximate 95% profile-likelihood interval, independent Gaussian concentration means with common unknown variance; not biological-repeat uncertainty.'};
}
export function targetDose(f,target=50) {
  if(!(f.bottom<target && target<f.top)) return null;
  const log=f.m+Math.log10((f.top-target)/(target-f.bottom))/f.h;
  return Number.isFinite(log) ? 10**log : null;
}
export function crossings(groups,target) {
  const g=groups.filter(v=>v.x>0), out=[];
  for(const p of g) if(p.y===target) out.push({low:p.x,high:p.x,estimate:p.x});
  for(let i=1;i<g.length;i++) if(g[i-1].y>target && g[i].y<target) {
    const a=g[i-1],b=g[i], log=Math.log10(a.x)+(target-a.y)*(Math.log10(b.x)-Math.log10(a.x))/(b.y-a.y);
    out.push({low:a.x,high:b.x,estimate:10**log});
  }
  return out.sort((a,b)=>a.estimate-b.estimate);
}
export function audit(rows,mode='free',controlsValid=true) {
  const groups=groupRows(rows), positive=groups.filter(g=>g.x>0), f=fit(groups,mode), prof=profile(groups,f);
  const alternatives=Object.keys(MODES).map(m=>m===mode?f:fit(groups,m));
  const min=positive[0].x,max=positive.at(-1).x, ys=positive.map(g=>g.y);
  const observedSpan=Math.max(...ys)-Math.min(...ys);
  const meanSE=groups.filter(g=>g.sd!==null).map(g=>g.sd/Math.sqrt(g.n));
  const noise=meanSE.length ? Math.sqrt(mean(meanSE.map(x=>x*x))) : null;
  const tolerance=Math.max(8,3*(noise??0));
  let rebound=0, runningMin=ys[0];
  for(const y of ys) {rebound=Math.max(rebound,y-runningMin);runningMin=Math.min(runningMin,y);}
  const flat=observedSpan<Math.max(10,3*(noise??0));
  const reversed=rebound>tolerance, poor=f.rmse>Math.max(8,2*(noise??0)), sparse=positive.length<7;
  const relativeTarget=(f.top+f.bottom)/2, relCross=crossings(groups,relativeTarget), absCross=crossings(groups,50);
  const finiteProfile=prof.available && prof.lower!==null && prof.upper!==null && !prof.disconnected;
  const broad= !finiteProfile || prof.upper-prof.lower>2;
  const relativeSupported=!flat&&!reversed&&!poor&&!sparse&&!f.boundary&&!broad&&relCross.length===1&&10**f.m>min&&10**f.m<max;
  const absolute=targetDose(f,50), absoluteSupported=controlsValid&&!flat&&!reversed&&!poor&&!sparse&&absCross.length===1&&absolute!==null&&absolute>min&&absolute<max;
  let absoluteStatus,absoluteText;
  if(!controlsValid) {absoluteStatus='Reference undefined';absoluteText='Define and validate the 0% and 100% controls before interpreting a control-defined IC50.';}
  else if(reversed||poor) {absoluteStatus='Model mismatch';absoluteText='Do not report one IC50 from this monotone fit. Inspect the response shape, residuals and assay controls.';}
  else if(absoluteSupported) {absoluteStatus='Threshold bracketed';absoluteText='The control-defined 50% response is bracketed. Report the local interpolation and its tested-dose bracket; this bracket is not a confidence interval.';}
  else if(ys.every(y=>y>50)) {
    absoluteStatus='50% not reached';
    absoluteText=`50% inhibition was not observed through ${format(max)} nM. A > bound requires a justified monotone threshold model and adequate precision; inactivity or a plateau above 50% does not establish a finite IC50.`;
  } else if(ys.every(y=>y<50)) {
    absoluteStatus='Below tested range';
    absoluteText=`Responses are below 50% at every positive dose. A < ${format(min)} nM bound is conditional on valid controls, a monotone transition from the untreated state and adequate precision.`;
  } else {absoluteStatus='Unresolved';absoluteText='The present dose spacing, variability or response shape does not support a unique, adequately audited control-defined midpoint.';}
  const flags=[];
  if(flat) flags.push('Small observed response range: a fitted midpoint can summarize noise.');
  if(reversed) flags.push('Substantial upward reversal: a decreasing 4PL may hide a hook, interference or heterogeneous response.');
  if(poor) flags.push('Large residual error: inspect model mismatch and influential points.');
  if(sparse) flags.push('Fewer than seven positive dose levels: this prototype withholds an estimate endorsement.');
  if(f.boundary) flags.push('The fit reaches a numerical parameter bound or collapses to a flat curve.');
  if(broad) flags.push('The relative-midpoint profile is open, unavailable, disconnected or wider than 100-fold.');
  if(noise===null) flags.push('No within-dose replicates: repeatability cannot be assessed.');
  if(!controlsValid) flags.push('Control reference has not been validated; absolute threshold reporting is disabled.');
  const mids=alternatives.map(v=>v.m), spread=Math.max(...mids)-Math.min(...mids);
  if(spread>.5) flags.push('Relative midpoint shifts by more than 3.16-fold across the assumption panel. These models are not automatically equally plausible.');
  const zero=groups.find(g=>g.x===0);
  if(zero && Math.abs(zero.y-100)>10) flags.push('Untreated mean differs from 100% by more than ten percentage points: review normalization.');
  return {version:VERSION,groups,fit:f,profile:prof,alternatives,min,max,observedSpan,noise,rebound,flat,reversed,poor,sparse,
    relativeSupported,relativeTarget,relCross,absolute,absoluteSupported,absCross,absoluteStatus,absoluteText,flags,spread,controlsValid};
}
export function leaveOneDoseOut(rows,mode='free') {
  const groups=groupRows(rows), full=fit(groups,mode);
  const records=groups.filter(g=>g.x>0).map(g=>{const f=fit(groups.filter(v=>v.x!==g.x),mode);return {omitted:g.x,m:f.m,fold:10**(f.m-full.m),boundary:f.boundary};});
  return {records,minimum:10**Math.min(...records.map(r=>r.m)),maximum:10**Math.max(...records.map(r=>r.m)),
    note:'Sensitivity to omitting a dose, not an uncertainty interval and not a reason to delete data.'};
}
export function format(x) {
  if(x===null || !Number.isFinite(x)) return 'not estimable';
  if(x===0) return '0';
  return Math.abs(x)<.01 || Math.abs(x)>=1e5 ? x.toExponential(2) : Number(x.toPrecision(3)).toString();
}
export const CASES = [
  {id:'complete',title:'A well-resolved response',subtitle:'The positive comparator',bottom:4,m:1,h:1.15,noise:3,max:4,
    lesson:'Both plateaus and the transition are sampled. Agreement here is a useful comparator, not a universal acceptance standard.',
    next:'Repeat the complete curve in independent runs and test whether the midpoint reproduces.'},
  {id:'truncated',title:'The missing lower plateau',subtitle:'A number beyond the experiment',bottom:0,m:2.3,h:.8,noise:3,max:1,
    lesson:'Only the beginning of inhibition is measured. Fixing bottom to zero supplies information the compound has not supplied.',
    next:'Extend exposure into the transition only if solubility, toxicity and assay performance allow it.'},
  {id:'partial',title:'Half of a small effect',subtitle:'Relative is not absolute',bottom:65,m:.6,h:1.2,noise:2,max:4,
    lesson:'A stable relative midpoint can coexist with a response that never reaches 50% of control. Report the attainable effect with the midpoint.',
    next:'Confirm the upper and lower response plateaus with orthogonal readouts and longer or alternative exposures.'},
  {id:'flat',title:'A curve fitted to noise',subtitle:'The null response',bottom:100,m:1,h:1,noise:2,max:4,
    lesson:'A flat series has no experimentally identified relative midpoint. An optimizer can still finish successfully.',
    next:'Check positive-control performance and target engagement before treating a flat series as genuine inactivity.'},
  {id:'left',title:'Already inhibited',subtitle:'The transition happened earlier',bottom:0,m:-3.5,h:1,noise:2,max:3,
    lesson:'All positive concentrations can be below the 50% response level. A fitted sub-range midpoint is an extrapolation, not a measured point estimate.',
    next:'Add lower concentrations and retain true untreated controls; do not substitute an arbitrary small dose for zero.'},
  {id:'hook',title:'Down, then back up',subtitle:'A monotone model is the wrong question',bottom:0,m:0,h:1.2,noise:2,max:4,
    lesson:'A synthetic high-dose rebound can arise from many mechanisms. Shape alone cannot distinguish a hook from interference or biology.',
    next:'Retest the turning region with orthogonal readouts and independent preparations before fitting a mechanistic biphasic model.'},
  {id:'shallow',title:'The long shallow transition',subtitle:'Potency trades off with plateaus',bottom:0,m:1,h:.22,noise:3,max:4,
    lesson:'Top, bottom, slope and midpoint can compensate for one another. High apparent goodness of fit is not parameter identification.',
    next:'Expand range when feasible, verify asymptotes and compare plausible constraints declared before looking at the result.'},
  {id:'steep',title:'The transition between doses',subtitle:'More wells are not more dose resolution',bottom:0,m:.25,h:5,noise:2,max:4,
    lesson:'A very steep response can be poorly localized by a coarse dilution series. The fitted slope may reach its search boundary.',
    next:'Add distinct concentrations around the transition; extra wells at the same two flanking doses do not fill the gap.'},
  {id:'outlier',title:'One influential concentration',subtitle:'The fit follows the leverage',bottom:4,m:1,h:1,noise:3,max:4,
    lesson:'A single displaced dose group can move slope and midpoint. Leave-one-dose-out is a sensitivity audit, not permission to remove a disagreeable point.',
    next:'Inspect raw wells, plate position, dilution preparation and the prespecified exclusion rule. Repeat the affected region.'},
  {id:'hetero',title:'Unequal measurement noise',subtitle:'Equal weights are an assumption',bottom:4,m:1,h:1,noise:6,max:4,
    lesson:'Here the response-dependent noise violates the common-variance working likelihood. A narrow profile can be overconfident.',
    next:'Use an experimentally supported variance model or suitable likelihood and propagate control uncertainty.'},
  ...EXTRA_CASES
];
export function generate(id='complete',options={}) {
  const c=CASES.find(c=>c.id===id)??CASES[0], max=options.max??c.max, noise=options.noise??c.noise;
  let state=(options.seed??42)>>>0;
  const uniform=()=>{state=(1664525*state+1013904223)>>>0;return (state+.5)/4294967296;};
  const normal=()=>Math.sqrt(-2*Math.log(uniform()))*Math.cos(2*Math.PI*uniform());
  const rows=[];
  const count=c.doses??13;
  for(let i=0;i<count;i++) {
    const x=10**(-2+(max+2)*i/(count-1));
    let y=c.fn?c.fn(x):predict(x,{top:100,bottom:c.bottom,m:c.m,h:c.h});
    if(id==='hook') y+=85/(1+(300/x)**2);
    if(id==='outlier' && i===7) y+=40;
    for(let j=0;j<3;j++) rows.push({x,y:y+normal()*noise*(id==='hetero'?(.3+1.7*y/100):1)});
  }
  return rows;
}
