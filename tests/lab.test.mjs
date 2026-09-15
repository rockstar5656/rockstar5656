import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {trace, validate, translate, signQuery, DEMO_KEY} from '../lab/core.mjs';
const request = {symbol:'btcusdt',side:'BUY',type:'LIMIT',quantity:'0.010000000000000000001',price:'65000',tif:'GTC',scenario:'accepted'};
test('signing matches an independent HMAC implementation and RFC 4231 vector', async()=>{
  assert.equal(await signQuery('Hi There','\x0b'.repeat(20)), 'b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7');
  const result=await trace(request);const signed=result.steps.find(s=>s.stage==='sign').data;
  assert.equal(signed.signature,createHmac('sha256',DEMO_KEY).update(signed.query).digest('hex'));
});
test('normalization preserves decimal precision without floating point',()=>{
  const order=validate(request);assert.equal(order.symbol,'BTCUSDT');assert.equal(translate(order).quantity,request.quantity);
});
test('stop-limit maps STOP and both prices; market omits price and timeInForce',()=>{
  const stop=translate(validate({...request,type:'STOP_LIMIT',stopPrice:'64500'}));assert.equal(stop.type,'STOP');assert.equal(stop.stopPrice,'64500');assert.equal(stop.price,'65000');
  const market=translate(validate({...request,type:'MARKET',price:''}));assert.equal(market.type,'MARKET');assert.ok(!Object.hasOwn(market,'price'));assert.ok(!Object.hasOwn(market,'timeInForce'));
});
test('invalid input stops before signing, including non-finite and zero quantities',async()=>{
  for(const quantity of ['-1','0','0.000','NaN','Infinity','1e100','<script>']){
    const result=await trace({...request,quantity});assert.equal(result.outcome,'invalid');assert.equal(result.steps.length,1);
  }
  assert.throws(()=>validate({...request,type:'MARKET'}));
  assert.throws(()=>validate({...request,type:'STOP_LIMIT',stopPrice:''}));
});
test('lost response preserves unknown outcome rather than claiming rejection',async()=>{
  const timeout=await trace({...request,scenario:'timeout'});assert.equal(timeout.outcome,'timeout');assert.equal(timeout.steps.at(-1).data.serverOutcome,'unknown');
  const rejected=await trace({...request,scenario:'rejected'});assert.equal(rejected.outcome,'rejected');assert.equal(rejected.steps.at(-1).data.code,-2019);
  const accepted=await trace(request);assert.equal(accepted.steps.at(-1).data.status,'NEW');assert.ok(accepted.simulation);
});
test('unexpected scenario fails intentionally',async()=>{await assert.rejects(trace({...request,scenario:'real'}),/Unknown/);});
