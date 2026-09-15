// Educational adaptation, not a live exchange client. Decimal strings never pass through floating point.
export const DEMO_KEY = 'vidit-lab-public-demonstration-key';
export const DEMO_TIMESTAMP = '1700000000000';
export const SOURCE_REVISION = 'd7656c42b14aaec7326cc19d8f3d5fa2280389f1';
export function decimal(value, field) {
  const text = String(value ?? '').trim();
  if (text.length > 80 || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text) || !/[1-9]/.test(text)) {
    throw new Error(`${field} must be a positive decimal string (up to 80 characters; exponent notation is outside this demo).`);
  }
  return text;
}
export function validate(input) {
  const symbol = String(input.symbol ?? '').trim().toUpperCase();
  const side = String(input.side ?? '').trim().toUpperCase();
  const type = String(input.type ?? '').trim().toUpperCase();
  const tif = String(input.tif ?? 'GTC').trim().toUpperCase();
  if (!/^[A-Z0-9]{5,20}$/.test(symbol)) throw new Error('Symbol must contain 5–20 alphanumeric characters.');
  if (!['BUY', 'SELL'].includes(side)) throw new Error('Side must be BUY or SELL.');
  if (!['MARKET', 'LIMIT', 'STOP_LIMIT'].includes(type)) throw new Error('Unsupported order type.');
  if (!['GTC', 'IOC', 'FOK'].includes(tif)) throw new Error('Time in force must be GTC, IOC, or FOK.');
  const quantity = decimal(input.quantity, 'Quantity');
  const priceText = String(input.price ?? '').trim();
  if (type === 'MARKET' && priceText) throw new Error('MARKET orders must not supply a limit price.');
  const price = type === 'MARKET' ? null : decimal(priceText, 'Price');
  const stopPrice = type === 'STOP_LIMIT' ? decimal(input.stopPrice, 'Stop price') : null;
  return {symbol, side, type, quantity, price, stopPrice, tif};
}
export function translate(order) {
  const params = {symbol: order.symbol, side: order.side, type: order.type === 'STOP_LIMIT' ? 'STOP' : order.type, quantity: order.quantity};
  if (order.type !== 'MARKET') {
    params.price = order.price;
    if (order.type === 'STOP_LIMIT') params.stopPrice = order.stopPrice;
    params.timeInForce = order.tif;
  }
  return params;
}
export async function signQuery(query, key = DEMO_KEY) {
  if (!globalThis.crypto?.subtle) throw new Error('Browser signing requires HTTPS or localhost with Web Crypto support.');
  const bytes = new TextEncoder();
  const imported = await crypto.subtle.importKey('raw', bytes.encode(key), {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
  const signed = await crypto.subtle.sign('HMAC', imported, bytes.encode(query));
  return Array.from(new Uint8Array(signed), b => b.toString(16).padStart(2, '0')).join('');
}
export async function trace(input) {
  const scenario = input.scenario ?? 'accepted';
  if (!['accepted', 'rejected', 'timeout'].includes(scenario)) throw new Error('Unknown simulation scenario.');
  const steps = [];
  let order;
  try {
    order = validate(input);
  } catch (error) {
    return {simulation:true, sourceRevision:SOURCE_REVISION, steps:[{stage:'validate', title:'Validation blocked the request', data:error.message}], outcome:'invalid', explanation:'The input failed before translation or signing. No simulated server interaction occurred.'};
  }
  steps.push({stage:'validate', title:'Input normalized / decimal strings preserved', data:order});
  const params = translate(order);
  steps.push({stage:'translate', title:'Exchange parameters constructed', data:params});
  const query = new URLSearchParams({...params, timestamp:DEMO_TIMESTAMP, recvWindow:'5000'}).toString();
  const signature = await signQuery(query);
  steps.push({stage:'sign', title:'Real HMAC-SHA256 / demonstration key', data:{query, demonstrationKey:DEMO_KEY, signature, timestampNote:'Fixed historical timestamp for reproducibility. This request is not sent and is not valid for live execution.'}});
  const states = {
    accepted:{title:'SIMULATED RESPONSE / ACCEPTED', data:{simulation:true, status:'NEW', orderId:'SIMULATION-001'}, explanation:'The selected simulated server acknowledged the request. NEW means accepted; it does not prove a fill.'},
    rejected:{title:'SIMULATED RESPONSE / REJECTED', data:{simulation:true, code:-2019, message:'Margin is insufficient'}, explanation:'An explicit simulated rejection gives a known unsuccessful outcome. This is not a response from an exchange.'},
    timeout:{title:'SIMULATED RESPONSE / LOST', data:{simulation:true, clientObservation:'Timeout', serverOutcome:'unknown'}, explanation:'The client received no response. The server could have accepted or rejected the request. An automatic retry could duplicate a write; reconcile before retrying.'}
  };
  const state = states[scenario];
  steps.push({stage:'resolve', title:state.title, data:state.data});
  return {simulation:true, sourceRevision:SOURCE_REVISION, steps, outcome:scenario, explanation:state.explanation};
}
