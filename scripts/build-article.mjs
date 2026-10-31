// Small, deliberately bounded renderer for our authored Markdown, not user input.
import {readFileSync,writeFileSync} from 'node:fs';
const md=readFileSync(new URL('../docs/ANALYSIS.md',import.meta.url),'utf8');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const inline=s=>escape(s).replace(/\[([^\]]+)\]\((https:\/\/(?:[^()\s]|\([^()\s]*\))+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
const html=md.match(/```[\s\S]*?```|(?:[^\n]+\n?)+/g).map(block=>{
  block=block.trim();
  if(block.startsWith('```'))return `<pre>${escape(block.replace(/^```[^\n]*\n/,'').replace(/\n```$/,''))}</pre>`;
  if(/^## /.test(block))return `<h2>${inline(block.slice(3))}</h2>`;
  if(/^# /.test(block))return `<h1>${inline(block.slice(2))}</h1>`;
  return `<p>${inline(block).replace(/ {2}\n/g,'<br>')}</p>`;
}).join('\n');
writeFileSync(new URL('../web/article-fragment.html',import.meta.url),html);
writeFileSync(new URL('../web/article.md',import.meta.url),md);
console.log(`Built article: ${md.split(/\s+/).length} whitespace-delimited words.`);
