import {response,relativeInformation,endpoints} from './article-model.js';
import './story-actions.js';
const target=document.querySelector('.story-prose figure:last-of-type');
const section=document.createElement('section');
section.id='interactive-experiment';section.className='interactive-experiment no-copy';
section.setAttribute('aria-labelledby','experiment-title');
section.innerHTML=`
  <p class="kicker">A SMALL EXPERIMENT IN INFORMATION</p>
  <h2 id="experiment-title">Move the signal.<br>Keep the noise honest.</h2>
  <p>This is the stipulated response, not a fitted curve. Adjust amplitude and noise independently; the generating midpoint stays at 10 nM and the slope at 1.</p>
  <div class="experiment-presets" aria-label="Example settings">
    <button data-example="20,20" aria-pressed="true">Small + noisy</button>
    <button data-example="20,1" aria-pressed="false">Small + precise</button>
    <button data-example="0,20" aria-pressed="false">Flat + noisy</button>
  </div>
  <div class="experiment-controls">
    <label for="articleAmplitude">Response amplitude <output id="amplitudeValue">20 / 100 units</output><input id="articleAmplitude" type="range" min="0" max="100" step="1" value="20"></label>
    <label for="articleNoise">Well-error SD <output id="noiseValue">20 units</output><input id="articleNoise" type="range" min="1" max="30" step="1" value="20"></label>
  </div>
  <div id="articlePlot" aria-label="Exact response and plus or minus one generating noise standard deviation"></div>
  <p class="plot-key"><span class="green-line"></span> Exact response <span class="noise-patch"></span> ±1 generating SD, not a confidence interval</p>
  <div class="experiment-results" aria-live="polite">
    <div><span>INFORMATION BENCHMARK</span><strong id="informationValue"></strong><p id="informationNote"></p></div>
    <div><span>RESPONSE AT RELATIVE MIDPOINT</span><strong id="midpointValue"></strong><p id="absoluteNote"></p></div>
  </div>
  <p class="experiment-caveat">Information is relative to amplitude 100 and SD 20, with identical doses, slope and midpoint, independent Gaussian errors, and other parameters known. This favorable analytical benchmark is not fit uncertainty, power, or a reporting rule. No observations are simulated in this diagram.</p>
  <details class="code-inspector"><summary>Inspect the mathematics in code</summary><pre><code>function response(x, A, C = 10, h = 1) {
  return 100 - A + A / (1 + (x / C) ** h);
}

// Known-nuisance Fisher-information ratio.
// Reference: A = 100, noise SD = 20.
function relativeInformation(A, sigma) {
  return (A / 100) ** 2 * (20 / sigma) ** 2;
}

// With T = 100, B = 100 - A, h = 1:
// a finite absolute crossing exists only if A > 50.
const absoluteIC50 = A > 50 ? 10 * 50 / (A - 50) : null;</code></pre>
    <p><a href="https://github.com/dataRichinsightPoor/curve-check/blob/main/web/article-model.js" target="_blank" rel="noopener">Read the running model</a> · <a href="https://github.com/dataRichinsightPoor/curve-check/blob/main/tests/article-model.test.mjs" target="_blank" rel="noopener">Inspect its tests</a></p>
  </details>
  <a class="workbench-cta" href="index.html">Now audit the observations <span aria-hidden="true">↗</span></a>
  <p class="experiment-caveat">The full tool adds synthetic and uploaded wells, independent controls, normalization, fitted candidates, diagnostics, and qualified exports. Calculations stay in your browser.</p>`;
target.after(section);
const $=id=>document.getElementById(id);
function render(){
  const A=+$('articleAmplitude').value,sigma=+$('articleNoise').value,info=relativeInformation(A,sigma),e=endpoints(A);
  $('amplitudeValue').value=`${A} / 100 units`;$('noiseValue').value=`${sigma} units`;
  $('informationValue').textContent=info===0?'0×':`${Number(info.toPrecision(3))}×`;
  $('informationNote').textContent=info===0?'A flat generator has no midpoint information.':info<1?`${Number((1/info).toPrecision(3))} times less than the reference.`:info===1?'Same information as the reference.':`${Number(info.toPrecision(3))} times the reference information.`;
  $('midpointValue').textContent=e.midpointResponse===null?'Not defined':`${e.midpointResponse}% remaining`;
  $('absoluteNote').textContent=e.absoluteIC50===null?'No finite absolute IC50 in this model.':`Absolute IC50: ${Number(e.absoluteIC50.toPrecision(4))} nM.`;
  section.querySelectorAll('[data-example]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.example===`${A},${sigma}`)));
  const w=Math.max(280,$('articlePlot').clientWidth),h=280,L=42,R=18,T=15,B=45;
  const X=x=>L+(Math.log10(x)+2)/6*(w-L-R),Y=y=>T+(135-y)/170*(h-T-B);
  const xs=Array.from({length:121},(_,i)=>10**(-2+i/20));
  const path=points=>points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Model response for amplitude ${A} and generating noise SD ${sigma}">`;
  svg+=`<text x="${L}" y="12">Remaining activity (% of reference)</text>`;
  for(const y of [0,50,100])svg+=`<path d="M${L} ${Y(y)}H${w-R}" stroke="${y===50?'#8d5c3b':'#ccd6cf'}" stroke-dasharray="${y===50?'5 5':'none'}" fill="none"/><text x="${L-9}" y="${Y(y)+4}" text-anchor="end">${y}</text>`;
  for(const x of [.01,1,100,10000])svg+=`<text x="${X(x)}" y="${h-B+24}" text-anchor="middle">${x}</text>`;
  const band=xs.map(x=>[X(x),Y(response(x,A)+sigma)]).concat([...xs].reverse().map(x=>[X(x),Y(response(x,A)-sigma)]));
  svg+=`<path d="${path(band)}Z" fill="#d7e4da"/><path d="${path(xs.map(x=>[X(x),Y(response(x,A))]))}" stroke="#165b42" stroke-width="3" fill="none"/>`;
  svg+=`<path d="M${X(10)} ${T}V${h-B}" stroke="#67776e" stroke-dasharray="3 5"/><text x="${w/2}" y="${h-3}" text-anchor="middle">Concentration (nM, log scale)</text></svg>`;
  $('articlePlot').innerHTML=svg;
}
for(const id of ['articleAmplitude','articleNoise'])$(id).addEventListener('input',render);
section.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>{const [A,sigma]=b.dataset.example.split(',');$('articleAmplitude').value=A;$('articleNoise').value=sigma;render();}));
window.addEventListener('resize',render);render();
