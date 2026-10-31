import test from 'node:test';
import assert from 'node:assert/strict';
import {response,relativeInformation,endpoints} from '../web/article-model.js';
test('interactive article defaults reproduce the analytical benchmark',()=>{
 assert.equal(relativeInformation(100,20),1);
 assert.ok(Math.abs(relativeInformation(20,20)-.04)<1e-12);
 assert.ok(Math.abs(relativeInformation(20,1)-16)<1e-12);
 assert.equal(relativeInformation(0,20),0);
});
test('flat model has no midpoint and partial response never crosses absolute half',()=>{
 assert.equal(response(1,0),100);
 assert.equal(endpoints(0).midpointResponse,null);
 assert.equal(endpoints(20).midpointResponse,90);
 assert.equal(endpoints(50).absoluteIC50,null);
 assert.equal(endpoints(100).absoluteIC50,10);
 for(const a of [51,60,80,100])assert.ok(Math.abs(response(endpoints(a).absoluteIC50,a)-50)<1e-10);
});
test('invalid information inputs are rejected',()=>{
 for(const [a,s] of [[-1,20],[101,20],[20,0],[20,NaN]])assert.throws(()=>relativeInformation(a,s));
});
