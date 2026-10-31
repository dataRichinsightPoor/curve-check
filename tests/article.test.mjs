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
test('original figures and accessible equations render without the uploaded image',()=>{
  assert.equal((html.match(/<figure>/g)||[]).length,3);
  assert.equal((html.match(/class="math-block"/g)||[]).length,7);
  assert.ok(html.includes('<math'));
  assert.ok(!/Screen-Shot|attachments\/|katex-error/i.test(html));
  assert.equal((html.match(/<img src="figures\/[a-z-]+\.svg"/g)||[]).length,3);
  assert.ok(html.includes('References and reading notes'));
  assert.ok(!html.includes('\\['));
});
test('downloaded article equals canonical Markdown',()=>{
  assert.equal(readFileSync(new URL('../web/article.md',import.meta.url),'utf8'),readFileSync(new URL('../docs/ANALYSIS.md',import.meta.url),'utf8'));
});
