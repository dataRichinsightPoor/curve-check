import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const y=(x,B,A,m,h)=>B+A/(1+(x/10**m)**h);
const derivative=(x,A,m,h)=>{const q=(x/10**m)**h;return Math.log(10)*A*h*q/(1+q)**2;};
test('article midpoint derivative agrees with central differences',()=>{
 for(const A of [0,20,100])for(const h of [.3,1,3])for(const x of [.01,1,10,100,10000]){
  const epsilon=1e-5,d=(y(x,80,A,1+epsilon,h)-y(x,80,A,1-epsilon,h))/(2*epsilon);
  assert.ok(Math.abs(d-derivative(x,A,1,h))<2e-7);
 }
});
test('known-nuisance Gaussian information has amplitude-squared scaling and affine invariance',()=>{
 const xs=Array.from({length:13},(_,i)=>10**(-2+i/2));
 const info=(A,sd,b=1)=>xs.reduce((s,x)=>s+(b*derivative(x,A,1,1))**2/(b*sd)**2,0);
 assert.ok(Math.abs(info(20,20)/info(100,20)-.04)<1e-12);
 assert.ok(Math.abs(info(20,20,5)-info(20,20))<1e-12);
 assert.equal(info(0,20),0);
});
test('article absolute threshold algebra distinguishes partial and complete response',()=>{
 assert.equal(y(10,80,20,1,1),90);
 assert.equal(y(10,0,100,1,1),50);
 for(const B of [0,10,30])for(const T of [90,100,120])for(const h of [.5,1,2]){
  const absolute=10*((T-50)/(50-B))**(1/h);
  assert.ok(Math.abs(y(absolute,B,T-B,1,h)-50)<1e-10);
 }
});
test('generated original figures preserve recorded numerical example',()=>{
 const fixtures=JSON.parse(readFileSync(new URL('../results/article-fixtures.json',import.meta.url),'utf8'));
 assert.equal(fixtures.length,3);
 assert.ok(Math.abs(fixtures[0].range-49.7785)<.0001);
 assert.ok(Math.abs(fixtures[0].deltaAicc-3.26427)<.0001);
 assert.equal(fixtures[0].boundary,true);
 assert.equal(fixtures[1].boundary,false);
 assert.equal(fixtures[2].effect,0);
 for(const name of ['weak-response','relative-absolute','information']){
  const svg=readFileSync(new URL(`../docs/figures/${name}.svg`,import.meta.url),'utf8');
  assert.ok(!/NaN|Infinity|Screen-Shot|<image|<script/.test(svg));
 }
});
