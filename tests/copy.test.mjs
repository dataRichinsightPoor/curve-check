import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('web/copy.html');
test('copy-ready edition embeds figures and equations without runtime dependencies',()=>{
  const images=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);
  assert.equal(images.length,8);
  assert.equal(images.filter(s=>s.includes('data-math="true"')).length,4);
  assert.equal((html.match(/data-math-inline="true"/g)||[]).length,18);
  assert.ok(images.every(s=>s.includes('src="data:image/png;base64,')));
  assert.ok(!/<(?:script|link)[^>]+(?:src|href)=/.test(html));
  assert.ok(html.includes('No. CCLXVIII')&&html.includes('Installment 09'));
  assert.ok(html.includes('References and reading notes'));
  assert.ok(!html.includes('{{ARTICLE}}')&&!html.includes('{{SCRIPT}}'));
  assert.ok(html.includes(createHash('sha256').update(read('docs/ANALYSIS.md')).digest('hex')));
});
test('copy action prioritizes synchronous native copy and keeps selection fallback',()=>{
  const js=read('scripts/copy-actions.js');
  assert.ok(js.indexOf("execCommand('copy')")<js.indexOf('await navigator.clipboard.write'));
  assert.ok(js.includes("setData('text/html',content.html)"));
  assert.ok(js.includes('selectArticle()')&&js.includes('cloneNode(true)'));
});
