// Offline-friendly publishing artifact. Browser is used at build time only.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const inlineMath=new Map([
  ['C','C'],['T','T'],['B','B'],['h>0','h > 0'],['T=100','T = 100'],
  ['B=80','B = 80'],['A=T-B','A = T − B'],['q=(x/C)^h','q = (x/C)ʰ'],
  ['m=\\log_{10}(C/c_0)','m = log₁₀(C/c₀)'],['c_0=1\\ \\mathrm{nM}','c₀ = 1 nM'],
  ['x=C','x = C'],['\\ln(10)Ah/4','ln(10)Ah/4'],['\\sigma^2','σ²'],
  ['m','m'],['A^2/\\sigma^2','A²/σ²'],['q/(1+q)^2','q/(1+q)²'],
  ['z=a+by','z = a + by'],['|b|','|b|']
]);
let css=read('web/vendor/katex/katex.min.css');
css=css.replace(/url\(([^)]+)\)/g,(_,name)=>{
  const path=new URL('web/vendor/katex/'+name.replace(/['"]/g,''),root);
  const ext=path.pathname.split('.').pop();
  return `url(data:font/${ext};base64,${readFileSync(path).toString('base64')})`;
});
const browser=await chromium.launch({headless:true,channel:'chromium'});
try{
  const page=await browser.newPage({viewport:{width:1000,height:1000},deviceScaleFactor:2});
  await page.setContent(`<style>${css}body{margin:0;padding:20px;background:white;font:18px/1.75 Georgia,serif;color:#202c26}article{width:800px}.math-block{padding:12px 0}.katex{font-size:1.05em}img{max-width:100%;height:auto}</style><article>${read('web/article-fragment.html')}</article>`);
  await page.evaluate(()=>document.fonts.ready);
  const equations=page.locator('.katex');
  for(let i=await equations.count()-1;i>=0;i--){
    const el=equations.nth(i);
    const tex=await el.locator('annotation').textContent();
    if(!await el.evaluate(node=>!!node.closest('.math-block'))){
      if(!inlineMath.has(tex))throw Error('Add an explicit portable-text mapping for inline math: '+tex);
      await el.evaluate((node,{tex,text})=>{
        const span=document.createElement('span');span.dataset.mathInline='true';span.dataset.tex=tex;
        span.textContent=text;node.replaceWith(span);
      },{tex,text:inlineMath.get(tex)});
      continue;
    }
    await el.evaluate(node=>{node.style.display='inline-block';node.style.width='max-content';});
    const box=await el.boundingBox();
    const png=await el.screenshot({type:'png'});
    await el.evaluate((node,{src,tex,width,height})=>{
      const img=document.createElement('img');img.src=src;img.alt=tex;img.dataset.math='true';
      img.width=Math.ceil(width);img.height=Math.ceil(height);
      img.style.cssText='display:inline-block;vertical-align:middle;max-width:100%;height:auto;border:0';
      node.replaceWith(img);
    },{src:'data:image/png;base64,'+png.toString('base64'),tex,width:box.width,height:box.height});
  }
  const images=page.locator('article img:not([data-math])');
  for(let i=0;i<await images.count();i++){
    const img=images.nth(i),src=await img.getAttribute('src');
    const bytes=readFileSync(new URL('web/'+src,root));
    const mime=src.endsWith('.svg')?'image/svg+xml':'image/webp';
    await img.evaluate(async(node,data)=>{
      node.src=data;await node.decode();
      const canvas=document.createElement('canvas');canvas.width=node.naturalWidth;canvas.height=node.naturalHeight;
      canvas.getContext('2d').drawImage(node,0,0);node.src=canvas.toDataURL('image/png');
      node.style.cssText='display:block;max-width:100%;height:auto;margin:16px auto;border:0';
    },`data:${mime};base64,${bytes.toString('base64')}`);
  }
  const article=await page.locator('article').evaluate(el=>{
    el.querySelectorAll('h1').forEach(e=>e.style.cssText="font:normal 38px/1.2 Georgia,serif;margin:0 0 24px;color:#202c26");
    el.querySelectorAll('h2').forEach(e=>e.style.cssText="font:bold 24px/1.35 Arial,sans-serif;margin:36px 0 18px;color:#202c26");
    el.querySelectorAll('h3').forEach(e=>e.style.cssText="font:bold 19px/1.4 Arial,sans-serif;margin:28px 0 16px");
    el.querySelectorAll('p').forEach(e=>e.style.cssText='margin:0 0 22px;line-height:1.75');
    el.querySelectorAll('figure').forEach(e=>e.style.cssText='margin:28px 0');
    el.querySelectorAll('figcaption').forEach(e=>e.style.cssText='font:14px/1.6 Arial,sans-serif;color:#526057;margin:10px 0 24px');
    el.querySelectorAll('.math-block').forEach(e=>e.style.cssText='padding:12px 0;margin:22px 0;text-align:center');
    el.querySelectorAll('a').forEach(a=>{
      a.href=new URL(a.getAttribute('href'),'https://datarichinsightpoor.github.io/curve-check/').href;
      a.style.cssText='color:#165b42;text-decoration:underline';
    });
    el.querySelectorAll('a[href*="/figures/"]').forEach(a=>{
      if(a.nextSibling?.nodeType===Node.TEXT_NODE&&a.nextSibling.textContent.trim()==='.')a.nextSibling.remove();
      a.remove();
    });
    return el.innerHTML;
  });
  const hash=createHash('sha256').update(read('docs/ANALYSIS.md')).digest('hex');
  const output=read('scripts/copy-shell.html').replace('{{ARTICLE}}',article).replace('{{SCRIPT}}',read('scripts/copy-actions.js')).replace('{{HASH}}',hash);
  writeFileSync(new URL('web/copy.html',root),output);
  console.log(`Built self-contained copy edition: ${Math.round(Buffer.byteLength(output)/1024)} KB.`);
}finally{await browser.close();}
