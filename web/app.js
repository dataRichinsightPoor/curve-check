import {VERSION,CASES,MODES,generate,parseCSV,predict,format,audit,leaveOneDoseOut} from './engine.js';
const $=id=>document.getElementById(id);
// Sandboxed previews can have an opaque origin that prohibits module Workers.
// The same pure local engine remains usable without worker privileges.
const localRunner={postMessage(data){setTimeout(()=>{
  try{localRunner.onmessage({data:{id:data.id,type:data.type,result:data.type==='loo'?leaveOneDoseOut(data.rows,data.mode):audit(data.rows,data.mode,data.controlsValid)}});}
  catch(e){localRunner.onmessage({data:{id:data.id,error:e.message}});}
},0);}};
let worker;
try{worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});}
catch{worker=localRunner;}
let rows=[],current=null,kind='synthetic',requestId=0,loo=null,report='',caseId='complete',busy=false;
const svgNS='http://www.w3.org/2000/svg';
function node(tag,attrs={},text=''){const el=document.createElementNS(svgNS,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);if(text)el.textContent=text;return el;}
function chart(id,{xmin,xmax,ymin,ymax,xlabel,ylabel,xticks,yticks}){
  const host=$(id),w=Math.max(300,host.clientWidth),h=host.clientHeight,L=52,R=18,T=14,B=48;
  const svg=node('svg',{xmlns:svgNS,viewBox:`0 0 ${w} ${h}`,role:'img','aria-label':host.getAttribute('aria-label')||ylabel});
  svg.append(node('rect',{x:0,y:0,width:w,height:h,fill:'#182227'}));
  const X=v=>L+(v-xmin)/(xmax-xmin)*(w-L-R),Y=v=>h-B-(v-ymin)/(ymax-ymin)*(h-T-B);
  for(const t of yticks){svg.append(node('line',{x1:L,y1:Y(t),x2:w-R,y2:Y(t),class:'grid'}));svg.append(node('text',{x:L-9,y:Y(t)+4,'text-anchor':'end'},format(t)));}
  for(const t of xticks){svg.append(node('line',{x1:X(t),y1:T,x2:X(t),y2:h-B,class:'grid'}));svg.append(node('text',{x:X(t),y:h-B+20,'text-anchor':'middle'},format(10**t)));}
  svg.append(node('text',{x:(L+w-R)/2,y:h-5,'text-anchor':'middle'},xlabel));
  svg.append(node('text',{x:14,y:(h-B+T)/2,transform:`rotate(-90 14 ${(h-B+T)/2})`,'text-anchor':'middle'},ylabel));
  const clipId=`clip-${id}`,defs=node('defs'),clip=node('clipPath',{id:clipId});clip.append(node('rect',{x:L,y:T,width:w-L-R,height:h-T-B}));defs.append(clip);svg.append(defs);
  const plot=node('g',{'clip-path':`url(#${clipId})`});svg.append(plot);host.replaceChildren(svg);
  return {svg,plot,X,Y,line:(points,attrs={})=>plot.append(node('path',{d:points.map((p,i)=>`${i?'L':'M'}${X(p[0]).toFixed(2)},${Y(p[1]).toFixed(2)}`).join(' '),...attrs}))};
}
function ticks(lo,hi,max=6){const step=Math.max(1,Math.ceil((hi-lo)/max));const a=[];for(let i=Math.ceil(lo);i<=hi;i+=step)a.push(i);return a;}
function renderCharts(){
  if(!current)return;
  const a=current,f=a.fit,xlo=Math.log10(a.min),xhi=Math.log10(a.max);
  const ymin=Math.floor(Math.min(-5,...rows.map(r=>r.y))/20)*20,ymax=Math.ceil(Math.max(105,...rows.map(r=>r.y))/20)*20;
  const yt=[];for(let i=ymin;i<=ymax;i+=20)yt.push(i);
  const c=chart('curveChart',{xmin:xlo,xmax:xhi,ymin,ymax,xlabel:'Concentration (nM), logarithmic scale',ylabel:'Remaining activity (%)',xticks:ticks(xlo,xhi),yticks:yt});
  c.line([[xlo,50],[xhi,50]],{stroke:'#f3c887','stroke-width':1,'stroke-dasharray':'2 5',fill:'none'});
  const curve=fit=>Array.from({length:220},(_,i)=>{const x=xlo+(xhi-xlo)*i/219;return[x,predict(10**x,fit)];});
  a.alternatives.filter(o=>o.mode!==f.mode).forEach(o=>c.line(curve(o),{class:'otherline'}));c.line(curve(f),{class:'fitline'});
  for(const r of rows.filter(r=>r.x>0)){const dot=node('circle',{cx:c.X(Math.log10(r.x)),cy:c.Y(r.y),r:3.4,class:'point'});dot.append(node('title',{},`${format(r.x)} nM; ${format(r.y)}%`));c.plot.append(dot);}
  if(10**f.m>=a.min&&10**f.m<=a.max)c.line([[f.m,ymin],[f.m,ymax]],{stroke:'#c6e48b','stroke-dasharray':'4 5','stroke-width':1,opacity:.6});
  const zero=a.groups.find(g=>g.x===0);
  $('chartCaption').textContent=`${rows.length} wells → ${a.groups.length} equally weighted concentration means. Lines shown only across tested positive doses.${zero?` Zero-dose mean ${format(zero.y)}% (n=${zero.n}) is included in the fit, not plotted on the log axis.`:''} Vertical green guide: fitted relative midpoint, not necessarily the control-defined IC50.`;
  const prof=a.profile, zoom=!$('fullProfile').checked&&prof.available&&prof.lower!==null&&prof.upper!==null&&!prof.disconnected;
  const pad=zoom?Math.max(.2,(prof.upper-prof.lower)*1.5):0;
  const plo=zoom?Math.max(f.lo,f.m-pad):f.lo, phi=zoom?Math.min(f.hi,f.m+pad):f.hi;
  const pticks=zoom?Array.from({length:5},(_,i)=>plo+(phi-plo)*i/4):ticks(plo,phi,4);
  const p=chart('profileChart',{xmin:plo,xmax:phi,ymin:0,ymax:12,xlabel:'Candidate relative IC50 (nM)',ylabel:'Likelihood-ratio statistic',xticks:pticks,yticks:[0,4,8,12]});
  p.line(prof.points.map(v=>[v.m,Math.min(13,v.lr)]),{class:'fitline'});
  p.line([[f.lo,prof.cutoff],[f.hi,prof.cutoff]],{stroke:'#f3c887','stroke-dasharray':'5 4','stroke-width':1,fill:'none'});
  const residual=a.groups.filter(g=>g.x>0).map(g=>[Math.log10(g.x),g.y-predict(g.x,f)]);
  const range=Math.max(5,...residual.map(p=>Math.abs(p[1])))*1.2;
  const r=chart('residualChart',{xmin:xlo,xmax:xhi,ymin:-range,ymax:range,xlabel:'Concentration (nM)',ylabel:'Mean residual (pp)',xticks:ticks(xlo,xhi,4),yticks:[-Math.round(range*.8),0,Math.round(range*.8)]});
  r.line([[xlo,0],[xhi,0]],{stroke:'#a9bcc3','stroke-width':1,fill:'none'});
  for(const [x,y]of residual)r.plot.append(node('circle',{cx:r.X(x),cy:r.Y(y),r:4,class:'point'}));
}
function render(a){
  current=a;const f=a.fit,p=a.profile;
  $('relStatus').textContent=a.relativeSupported?'Conditional estimate supported':'Do not endorse this estimate';
  $('relStatus').parentElement.classList.toggle('ok',a.relativeSupported);
  $('relValue').textContent=`${format(10**f.m)} nM · fitted candidate`;
  const lower=p.lower===null?'open':`${format(10**p.lower)}`,upper=p.upper===null?'open':`${format(10**p.upper)}`;
  $('relText').textContent=`Midpoint response: ${format(a.relativeTarget)}%. ${p.available?`Approximate 95% profile interval: ${lower} to ${upper} nM.`:'Profile interval unavailable (insufficient information or zero residual variance).'} ${a.relativeSupported?'Conditional on the selected model and the working error assumptions.':'Convergence alone does not justify reporting the candidate as an experimental potency.'}`;
  $('absStatus').textContent=a.absoluteStatus;$('absStatus').parentElement.classList.toggle('ok',a.absoluteSupported);
  $('absValue').textContent=a.absoluteSupported?`${format(a.absCross[0].estimate)} nM · local interpolation`:a.absolute===null?'No finite crossing in selected model':`${format(a.absolute)} nM · model crossing only`;
  $('absText').textContent=a.absoluteText+(a.absoluteSupported?` Tested bracket: ${format(a.absCross[0].low)}–${format(a.absCross[0].high)} nM. Selected-model crossing: ${format(a.absolute)} nM; no absolute-IC50 confidence interval computed.`:'');
  const cs=CASES.find(c=>c.id===caseId);
  $('lesson').textContent=kind==='synthetic'?cs.lesson:'These are user-supplied normalized observations. The engine cannot establish sample identity, control validity, independence, mechanism or the suitability of its Gaussian working model.';
  $('next').textContent=kind==='synthetic'?cs.next:'Use the diagnostic that failed to choose the next measurement: controls, additional concentrations, independent runs or an orthogonal endpoint.';
  const best=Math.min(...a.alternatives.filter(v=>v.aicc!==null).map(v=>v.aicc));
  $('modelTable').replaceChildren(...a.alternatives.map(v=>{
    const tr=document.createElement('tr');if(v.mode===f.mode)tr.className='selected';
    [MODES[v.mode].name,format(10**v.m)+(v.boundary?' [bound]':''),`${format(v.bottom)} / ${format(v.top)}`,format(v.h),format(v.rmse),v.aicc===null?'unavailable':format(v.aicc-best)].forEach(t=>{const td=document.createElement('td');td.textContent=t;tr.append(td);});return tr;
  }));
  $('flags').replaceChildren(...(a.flags.length?a.flags:['No heuristic flag triggered. This is not evidence of assay validity or mechanism.']).map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));
  report=`${kind==='synthetic'?'Synthetic teaching example. ':''}${MODES[f.mode].name} was fitted to ${a.groups.length} equally weighted concentration means (${rows.length} observations; ${format(a.min)}–${format(a.max)} nM). `;
  report+=a.relativeSupported?`The relative IC50 was ${format(10**f.m)} nM (approximate 95% profile-likelihood interval ${lower}–${upper} nM), conditional on the model, parameter domain and independent, equal-variance Gaussian mean errors. `:'A reportable relative IC50 was not established by this audit; the numerical fitted candidate is not endorsed. ';
  report+=a.absoluteSupported?`The control-defined 50% threshold was locally interpolated at ${format(a.absCross[0].estimate)} nM between tested concentrations ${format(a.absCross[0].low)} and ${format(a.absCross[0].high)} nM; that bracket is not a confidence interval. `:a.absoluteText+' ';
  report+=`Fitted bottom ${format(f.bottom)}%, top ${format(f.top)}%, Hill slope ${format(f.h)}. Experimental repeatability and mechanism require separate evaluation.`;
  $('reportText').textContent=report;renderCharts();
}
function setBusy(v){busy=v;$('busy').textContent=v?'COMPUTING':'LOCAL COMPUTATION';for(const id of ['loo','exportReport','exportCSV','exportJSON','exportSVG'])$(id).disabled=v;}
function run(){loo=null;$('looResult').textContent='Dose-influence analysis has not been run.';$('inputError').textContent='';setBusy(true);worker.postMessage({id:++requestId,type:'audit',rows,mode:$('model').value,controlsValid:$('controlsValid').checked});}
worker.onmessage=({data})=>{if(data.id!==requestId)return;setBusy(false);if(data.error){$('inputError').textContent=data.error;return;}if(data.type==='loo'){loo=data.result;$('looResult').textContent=`Omitting one positive-dose group at a time moves the fitted relative midpoint from ${format(loo.minimum)} to ${format(loo.maximum)} nM. ${loo.records.filter(r=>r.boundary).length} reduced fits hit a parameter bound. This is sensitivity, not a confidence interval or an exclusion rule.`;}else render(data.result);};
worker.onerror=e=>{e.preventDefault?.();const receive=worker.onmessage;worker.terminate?.();worker=localRunner;worker.onmessage=receive;run();};
function rangeLabels(){$('maxValue').textContent=`${format(10**Number($('maxDose').value))} nM`;$('noiseValue').textContent=`${$('noise').value} pp`;}
function loadCase(reset=true){caseId=$('scenario').value;const c=CASES.find(c=>c.id===caseId);if(reset){$('maxDose').value=c.max;$('noise').value=c.noise;$('seed').value=42;}rangeLabels();const seed=Number($('seed').value);if(!Number.isInteger(seed)||seed<1||seed>999999){$('inputError').textContent='Use an integer seed from 1 to 999999.';return;}rows=generate(caseId,{max:+$('maxDose').value,noise:+$('noise').value,seed});kind='synthetic';$('dataKind').textContent='SYNTHETIC';$('caseTitle').textContent=c.title;$('caseSubtitle').textContent=c.subtitle;$('controlsValid').checked=true;run();}
CASES.forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=c.title;$('scenario').append(o);});
$('scenario').addEventListener('change',()=>loadCase());
$('generate').addEventListener('click',()=>loadCase(false));
for(const id of ['maxDose','noise'])$(id).addEventListener('input',rangeLabels);
for(const id of ['model','controlsValid'])$(id).addEventListener('change',run);
function inputCSV(text){try{const parsed=parseCSV(text);rows=parsed;kind='user';$('dataKind').textContent='USER DATA';$('caseTitle').textContent='Your concentration-response series';$('caseSubtitle').textContent='Synthetic settings above apply only when regenerating.';$('controlsValid').checked=false;run();}catch(e){$('inputError').textContent=e.message;}}
$('applyCSV').addEventListener('click',()=>inputCSV($('csv').value));
$('csvFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;if(file.size>1e6){$('inputError').textContent='Maximum file size: 1 MB.';return;}const text=await file.text();$('csv').value=text;inputCSV(text);e.target.value='';});
$('loo').addEventListener('click',()=>{setBusy(true);worker.postMessage({id:++requestId,type:'loo',rows,mode:$('model').value});});
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('[data-tab]').forEach(t=>{t.classList.toggle('active',t===b);t.setAttribute('aria-selected',String(t===b));});
  document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=p.id!==b.dataset.tab);
  if(b.dataset.tab==='lab')renderCharts();
}));
function download(name,text,mime='text/plain'){const url=URL.createObjectURL(new Blob([text],{type:mime})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);$('exportStatus').textContent=`Prepared ${name}. If your browser blocks the download, open the workbench directly and retry.`;}
function csv(){return 'concentration,response\n'+rows.map(r=>`${r.x},${r.y}`).join('\n');}
$('exportCSV').addEventListener('click',()=>download('curve-check-data.csv',csv(),'text/csv'));
$('exportJSON').addEventListener('click',()=>download('curve-check-session.json',JSON.stringify({schema:'curve-check-session-v1',version:VERSION,kind,caseId,model:$('model').value,controlsValid:$('controlsValid').checked,rows,synthetic:{max:+$('maxDose').value,noise:+$('noise').value,seed:+$('seed').value},audit:current,influence:loo},null,2),'application/json'));
$('exportReport').addEventListener('click',()=>download('curve-check-audit.md',`# Curve Check audit\n\n99 Small Problems 09 · engine ${VERSION}\n\n${report}\n\n## Review flags\n\n${current.flags.map(f=>'- '+f).join('\n')||'No heuristic flag triggered. This does not validate the assay.'}\n\n## Method and scope\n\nEqual-weight concentration means; decreasing logistic model. Bounds: -50 <= bottom <= top <= 150%; slope 0.1 to 5; midpoint four log units beyond the measured range. Profile interval uses an asymptotic 95% likelihood-ratio cutoff of 3.84146 with independent homoscedastic Gaussian concentration-mean errors. Neither control uncertainty nor between-run variation is propagated. No absolute-IC50 confidence interval is computed. Heuristic audit thresholds are teaching choices, not validated assay acceptance criteria.\n\n${loo?$('looResult').textContent:''}\n\n## Evidence context\n\nMidpoint definitions and extrapolation follow the questions raised in the [Assay Guidance Manual](https://www.ncbi.nlm.nih.gov/sites/books/n/assayguide/assayops/) and [GraphPad's definition guide](https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_50_of_what__relative_vs_absolu.htm). Mechanistic interpretation requires separate assessment, as discussed by [Tonge (2019)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/).\n\n## Data\n\n\`\`\`csv\n${csv()}\n\`\`\`\n`,'text/markdown'));
$('exportSVG').addEventListener('click',()=>{const svg=$('curveChart').querySelector('svg').cloneNode(true);const style=node('style',{},'text{font:12px Arial,sans-serif;fill:#a9bcc3}.grid{stroke:#34464d;stroke-width:.6}.fitline{stroke:#c6e48b;stroke-width:2.5;fill:none}.otherline{stroke:#9fabb2;stroke-width:1;stroke-dasharray:5 5;opacity:.6;fill:none}.point{fill:#85c6e6;opacity:.75}');svg.prepend(style);const desc=node('desc',{},`${kind==='synthetic'?'Synthetic data. ':''}${MODES[current.fit.mode].name}. ${report}`);svg.prepend(desc);download('curve-check-dose-response.svg',new XMLSerializer().serializeToString(svg),'image/svg+xml');});
$('sessionFile').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>3e6)throw Error('Maximum session size: 3 MB.');const d=JSON.parse(await file.text());if(d.schema!=='curve-check-session-v1'||!Array.isArray(d.rows)||!MODES[d.model])throw Error('Invalid Curve Check session schema.');const parsed=parseCSV('concentration,response\n'+d.rows.map(r=>`${r.x},${r.y}`).join('\n'));rows=parsed;kind=d.kind==='synthetic'?'synthetic':'user';caseId=CASES.some(c=>c.id===d.caseId)?d.caseId:'complete';$('scenario').value=caseId;$('model').value=d.model;$('controlsValid').checked=d.controlsValid===true;$('dataKind').textContent=kind==='synthetic'?'SYNTHETIC':'USER DATA';$('caseTitle').textContent='Restored session';$('caseSubtitle').textContent='Stored data reanalyzed with this engine version.';if(d.synthetic){$('maxDose').value=Math.max(0,Math.min(4,Number(d.synthetic.max)||0));$('noise').value=Math.max(0,Math.min(15,Number(d.synthetic.noise)||0));$('seed').value=Math.max(1,Math.min(999999,Number(d.synthetic.seed)||42));rangeLabels();}run();}catch(err){$('inputError').textContent=err.message;}e.target.value='';});
let timer;window.addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(renderCharts,100);});
$('fullProfile').addEventListener('change',renderCharts);
loadCase();
