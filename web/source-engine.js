// Source reconstruction is deterministic arithmetic, not assay validation.
export const SOURCE_SCHEMA='curve-check-source-v1';
export function parseRaw(text){
  if(typeof text!=='string'||text.length>1000000)throw Error('Raw CSV must be text no larger than 1 MB.');
  const lines=text.split(/\r?\n/);while(lines.length&&!lines.at(-1).trim())lines.pop();
  if(lines.shift()?.trim().toLowerCase()!=='role,concentration,signal')throw Error('Use the header role,concentration,signal. Concentrations are nM; controls may leave concentration blank.');
  if(lines.length>1000)throw Error('Maximum 1,000 raw rows.');
  const records=lines.map((line,i)=>{
    const cols=line.split(',').map(s=>s.trim());
    if(cols.length!==3)throw Error(`Row ${i+2}: use exactly three unquoted columns.`);
    const [role,dose,signal]=cols;
    if(!['sample','neutral','full'].includes(role))throw Error(`Row ${i+2}: role must be sample, neutral or full.`);
    if(signal===''||!Number.isFinite(Number(signal)))throw Error(`Row ${i+2}: signal must be finite.`);
    if(role==='sample'&&(dose===''||!Number.isFinite(Number(dose))||Number(dose)<0))throw Error(`Row ${i+2}: sample concentration must be nonnegative and finite.`);
    if(role==='sample'&&(Number(dose)>1e12||(Number(dose)>0&&Number(dose)<1e-12)))throw Error(`Row ${i+2}: supported sample concentrations are zero or 1e-12 to 1e12 nM.`);
    if(dose!==''&&(!Number.isFinite(Number(dose))||Number(dose)<0))throw Error(`Row ${i+2}: invalid control concentration.`);
    return {role,x:dose===''?null:Number(dose),signal:Number(signal),sourceRow:i+2};
  });
  for(const role of ['sample','neutral','full'])if(!records.some(r=>r.role===role))throw Error(`Missing ${role} rows. Do not fabricate controls from sample extrema.`);
  const positive=new Set(records.filter(r=>r.role==='sample'&&r.x>0).map(r=>r.x));
  if(positive.size<5||positive.size>100)throw Error('Use 5–100 distinct positive sample concentrations for this workbench.');
  return records;
}
const stats=a=>{const mean=a.reduce((s,x)=>s+x,0)/a.length;return {n:a.length,mean,sd:a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-mean)**2,0)/(a.length-1)):null};};
export function reconstruct(text){
  const records=parseRaw(text),samples=records.filter(r=>r.role==='sample');
  const neutral=stats(records.filter(r=>r.role==='neutral').map(r=>r.signal)),full=stats(records.filter(r=>r.role==='full').map(r=>r.signal));
  const separation=neutral.mean-full.mean;
  if(!(separation>0&&Number.isFinite(separation)))throw Error('Neutral mean must exceed full-effect mean. Check control identity and signal direction; this engine is decreasing-only.');
  const lo=Math.min(...samples.map(r=>r.signal)),hi=Math.max(...samples.map(r=>r.signal));
  if(!Number.isFinite(hi-lo))throw Error('Raw signal range exceeds numerical capacity.');
  const make=(low,high)=>samples.map(r=>({x:r.x,y:100*(r.signal-low)/(high-low)}));
  const control=make(full.mean,neutral.mean);
  const self=hi>lo?make(lo,hi):null;
  if(control.some(r=>!Number.isFinite(r.y))||self?.some(r=>!Number.isFinite(r.y)))throw Error('Normalization exceeds numerical capacity; investigate raw units and control separation.');
  const flags=[];
  if(neutral.n<2||full.n<2)flags.push('At least one control has one well: its observed SD is unavailable.');
  if(control.some(r=>r.y<0||r.y>100))flags.push('Some independently normalized wells lie outside 0–100%; they are retained, not clipped.');
  flags.push('Shared control uncertainty and run-to-run variability are not propagated by the curve engine.');
  flags.push('Control identity, concentration labels, exposure, instrument suitability and biological attribution are not independently verified.');
  return {records,samples,neutral,full,separation,rawSpan:hi-lo,controlSpan:100*(hi-lo)/separation,variants:{control,self},flags};
}
export function sourceConclusion(result,rule,scope='readout'){
  if(rule==='self')return 'Control-defined potency claim withheld: the sample series supplies its own endpoints. Self-scaling cannot establish 50% inhibition relative to independent controls.';
  const means=signalAudit(result.variants.control,null).groups.map(g=>g.mean);
  const below=means.some(y=>y<50),above=means.some(y=>y>50);
  const observation=below&&above?'Concentration means occur on both sides of 50%; ordered bracketing and uncertainty still require the numerical audit.':'A two-sided 50% crossing is not observed in the independently normalized concentration means; do not replace this statement with an extrapolated exact absolute IC50.';
  return observation+(scope==='target'?' Target-specific attribution remains unverified; a named target and an evidence note are not proof of mechanism.':' This describes the measured readout only, not a validated target mechanism.');
}
export function sourceDemo(){
  const a=['role,concentration,signal','neutral,,99','neutral,,100','neutral,,101','full,,-1','full,,0','full,,1'];
  for(let i=0;i<13;i++){const x=10**(-2+i/2);for(let j=-1;j<=1;j++)a.push(`sample,${x},${96+4/(1+x/10)+j*.08+.025*Math.sin(i*1.7)}`);}
  return a.join('\n');
}
export function weakSignalDemo(effect=20,noise=10,seed=42){
  if(!Number.isFinite(effect)||effect<0||effect>100||!Number.isFinite(noise)||noise<0||noise>30)throw Error('Use effect 0–100 and noise SD 0–30 raw units.');
  let state=seed>>>0;
  const uniform=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return (state+.5)/4294967296;};
  const normal=()=>Math.sqrt(-2*Math.log(uniform()))*Math.cos(2*Math.PI*uniform());
  const a=['role,concentration,signal'];
  for(const [role,mean] of [['neutral',100],['full',0]])for(let i=0;i<8;i++)a.push(`${role},,${mean+noise*normal()}`);
  for(let i=0;i<13;i++){const x=10**(-2+i/2);for(let j=0;j<3;j++)a.push(`sample,${x},${100-effect+effect/(1+x/10)+noise*normal()}`);}
  return a.join('\n');
}
export function signalAudit(rows,fit){
  const map=new Map();for(const r of rows){if(!map.has(r.x))map.set(r.x,[]);map.get(r.x).push(r.y);}
  const groups=[...map].map(([x,ys])=>({x,...stats(ys)}));
  const n=groups.length,mean=groups.reduce((s,g)=>s+g.mean,0)/n,sse=groups.reduce((s,g)=>s+(g.mean-mean)**2,0);
  const k=2,flatAicc=n>k+1&&sse>1e-12?n*Math.log(sse/n)+2*k+2*k*(k+1)/(n-k-1):null;
  const replicated=groups.filter(g=>g.n>1),meanNoise=replicated.length?Math.sqrt(replicated.reduce((s,g)=>s+g.sd*g.sd/g.n,0)/replicated.length):null;
  const span=Math.max(...groups.map(g=>g.mean))-Math.min(...groups.map(g=>g.mean));
  return {groups,mean,span,meanNoise,rangeNoiseRatio:meanNoise>0?span/meanNoise:null,flatSSE:sse,flatRMSE:Math.sqrt(sse/n),flatAicc,curveRMSE:fit?.rmse??null,deltaAicc:flatAicc!==null&&fit?.aicc!=null?fit.aicc-flatAicc:null};
}
export function restoreSource(value){
  if(!value||value.schema!==SOURCE_SCHEMA||typeof value.rawCSV!=='string')throw Error('Invalid source-record schema.');
  if(!['control','self'].includes(value.rule))throw Error('Invalid normalization rule.');
  const result=reconstruct(value.rawCSV);
  if(!result.variants[value.rule])throw Error('Selected normalization is undefined for a constant sample series.');
  const metadata={};
  for(const k of ['source','endpoint','exposure','controlEvidence','readoutEvidence','mechanismEvidence'])metadata[k]=typeof value.metadata?.[k]==='string'?value.metadata[k].slice(0,3000):'';
  return {rawCSV:value.rawCSV,rule:value.rule,scope:value.scope==='target'?'target':'readout',metadata,result};
}
