import {SOURCE_SCHEMA,reconstruct,sourceDemo,weakSignalDemo,signalAudit,sourceConclusion,restoreSource} from './source-engine.js';
import {VERSION,audit,format,parseCSV,predict} from './engine.js';
const $=id=>document.getElementById(id),fields=['source','endpoint','exposure','controlEvidence','readoutEvidence','mechanismEvidence'];
// Lead with the full-window evidence, not a polished fit or the data-entry form.
document.querySelector('#source > .source-grid').before($('sourceResults'));
let result=null,analyses=null,rawCSV='',digest=null,generation=0,numericalErrors={};
const metadata=()=>Object.fromEntries(fields.map(k=>[k,$('source-'+k).value]));
function disabled(v){for(const id of ['sourceJSON','sourceMD','sourceHandoff'])$(id).disabled=v;}
function invalidate(){generation++;result=null;analyses=null;digest=null;disabled(true);$('sourceStatus').textContent='Inputs changed. Reconstruct before exporting; previous results are not current.';$('sourceResults').hidden=true;}
function record(){
  if(!result)throw Error('Reconstruct the source first.');
  const rule=$('sourceRule').value;
  if(!result.variants[rule])throw Error('Self-scaling is undefined for a constant sample signal.');
  return {schema:SOURCE_SCHEMA,engineVersion:VERSION,rawCSV,sha256:digest,rule,scope:$('sourceScope').value,metadata:metadata(),source:result,normalizedRows:result.variants[rule],numerical:analyses[rule],signalComparison:signalAudit(result.variants[rule],analyses[rule]?.fit),numericalErrors,claim:sourceConclusion(result,rule,$('sourceScope').value),verification:'User-supplied records and evidence notes. Not independently verified; fingerprint binds text bytes, not sample identity or truth.'};
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
  $('sourceNumerics').textContent=a?`Selected ${rule==='control'?'independent-control':'self-scaled'} reconstruction: relative midpoint candidate ${format(10**a.fit.m)} nM. ${a.absoluteText} The numerical heuristics do not certify the source or its biological interpretation.`:`Numerical fitting unavailable: ${numericalErrors[rule]||'undefined normalization'}. Original data are retained and exportable; do not clip them to force a fit.`;
  $('sourceFlags').replaceChildren(...result.flags.map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));
  $('sourceFingerprint').textContent=digest?`SHA-256 of exact CSV text: ${digest}. This identifies the text, not its truth.`:'SHA-256 unavailable in this browser; the exported exact raw text remains the reconstruction source.';
  const signal=signalAudit(result.variants.control,analyses.control?.fit),d=signal.deltaAicc;
  $('signalStats').textContent=`Independent-control scale: observed concentration-mean span ${format(signal.span)} percentage points out of the 100-point reference window. Estimated mean-level technical noise: ${format(signal.meanNoise)} pp. Range/noise ratio: ${format(signal.rangeNoiseRatio)} (descriptive, not a calibrated significance test).`;
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
function markdown(r){
  const numerical=r.numerical?`Relative midpoint candidate: ${10**r.numerical.fit.m} nM. Numerical localization: ${r.numerical.relativeSupported?'supported under working model':'unresolved / review'}.`:`Numerical fit unavailable: ${r.numericalErrors[r.rule]}.`;
  return `# Curve Check source-to-claim record\n\nEngine ${VERSION}. ${r.verification}\n\n## Intended claim\n\nScope: ${r.scope}. Endpoint: ${r.metadata.endpoint||'Unspecified'}. Exposure: ${r.metadata.exposure||'Unspecified'}. Concentrations: nM. Raw signal: arbitrary instrument units.\n\n${r.claim}\n\n## Source and processing\n\nSource record: ${r.metadata.source||'Not supplied'}.\n\nSHA-256: ${r.sha256||'Unavailable'}.\n\nSelected normalization: ${r.rule}. Neutral mean ${r.source.neutral.mean}; full-effect mean ${r.source.full.mean}. Sample raw span ${r.source.rawSpan}; independent-control span ${r.source.controlSpan} percentage points. No rows excluded and no responses clipped.\n\n${numerical} This is not an approved potency claim.\n\n## Flat-response comparison on selected normalization\n\nObserved mean span: ${r.signalComparison.span} pp; estimated mean-level noise: ${r.signalComparison.meanNoise??'unavailable'} pp. Delta AICc (4PL minus constant): ${r.signalComparison.deltaAicc??'unavailable'}. This is conditional model comparison, not a calibrated significance test or mechanistic validation.\n\n## Declared evidence, not independently verified\n\nControl evidence: ${r.metadata.controlEvidence||'Missing'}.\n\nReadout evidence: ${r.metadata.readoutEvidence||'Missing'}.\n\nMechanism evidence: ${r.metadata.mechanismEvidence||'Missing'}.\n\n${r.source.flags.map(t=>'- '+t).join('\n')}\n\n## Exact raw CSV\n\n\`\`\`csv\n${r.rawCSV}\n\`\`\`\n`;
}
$('rawCSV').addEventListener('input',invalidate);
$('reconstructSource').addEventListener('click',run);
$('sourceDemo').addEventListener('click',()=>{$('rawCSV').value=sourceDemo();for(const k of fields)$('source-'+k).value='';$('source-source').value='Synthetic tiny-effect demonstration; not experimental data';$('source-endpoint').value='Synthetic instrument signal';$('sourceRule').value='control';$('sourceScope').value='readout';invalidate();run();});
for(const id of ['sourceRule','sourceScope'])$(id).addEventListener('change',render);
$('rawFile').addEventListener('change',async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>1e6)throw Error('Maximum raw file size 1 MB.');$('rawCSV').value=await f.text();for(const k of fields)$('source-'+k).value='';$('source-source').value=f.name;invalidate();await run();}catch(err){invalidate();$('sourceStatus').textContent=err.message;}e.target.value='';});
$('sourceJSON').addEventListener('click',()=>download('curve-check-source-record.json',JSON.stringify(record(),null,2),'application/json'));
$('sourceMD').addEventListener('click',()=>download('curve-check-source-record.md',markdown(record()),'text/markdown'));
$('restoreSource').addEventListener('change',async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>3e6)throw Error('Maximum record size 3 MB.');const d=restoreSource(JSON.parse(await f.text()));$('rawCSV').value=d.rawCSV;$('sourceRule').value=d.rule;$('sourceScope').value=d.scope;for(const k of fields)$('source-'+k).value=d.metadata[k];invalidate();await run();}catch(err){$('sourceStatus').textContent=err.message;}e.target.value='';});
$('sourceHandoff').addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('source-handoff',{detail:record()}));document.querySelector('[data-tab="lab"]').click();});
function weakDemo(){
  for(const k of fields)$('source-'+k).value='';
  const effect=+$('weakEffect').value,noise=+$('weakNoise').value;
  $('rawCSV').value=weakSignalDemo(effect,noise);$('source-source').value=`Synthetic ${effect}-point effect, noise SD ${noise}; not experimental data`;$('source-endpoint').value='Synthetic instrument signal';$('sourceRule').value='control';$('sourceScope').value='readout';invalidate();run();
}
$('weakGenerate').addEventListener('click',weakDemo);
for(const id of ['weakEffect','weakNoise'])$(id).addEventListener('input',()=>{$('weakSettings').textContent=`True effect: ${$('weakEffect').value} / 100 units. Independent well-noise SD: ${$('weakNoise').value} units. Settings apply only after generating.`;});
document.querySelector('[data-tab="source"]').addEventListener('click',()=>{if(result)render();});
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(result&&!$('source').hidden)render();},100);});
weakDemo();
