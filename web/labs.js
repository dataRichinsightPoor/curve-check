import {HYPOTHESES,INTERVENTIONS,twinResponse,normalizeRaw,effectDose} from './scenarios.js';
const $=id=>document.getElementById(id);
const colors=['#c6e48b','#85c6e6','#f3c887','#f0aaa3','#c6adf5'];
const doses=Array.from({length:121},(_,i)=>10**(-2+i/20));
const fmt=x=>Number(x.toPrecision(3)).toString();
function plot(id,series){
  // Rerender on reveal/resize to keep labels readable at phone width.
  const ns='http://www.w3.org/2000/svg',el=(t,a={},text='')=>{const n=document.createElementNS(ns,t);for(const[k,v]of Object.entries(a))n.setAttribute(k,v);n.textContent=text;return n;};
  const w=Math.max(275,$(id).clientWidth||560);
  const svg=el('svg',{viewBox:`0 0 ${w} 280`,role:'img','aria-label':'Synthetic remaining response against log concentration'});
  const X=x=>42+(Math.log10(x)+2)*(w-72)/6,Y=y=>235-y*1.9;
  for(const y of [0,50,100]){svg.append(el('line',{x1:42,x2:w-30,y1:Y(y),y2:Y(y),stroke:'#34464d'}));svg.append(el('text',{x:32,y:Y(y)+4,'text-anchor':'end'},String(y)));}
  for(const x of [.01,1,100,10000])svg.append(el('text',{x:X(x),y:255,'text-anchor':'middle'},String(x)));
  svg.append(el('text',{x:w/2,y:277,'text-anchor':'middle'},'Concentration (nM), log scale'));
  svg.append(el('text',{x:42,y:20},'Remaining response (%)'));
  series.forEach((s,i)=>{const p=el('path',{d:doses.map((x,j)=>`${j?'L':'M'}${X(x)},${Y(s.fn(x))}`).join(' '),fill:'none',stroke:s.color??colors[i],'stroke-width':3,'stroke-dasharray':s.dash??''});p.append(el('title',{},s.name));svg.append(p);});
  $(id).replaceChildren(svg);
}
INTERVENTIONS.forEach((v,i)=>{const o=document.createElement('option');o.value=i;o.textContent=v.name;$('intervention').append(o);});
function twins(){
  const k=+$('intervention').value;
  plot('twinsChart',HYPOTHESES.map((name,i)=>({name,fn:x=>twinResponse(i,k,x),dash:i?`${12-i*2} ${i*3}`:''})));
  $('twinsLegend').replaceChildren(...HYPOTHESES.map((name,i)=>{const s=document.createElement('span');s.style.color=colors[i];s.textContent=name;return s;}));
  $('twinNote').textContent=INTERVENTIONS[k].note+' These are stipulated perfect interventions; mixed causes and imperfect specificity are not simulated.';
}
function normalization(){
  const raw=x=>96+4/(1+x/10),values=doses.map(raw),self=$('normalization').value==='self';
  const low=self?Math.min(...values):0,high=self?Math.max(...values):100;
  plot('normalChart',[{name:'Independent controls',fn:raw,color:colors[1],dash:'5 4'},{name:'Selected normalization',fn:x=>normalizeRaw([raw(x)],low,high)[0],color:colors[0]}]);
  const result=normalizeRaw(values,low,high);
  $('normalNote').textContent=`Raw measured span: ${fmt(Math.max(...values)-Math.min(...values))} units. Displayed span: ${fmt(Math.max(...result)-Math.min(...result))} percentage points. ${self?'The series supplies its own endpoints: apparent full inhibition has been manufactured by scaling, not observed against independent controls.':'Independent controls preserve the small effect. Blue dashed: independently normalized response; green: selected rule.'}`;
}
function potency(){
  const h=+$('testSlope').value;
  plot('potencyChart',[{name:'Reference',fn:x=>100/(1+x/10),color:colors[1]},{name:'Test',fn:x=>100/(1+(x/20)**h),color:colors[0]}]);
  $('potencyTable').replaceChildren(...[.2,.5,.8].map(e=>{const a=effectDose(1,1,e),b=effectDose(Math.log10(20),h,e),tr=document.createElement('tr');for(const v of [`${e*100}%`,fmt(a),fmt(b),fmt(b/a)]){const td=document.createElement('td');td.textContent=v;tr.append(td);}return tr;}));
  $('potencyNote').textContent=h===1?'The dose ratio stays 2 across effect levels: these stipulated curves differ by a horizontal shift. Blue: reference; green: test.':'The midpoint ratio is still 2, but the effect-level ratios differ. A single relative-potency number would conceal nonparallelism. Blue: reference; green: test.';
}
$('intervention').addEventListener('change',twins);$('normalization').addEventListener('change',normalization);$('testSlope').addEventListener('change',potency);
twins();normalization();potency();
document.querySelector('[data-tab="illusions"]').addEventListener('click',()=>{twins();normalization();potency();});
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(!$('illusions').hidden){twins();normalization();potency();}},100);});
fetch('article-fragment.html').then(r=>{if(!r.ok)throw Error('Article unavailable');return r.text();}).then(html=>{$('articleBody').innerHTML=html;}).catch(()=>{$('articleBody').textContent='Article could not load. Download the Markdown version above.';});
$('downloadArticle').addEventListener('click',async()=>{
  try{
    const response=await fetch('article.md');if(!response.ok)throw Error('Article unavailable');
    const url=URL.createObjectURL(new Blob([await response.text()],{type:'text/markdown;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='Is-It-a-Curve-and-Can-We-Report-the-IC50.md';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
    $('copyStatus').textContent='Article download prepared with complete linked citations.';
  }catch{$('copyStatus').textContent='Download unavailable. Use Copy article, or select the article text below.';}
});
$('copyArticle').addEventListener('click',async()=>{
  const body=$('articleBody');
  try{
    const clone=body.cloneNode(true);
    clone.querySelectorAll('.katex').forEach(el=>{const tex=el.querySelector('annotation')?.textContent||el.textContent;el.replaceWith(document.createTextNode(`\\(${tex}\\)`));});
    clone.querySelectorAll('a[href^="figures/"]').forEach(el=>el.remove());
    clone.querySelectorAll('a').forEach(a=>a.append(` (${a.href})`));
    clone.querySelectorAll('p,h1,h2,h3,figcaption,.math-block').forEach(el=>el.append('\n\n'));
    const plain=clone.textContent;
    const rich=body.cloneNode(true);
    rich.querySelectorAll('.katex').forEach(el=>{const math=el.querySelector('math')?.cloneNode(true);if(math){math.querySelectorAll('annotation').forEach(a=>a.remove());el.replaceWith(math);}});
    rich.querySelectorAll('a[href^="figures/"]').forEach(el=>el.remove());
    rich.querySelectorAll('a').forEach(el=>{el.href=new URL(el.getAttribute('href'),location.href).href;});
    // Embed PNGs, not expiring preview URLs. ClipboardItem accepts a Promise,
    // retaining the initiating user gesture while the local figures are encoded.
    const portableHTML=async()=>{
      for(const el of rich.querySelectorAll('img')){
        const response=await fetch(el.getAttribute('src'));if(!response.ok)throw Error('Figure unavailable');
        const url=URL.createObjectURL(await response.blob());
        try{
          const original=new Image();original.src=url;await original.decode();
          const canvas=document.createElement('canvas');
          canvas.width=original.naturalWidth;canvas.height=original.naturalHeight;
          canvas.getContext('2d').drawImage(original,0,0);
          el.src=canvas.toDataURL('image/png');el.style.maxWidth='100%';el.style.height='auto';
        }finally{URL.revokeObjectURL(url);}
      }
      return new Blob([rich.innerHTML],{type:'text/html'});
    };
    if(navigator.clipboard.write&&window.ClipboardItem)await navigator.clipboard.write([new ClipboardItem({'text/html':portableHTML(),'text/plain':new Blob([plain],{type:'text/plain'})})]);
    else await navigator.clipboard.writeText(plain);
    $('copyStatus').textContent='Article copied with embedded figures, linked citations and MathML equations. Plain text includes TeX and full URLs. Figure and equation formatting depends on the destination editor; the workbench preserves the complete illustrated version.';
  }
  catch{const range=document.createRange();range.selectNodeContents(body);const s=window.getSelection();s.removeAllRanges();s.addRange(range);$('copyStatus').textContent='Article selected. Use your browser’s Copy command. Download Markdown to preserve linked citations.';}
});
