// Original deterministic scientific illustrations. No uploaded/reference images.
import {mkdirSync,writeFileSync} from 'node:fs';
import {weakSignalDemo,reconstruct,signalAudit} from '../web/source-engine.js';
import {groupRows,fit,predict} from '../web/engine.js';
const out=new URL('../docs/figures/',import.meta.url);
mkdirSync(out,{recursive:true});
const c={ink:'#1c3437',grid:'#d4dedc',blue:'#4c7897',green:'#14735e',purple:'#8055a0',gray:'#68787a',amber:'#a54b28'};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
const text=(x,y,s,size=18,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" ${extra}>${esc(s)}</text>`;
const line=(x1,y1,x2,y2,color=c.grid,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5" ${dash?'stroke-dasharray="'+dash+'"':''}/>`;
const path=(points,color,dash='')=>`<path d="${points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(3)},${y.toFixed(3)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="3" ${dash?'stroke-dasharray="'+dash+'"':''}/>`;
const start=(h,title)=>`<svg xmlns="http://www.w3.org/2000/svg" width="760" height="${h}" viewBox="0 0 760 ${h}" role="img" aria-labelledby="title"><title id="title">${esc(title)}</title><rect width="760" height="${h}" fill="#f8faf7"/><g fill="${c.ink}" font-family="Arial, sans-serif">`;
const save=(name,s)=>writeFileSync(new URL(name,out),s+'</g></svg>\n');
const X=x=>90+(Math.log10(x)+2)/6*620;
function axes(y0,h,ymin=-20,ymax=160){
 const Y=y=>y0+h-(y-ymin)/(ymax-ymin)*h;
 let s='';
 for(const y of [0,50,100,150].filter(y=>y>=ymin&&y<=ymax))s+=line(90,Y(y),710,Y(y))+text(76,Y(y)+6,y,17,'text-anchor="end"');
 for(const x of [.01,1,100,10000])s+=line(X(x),y0+h,X(x),y0+h+6,c.ink)+text(X(x),y0+h+26,x,17,'text-anchor="middle"');
 s+=text(400,y0+h+52,'Concentration (nM, log scale)',18,'text-anchor="middle"');
 return {Y,s};
}
let s=start(1130,'Matched synthetic responses: noisy partial, precise partial, and flat');
s+=text(28,36,'A fit is not the same as a resolved midpoint',25,'font-weight="bold"');
s+=text(28,65,'Same seed. Same dose design. Independent-control normalization.',18);
s+=text(28,96,'Blue: wells   •   Dark: means   •   Green: free 4PL',18);
s+=text(28,124,'Purple dashed: known generator   •   Gray dashed: constant fit',18);
const fixtures=[];
for(const [i,[A,sigma,title]] of [[20,20,'Small response, substantial noise'],[20,1,'Same small response, low noise'],[0,20,'No response, substantial noise']].entries()){
 const r=reconstruct(weakSignalDemo(A,sigma,42)),rows=r.variants.control,g=groupRows(rows),f=fit(g),a=signalAudit(rows,f);
 fixtures.push({effect:A,noise:sigma,seed:42,midpoint:10**f.m,range:a.span,edgeContrast:a.edgeContrast,deltaAicc:a.deltaAicc,boundary:f.boundary});
 const top=150+i*320;
 s+=text(28,top,title,23,'font-weight="bold"')+text(28,top+26,`Amplitude ${A} raw units; noise SD ${sigma}.`,18);
 const {Y,s:ax}=axes(top+42,175);s+=ax;
 s+=text(20,top+144,'Remaining activity (%)',16,`transform="rotate(-90 20 ${top+144})" text-anchor="middle"`);
 s+=line(90,Y(a.mean),710,Y(a.mean),c.gray,'4 5');
 const xs=Array.from({length:241},(_,j)=>10**(-2+j/40));
 s+=path(xs.map(x=>[X(x),Y(predict(x,f))]),c.green);
 s+=path(xs.map(x=>[X(x),Y(100*((100-A+A/(1+x/10))-r.full.mean)/r.separation)]),c.purple,'8 6');
 for(const {x,y} of rows)s+=`<circle cx="${X(x)}" cy="${Y(y)}" r="3.5" fill="${c.blue}" opacity=".6"/>`;
 for(const {x,y} of g)s+=`<circle cx="${X(x)}" cy="${Y(y)}" r="4.2" fill="${c.ink}"/>`;
 s+=text(90,top+295,`Candidate C: ${(10**f.m).toPrecision(3)} nM; ΔAICc (4PL − flat): ${a.deltaAicc.toFixed(2)}`,18);
}
save('weak-response.svg',s);
writeFileSync(new URL('../results/article-fixtures.json',import.meta.url),JSON.stringify(fixtures,null,2)+'\n');
s=start(490,'Relative midpoint versus absolute 50 percent inhibition');
s+=text(28,38,'One midpoint. Two very different effects.',25,'font-weight="bold"');
s+=text(28,70,'Exact generators: C = 10 nM, slope = 1',19);
{
const {Y,s:ax}=axes(120,250,0,110);s+=ax;
s+=text(22,245,'Remaining activity (%)',18,'transform="rotate(-90 22 245)" text-anchor="middle"');
const xs=Array.from({length:241},(_,j)=>10**(-2+j/40));
s+=path(xs.map(x=>[X(x),Y(100/(1+x/10))]),c.green);
s+=path(xs.map(x=>[X(x),Y(80+20/(1+x/10))]),c.purple);
s+=line(X(10),Y(0),X(10),Y(110),c.gray,'5 5');
s+=line(90,Y(50),710,Y(50),c.amber,'6 5');
for(const [y,col] of [[50,c.green],[90,c.purple]])s+=`<circle cx="${X(10)}" cy="${Y(y)}" r="6" fill="${col}"/>`;
s+=text(X(10)+12,Y(90)-18,'Partial: 90% at C',20)+text(X(10)+12,Y(50)+27,'Full: 50% at C',20);
s+=text(96,Y(50)-12,'Absolute 50% threshold',18);
s+=text(28,458,'Partial curve approaches 80%: no finite absolute IC50.',20);
}
save('relative-absolute.svg',s);
s=start(510,'Fisher information scales with the square of response amplitude');
s+=text(28,38,'Less amplitude, much less information',25,'font-weight="bold"');
s+=text(28,70,'Fixed noise and design; other curve parameters assumed known.',18);
const IX=a=>95+a/100*600,IY=i=>370-i*250;
for(const v of [0,.25,.5,.75,1])s+=line(95,IY(v),695,IY(v))+text(82,IY(v)+6,v,17,'text-anchor="end"');
for(const a of [0,20,40,60,80,100])s+=text(IX(a),397,a,18,'text-anchor="middle"');
s+=path(Array.from({length:101},(_,a)=>[IX(a),IY((a/100)**2)]),c.green);
s+=line(IX(20),IY(0),IX(20),IY(.04),c.purple,'4 4');
s+=`<circle cx="${IX(20)}" cy="${IY(.04)}" r="6" fill="${c.purple}"/>`;
s+=line(IX(20),IY(.04)-9,IX(20),240,c.purple);
s+=text(130,223,'20 → 0.04 of the information',21);
s+=text(IX(100)-12,IY(1)-16,'100 → 1',21,'text-anchor="end"');
s+=text(400,434,'Response amplitude (raw units)',20,'text-anchor="middle"');
s+=text(25,245,'Relative information',19,'transform="rotate(-90 25 245)" text-anchor="middle"');
s+=text(28,479,'Not a reportability cutoff or an empirical power calculation.',18);
save('information.svg',s);
console.log(JSON.stringify(fixtures,null,2));
