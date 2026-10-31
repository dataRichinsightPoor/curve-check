import {SOURCE_SCHEMA,reconstruct,sourceDemo,weakSignalDemo,signalAudit,sourceConclusion,restoreSource} from './source-engine.js';
import {VERSION,audit,format,parseCSV,predict} from './engine.js';
const $=id=>document.getElementById(id),fields=['source','endpoint','exposure','controlEvidence','readoutEvidence','mechanismEvidence'];
// Lead with the full-window evidence, not a polished fit or the data-entry form.
document.querySelector('#source > .source-grid').before($('sourceResults'));
let result=null,analyses=null,rawCSV='',digest=null,generation=0,numericalErrors={},simulation=null;
const metadata=()=>Object.fromEntries(fields.map(k=>[k,$('source-'+k).value]));
function disabled(v){for(const id of ['sourceJSON','sourceMD','sourceHandoff'])$(id).disabled=v;}
function invalidate(){generation++;result=null;analyses=null;digest=null;simulation=null;disabled(true);$('showTruth').checked=false;$('showTruth').disabled=true;$('sourceStatus').textContent='Inputs changed. Reconstruct before exporting; previous results are not current.';$('sourceResults').hidden=true;}
function record(){
  if(!result)throw Error('Reconstruct the source first.');
  const rule=$('sourceRule').value;
  if(!result.variants[rule])throw Error('Self-scaling is undefined for a constant sample signal.');
  return {schema:SOURCE_SCHEMA,engineVersion:VERSION,rawCSV,sha256:digest,rule,scope:$('sourceScope').value,metadata:metadata(),simulation,source:result,normalizedRows:result.variants[rule],numerical:analyses[rule],signalComparison:signalAudit(result.variants[rule],analyses[rule]?.fit),numericalErrors,claim:sourceConclusion(result,rule,$('sourceScope').value),verification:'User-supplied records and evidence notes. Not independently verified; fingerprint binds text bytes, not sample identity or truth.'};
}
function render(){
  if(!result)return;
  $('sourceRule').options[1].disabled=!result.variants.self;
  if(!result.variants[$('sourceRule').value])$('sourceRule').value='control';
  const rule=$('sourceRule').value,a=analyses[rule];
  $('sourceResults').hidden=false;
  $('sourceControlStats').textContent=`Neutral: mean ${format(result.neutral.mean)}, SD ${format(result.neutral.sd)}, n=${result.neutral.n}. Full-effect: mean ${format(result.full.mean)}, SD ${format(result.full.sd)}, n=${result.full.n}. Separation: ${format(result.separation)} raw units. ${result.samples.length} sample wells retained; no exclusions or clipping.`;
  $('sourceComparison').replaceChildren(...['control','self'].map(key=>{
    const tr=document.createElement('tr'),fit=analyses[key];
    const values=[key==='control'?'Independent controls':'Sample min–max (counterfactual)',key==='control'?`${format(result.controlSpan)} pp`:result.variants.self?'100 pp':'Undefined',fit?`${format(10**fit.fit.m)} nM`:'Unavailable',fit?.relativeSupported?'Localized numerically':'Review / unresolved',key==='self'?'Not an independent 50% reference':'Controls supplied; validity unverified'];
    values.forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});return tr;
  }));
  $('sourceClaim').textContent=sourceConclusion(result,rule,$('sourceScope').value);
  $('sourceNumerics').textContent=a?`Selected ${rule==='control'?'independent-control':'self-scaled'} reconstruction: fitted upper/lower asymptotes ${format(a.fit.top)} / ${format(a.fit.bottom)}%; fitted amplitude ${format(a.fit.top-a.fit.bottom)} pp (a model estimate, not the observed range). Relative midpoint candidate ${format(10**a.fit.m)} nM. ${a.absoluteText} The numerical heuristics do not certify the source or its biological interpretation.`:`Numerical fitting unavailable: ${numericalErrors[rule]||'undefined normalization'}. Original data are retained and exportable; do not clip them to force a fit.`;
  $('sourceFlags').replaceChildren(...result.flags.map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));
  $('sourceFingerprint').textContent=digest?`SHA-256 of exact CSV text: ${digest}. This identifies the text, not its truth.`:'SHA-256 unavailable in this browser; the exported exact raw text remains the reconstruction source.';
  const signal=signalAudit(result.variants.control,analyses.control?.fit),d=signal.deltaAicc;
  $('signalStats').textContent=`Independent-control scale: lowest ${signal.edgeCount} positive-dose means average ${format(signal.lowEdge)}%; highest ${signal.edgeCount} average ${format(signal.highEdge)}%. Their signed difference is ${format(signal.edgeContrast)} percentage points. This fixed edge-group contrast is descriptive, not fitted Emax or a confidence interval.`;
  $('noiseStats').textContent=`Estimated mean-level technical noise: ${format(signal.meanNoise)} pp. Observed maximum-minus-minimum concentration-mean range: ${format(signal.span)} pp. Noise can inflate this range; it is not the true response amplitude or a calibrated signal-to-noise statistic.`;
  $('showTruth').disabled=!simulation;
  $('activeExperiment').textContent=simulation?`Displayed experiment: true effect ${simulation.effect}/100 raw units; well-noise SD ${simulation.noise}; seed ${simulation.seed}. ${simulation.effect===0?'The generating response is constant: no true midpoint exists.':`True relative midpoint 10 nM, at ${100-simulation.effect/2}% of the true reference window. ${simulation.effect<=50?'No finite absolute 50% crossing exists in this generating model.':'The generating response can cross the absolute 50% threshold.'}`}`:'Displayed data have no verified synthetic recipe. Ground truth is unknown; generator settings above do not describe these observations.';
  const evidence=analyses.control;
  $('reviewedReport').textContent=`${simulation?'Synthetic demonstration. ':''}The independently normalized endpoint contrast is ${format(signal.edgeContrast)} pp (lowest versus highest ${signal.edgeCount} positive-dose means). ${d===null?'The constant-versus-4PL AICc comparison is unavailable.':d>0?'The constant response has lower AICc; this is not an equivalence test or proof of zero activity.':'The 4PL has lower AICc; this alone does not establish a localized midpoint.'} ${evidence?.relativeSupported?`The numerical relative-midpoint candidate is ${format(10**evidence.fit.m)} nM under the working model; it is not the control-defined IC50.`:'A reportable relative midpoint is not established by the prototype’s numerical audit.'} ${sourceConclusion(result,'control',$('sourceScope').value)}`;
  $('flatComparison').textContent=`Constant-response RMSE: ${format(signal.flatRMSE)} pp. Free-4PL RMSE: ${format(signal.curveRMSE)} pp. ΔAICc (4PL minus constant): ${format(d)}. ${d===null?'Comparison unavailable.':d>0?'The constant response has lower AICc under these working assumptions.':'The 4PL has lower AICc under these working assumptions; this does not establish useful effect size or target mechanism.'}${analyses.control?.fit.boundary?' The 4PL hit a numerical boundary; inspect the curve diagnostics rather than treating AICc as a decision rule.':''}`;
  drawSignal(signal,analyses.control?.fit);
  disabled(false);$('sourceHandoff').disabled=!a;
}
function drawSignal(s,fit){
  const host=$('sourceSignalChart'),w=Math.max(280,host.clientWidth||600),h=270,ns='http://www.w3.org/2000/svg';
  const el=(tag,attrs={},text='')=>{const n=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);n.textContent=text;return n;};
  const positive=result.variants.control.filter(r=>r.x>0),lo=Math.log10(Math.min(...positive.map(r=>r.x))),hi=Math.log10(Math.max(...positive.map(r=>r.x)));
  const ymin=Math.min(0,...positive.map(r=>r.y))-5,ymax=Math.max(100,...positive.map(r=>r.y))+5;
  const X=x=>45+(Math.log10(x)-lo)/(hi-lo)*(w-70),Y=y=>225-(y-ymin)/(ymax-ymin)*205;
  const svg=el('svg',{viewBox:`0 0 ${w} ${h}`,role:'img','aria-label':'Independent-control normalized wells, constant response, and logistic fit on the full control window'});
  for(const y of [0,50,100]){svg.append(el('line',{x1:45,x2:w-25,y1:Y(y),y2:Y(y),stroke:'#34464d'}));svg.append(el('text',{x:35,y:Y(y)+4,'text-anchor':'end'},String(y)));}
  for(const m of [lo,(lo+hi)/2,hi])svg.append(el('text',{x:X(10**m),y:245,'text-anchor':'middle'},format(10**m)));
  svg.append(el('text',{x:w/2,y:267,'text-anchor':'middle'},'Concentration (nM), log scale'));
  svg.append(el('line',{x1:45,x2:w-25,y1:Y(s.mean),y2:Y(s.mean),stroke:'#f3c887','stroke-width':2,'stroke-dasharray':'5 5'}));
  if(simulation&&$('showTruth').checked)svg.append(el('path',{d:Array.from({length:180},(_,i)=>{const x=10**(lo+(hi-lo)*i/179),raw=100-simulation.effect+simulation.effect/(1+x/10),y=100*(raw-result.full.mean)/result.separation;return `${i?'L':'M'}${X(x)},${Y(y)}`;}).join(' '),fill:'none',stroke:'#c6adf5','stroke-width':2,'stroke-dasharray':'3 5'}));
  if(fit)svg.append(el('path',{d:Array.from({length:180},(_,i)=>{const x=10**(lo+(hi-lo)*i/179);return `${i?'L':'M'}${X(x)},${Y(predict(x,fit))}`;}).join(' '),fill:'none',stroke:'#c6e48b','stroke-width':2}));
  for(const r of positive)svg.append(el('circle',{cx:X(r.x),cy:Y(r.y),r:2.5,fill:'#85c6e6',opacity:.75}));
  host.replaceChildren(svg);
}
async function run(){
  const token=++generation;disabled(true);$('sourceStatus').textContent='Reconstructing raw observations…';
  try{
    const text=$('rawCSV').value,r=reconstruct(text);
    const next={};const nextErrors={};
    for(const rule of ['control','self']){
      try{if(!r.variants[rule])throw Error('Constant sample signal: self-scaling undefined.');
        const parsed=parseCSV('concentration,response\n'+r.variants[rule].map(v=>`${v.x},${v.y}`).join('\n'));
        next[rule]=audit(parsed,'free',false);
      }catch(err){next[rule]=null;nextErrors[rule]=err.message;}
    }
    let hash=null;
    try{hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');}catch{}
    if(token!==generation)return;
    rawCSV=text;result=r;analyses=next;numericalErrors=nextErrors;digest=hash;render();
    $('sourceStatus').textContent='Reconstruction complete. Both processing branches use the same original wells. Evidence notes are declarations, not automated verification.';
  }catch(e){if(token!==generation)return;result=null;analyses=null;disabled(true);$('sourceResults').hidden=true;$('sourceStatus').textContent=e.message;}
}
function download(name,text,type){
  const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  $('sourceStatus').textContent=`Prepared ${name}. Raw observations, processing choices and limitations travel together.`;
}
function baseMarkdown(r){
  const numerical=r.numerical?`Relative midpoint candidate: ${10**r.numerical.fit.m} nM. Numerical localization: ${r.numerical.relativeSupported?'supported under working model':'unresolved / review'}.`:`Numerical fit unavailable: ${r.numericalErrors[r.rule]}.`;
  return `# Curve Check source-to-claim record\n\nEngine ${VERSION}. ${r.verification}\n\n## Intended claim\n\nScope: ${r.scope}. Endpoint: ${r.metadata.endpoint||'Unspecified'}. Exposure: ${r.metadata.exposure||'Unspecified'}. Concentrations: nM. Raw signal: arbitrary instrument units.\n\n${r.claim}\n\n## Source and processing\n\nSource record: ${r.metadata.source||'Not supplied'}.\n\nSHA-256: ${r.sha256||'Unavailable'}.\n\nSelected normalization: ${r.rule}. Neutral mean ${r.source.neutral.mean}; full-effect mean ${r.source.full.mean}. Sample raw span ${r.source.rawSpan}; independent-control span ${r.source.controlSpan} percentage points. No rows excluded and no responses clipped.\n\n${numerical} This is not an approved potency claim.\n\n## Flat-response comparison on selected normalization\n\nObserved mean span: ${r.signalComparison.span} pp; estimated mean-level noise: ${r.signalComparison.meanNoise??'unavailable'} pp. Delta AICc (4PL minus constant): ${r.signalComparison.deltaAicc??'unavailable'}. This is conditional model comparison, not a calibrated significance test or mechanistic validation.\n\n## Declared evidence, not independently verified\n\nControl evidence: ${r.metadata.controlEvidence||'Missing'}.\n\nReadout evidence: ${r.metadata.readoutEvidence||'Missing'}.\n\nMechanism evidence: ${r.metadata.mechanismEvidence||'Missing'}.\n\n${r.source.flags.map(t=>'- '+t).join('\n')}\n\n## Exact raw CSV\n\n\`\`\`csv\n${r.rawCSV}\n\`\`\`\n`;
}
function markdown(r){
  const s=r.simulation,simulationText=s?`Generator ${s.generator}; true effect ${s.effect}/100 raw units; independent Gaussian well-noise SD ${s.noise}; seed ${s.seed}. ${s.effect===0?'The generating response is constant and has no true midpoint.':'True relative midpoint 10 nM; slope 1.'}`:'No verified synthetic recipe. Ground truth is unknown.';
  return baseMarkdown(r)+`\n## Simulation and independent-control review\n\n${simulationText}\n\n${$('reviewedReport').textContent}\n\nThe fixed edge-group contrast is descriptive, not fitted Emax or a confidence interval. A preference for the constant response is not proof of inactivity. At zero amplitude the logistic midpoint and slope are unidentified; AICc is a working-model diagnostic, not a calibrated significance or equivalence test.\n`;
}
$('rawCSV').addEventListener('input',invalidate);
$('reconstructSource').addEventListener('click',run);
$('sourceDemo').addEventListener('click',()=>{$('rawCSV').value=sourceDemo();for(const k of fields)$('source-'+k).value='';$('source-source').value='Synthetic tiny-effect demonstration; not experimental data';$('source-endpoint').value='Synthetic instrument signal';$('sourceRule').value='control';$('sourceScope').value='readout';invalidate();run();});
for(const id of ['sourceRule','sourceScope'])$(id).addEventListener('change',render);
$('rawFile').addEventListener('change',async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>1e6)throw Error('Maximum raw file size 1 MB.');$('rawCSV').value=await f.text();for(const k of fields)$('source-'+k).value='';$('source-source').value=f.name;invalidate();await run();}catch(err){invalidate();$('sourceStatus').textContent=err.message;}e.target.value='';});
$('sourceJSON').addEventListener('click',()=>download('curve-check-source-record.json',JSON.stringify(record(),null,2),'application/json'));
$('sourceMD').addEventListener('click',()=>download('curve-check-source-record.md',markdown(record()),'text/markdown'));
$('restoreSource').addEventListener('change',async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>3e6)throw Error('Maximum record size 3 MB.');const d=restoreSource(JSON.parse(await f.text()));$('rawCSV').value=d.rawCSV;$('sourceRule').value=d.rule;$('sourceScope').value=d.scope;for(const k of fields)$('source-'+k).value=d.metadata[k];invalidate();simulation=d.simulation;await run();}catch(err){$('sourceStatus').textContent=err.message;}e.target.value='';});
$('sourceHandoff').addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('source-handoff',{detail:record()}));document.querySelector('[data-tab="lab"]').click();});
function weakDemo(){
  const effect=+$('weakEffect').value,noise=+$('weakNoise').value,seed=+$('weakSeed').value;
  let text;try{text=weakSignalDemo(effect,noise,seed);}catch(e){$('sourceStatus').textContent=e.message;return;}
  for(const k of fields)$('source-'+k).value='';
  $('rawCSV').value=text;$('source-source').value=`Synthetic ${effect}-point effect, noise SD ${noise}, seed ${seed}; not experimental data`;$('source-endpoint').value='Synthetic instrument signal';$('sourceRule').value='control';$('sourceScope').value='readout';invalidate();simulation={generator:'weak-signal-v1',effect,noise,seed};run();
}
$('weakGenerate').addEventListener('click',weakDemo);
function pendingSettings(){$('weakSettings').textContent=`Pending settings: true effect ${$('weakEffect').value}/100; well-noise SD ${$('weakNoise').value}; seed ${$('weakSeed').value}. Apply with Generate. The displayed experiment is labeled below.`;}
for(const id of ['weakEffect','weakNoise','weakSeed'])$(id).addEventListener('input',pendingSettings);
for(const b of document.querySelectorAll('[data-weak-preset]'))b.addEventListener('click',()=>{$('weakEffect').value=b.dataset.effect;$('weakNoise').value=b.dataset.noise;pendingSettings();weakDemo();});
$('nextRealization').addEventListener('click',()=>{const seed=+$('weakSeed').value;if(!Number.isInteger(seed)||seed<1||seed>999999){$('sourceStatus').textContent='Use an integer seed from 1 to 999999.';return;}$('weakSeed').value=seed===999999?1:seed+1;pendingSettings();weakDemo();});
$('showTruth').addEventListener('change',render);
document.querySelector('[data-tab="source"]').addEventListener('click',()=>{if(result)render();});
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(result&&!$('source').hidden)render();},100);});
weakDemo();
