// Small, deliberately bounded renderer for our authored Markdown, not user input.
import {readFileSync,writeFileSync,cpSync,mkdirSync} from 'node:fs';
import katex from 'katex';
const md=readFileSync(new URL('../docs/ANALYSIS.md',import.meta.url),'utf8');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const math=(s,displayMode=false)=>katex.renderToString(s,{displayMode,throwOnError:true,trust:false,output:'htmlAndMathml'});
const inline=s=>s.split(/(\\\([\s\S]*?\\\))/g).map(part=>part.startsWith('\\(')?math(part.slice(2,-2)):escape(part).replace(/\[([^\]]+)\]\((https:\/\/(?:[^()\s]|\([^()\s]*\))+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')).join('');
const html=md.match(/\\\[[\s\S]*?\\\]|```[\s\S]*?```|(?:[^\n]+\n?)+/g).map(block=>{
  block=block.trim();
  if(block.startsWith('\\['))return `<div class="math-block" tabindex="0">${math(block.slice(2,-2),true)}</div>`;
  const cover=block.match(/^!\[([^\]]+)\]\((assets\/curve-check-cover\.webp)\)$/);
  if(cover)return `<figure class="article-cover"><img src="${cover[2]}" width="1600" height="900" alt="${escape(cover[1])}"><figcaption>${inline(cover[1])}</figcaption></figure>`;
  const figure=block.match(/^!\[([^\]]+)\]\((figures\/[a-z-]+\.svg)\)$/);
  if(figure){const [,caption,src]=figure;const svg=readFileSync(new URL('../docs/'+src,import.meta.url),'utf8');const dims=svg.match(/width="(\d+)" height="(\d+)"/);if(!dims)throw Error('Figure dimensions missing');return `<figure><div class="figure-scroll" tabindex="0"><img src="${src}" width="${dims[1]}" height="${dims[2]}" alt="${escape(caption).replaceAll('"','&quot;')}"></div><figcaption>${inline(caption)} <a href="${src}" target="_blank" rel="noopener">Open full-size figure</a>.</figcaption></figure>`;}
  if(block.startsWith('```'))return `<pre>${escape(block.replace(/^```[^\n]*\n/,'').replace(/\n```$/,''))}</pre>`;
  if(/^### /.test(block))return `<h3>${inline(block.slice(4))}</h3>`;
  if(/^## /.test(block))return `<h2 id="${block.slice(3).toLowerCase().replace(/[^a-z0-9 ]/g,'').trim().replace(/ +/g,'-')}">${inline(block.slice(3))}</h2>`;
  if(/^# /.test(block))return `<h1>${inline(block.slice(2))}</h1>`;
  return `<p>${inline(block).replace(/ {2}\n/g,'<br>')}</p>`;
}).join('\n');
writeFileSync(new URL('../web/article-fragment.html',import.meta.url),html);
writeFileSync(new URL('../web/article.md',import.meta.url),md);
mkdirSync(new URL('../web/vendor/katex/',import.meta.url),{recursive:true});
cpSync(new URL('../node_modules/katex/dist/katex.min.css',import.meta.url),new URL('../web/vendor/katex/katex.min.css',import.meta.url));
cpSync(new URL('../node_modules/katex/dist/fonts',import.meta.url),new URL('../web/vendor/katex/fonts',import.meta.url),{recursive:true});
cpSync(new URL('../node_modules/katex/LICENSE',import.meta.url),new URL('../web/vendor/katex/LICENSE',import.meta.url));
cpSync(new URL('../docs/figures',import.meta.url),new URL('../web/figures',import.meta.url),{recursive:true});
cpSync(new URL('../docs/assets',import.meta.url),new URL('../web/assets',import.meta.url),{recursive:true});
const story=html.replace(/^<h1>.*?<\/h1>\n/,'').replace(/^<p>Data-Rich.*?<\/p>\n/,'').replace(/<figure class="article-cover">.*?<\/figure>\n/,'');
const shell=readFileSync(new URL('./article-shell.html',import.meta.url),'utf8');
writeFileSync(new URL('../web/article.html',import.meta.url),shell.replace('{{ARTICLE}}',story));
console.log(`Built article: ${md.split(/\s+/).length} whitespace-delimited words.`);
