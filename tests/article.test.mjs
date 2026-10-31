import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../web/article-fragment.html',import.meta.url),'utf8');
test('rendered parenthetical citations do not append punctuation to URLs',()=>{
  assert.ok(html.includes('href="https://www.ncbi.nlm.nih.gov/sites/books/NBK374281/"'));
  assert.ok(!html.includes('NBK374281/)"'));
});
test('rendered guideline URLs retain parentheses inside filenames',()=>{
  assert.ok(html.includes('href="https://database.ich.org/sites/default/files/ICH_Q2(R2)_Guideline_2023_1130_ErrorCorrection_2025.pdf"'));
});
test('equation blocks and image exclusion survive article rendering',()=>{
  assert.equal((html.match(/<pre>/g)||[]).length,2);
  assert.ok(!/<img|Screen-Shot|attachments\//i.test(html));
});
test('downloaded article equals canonical Markdown',()=>{
  assert.equal(readFileSync(new URL('../web/article.md',import.meta.url),'utf8'),readFileSync(new URL('../docs/ANALYSIS.md',import.meta.url),'utf8'));
});
