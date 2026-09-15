import {trace} from './core.mjs';
const form = document.querySelector('#request-form');
const output = document.querySelector('#output');
const run = document.querySelector('#run');
const exportButton = document.querySelector('#export');
let lastTrace = null;
let busy = false;
function syncFields() {
  const type = form.elements.type.value;
  form.elements.price.disabled = type === 'MARKET';
  form.elements.stopPrice.disabled = type !== 'STOP_LIMIT';
  form.elements.tif.disabled = type === 'MARKET';
}
form.elements.type.addEventListener('change', () => {
  if (form.elements.type.value === 'MARKET') form.elements.price.value = '';
  else if (!form.elements.price.value) form.elements.price.value = '65000';
  syncFields();
});
function render(result) {
  output.replaceChildren();
  document.querySelectorAll('[data-stage]').forEach(node => node.classList.remove('done','failed'));
  for (const step of result.steps) {
    const section = document.createElement('div'); section.className = 'trace-step';
    const heading = document.createElement('h3'); heading.textContent = step.title;
    const pre = document.createElement('pre'); pre.textContent = typeof step.data === 'string' ? step.data : JSON.stringify(step.data,null,2);
    section.append(heading,pre); output.append(section);
    document.querySelector(`[data-stage="${step.stage}"]`)?.classList.add(result.outcome === 'invalid' ? 'failed' : 'done');
  }
  const box = document.createElement('div');
  box.className = 'outcome' + (['invalid','rejected','error'].includes(result.outcome) ? ' error' : result.outcome === 'timeout' ? ' unknown' : '');
  const title = document.createElement('b'); title.textContent = {accepted:'ACKNOWLEDGED / SIMULATED',rejected:'REJECTED / SIMULATED',timeout:'OUTCOME UNKNOWN / SIMULATED',invalid:'BLOCKED BEFORE TRANSPORT',error:'BROWSER PROCESSING ERROR'}[result.outcome];
  const explanation = document.createElement('p'); explanation.textContent = result.explanation;
  box.append(title,explanation); output.append(box);
  document.querySelector('#trace-status').textContent = result.outcome.toUpperCase();
}
async function execute(input) {
  if (busy) throw new Error('A trace is already running.');
  busy = true; run.disabled = true; exportButton.disabled = true;
  const started = performance.now();
  try {
    const result = await trace(input);
    const elapsed = performance.now()-started;
    lastTrace = {...result, browserProcessingMs:Number(elapsed.toFixed(3)), measuredAt:new Date().toISOString()};
    render(result);
    document.querySelector('#duration').textContent = `${elapsed.toFixed(2)} MS / BROWSER PROCESSING ONLY`;
    exportButton.disabled = false;
    return lastTrace;
  } catch(error) {
    lastTrace = null;
    render({steps:[],outcome:'error',explanation:error.message});
    document.querySelector('#duration').textContent = 'TRACE NOT COMPLETED';
    throw error;
  } finally { busy = false; run.disabled = false; }
}
function inputFromForm() {
  return Object.fromEntries(new FormData(form));
}
form.addEventListener('submit', event => {event.preventDefault();execute(inputFromForm()).catch(()=>{});});
document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
  if (busy) return;
  const preset = button.dataset.preset;
  form.elements.symbol.value = 'BTCUSDT'; form.elements.side.value = 'BUY'; form.elements.quantity.value = preset === 'invalid' ? '-1' : '0.01';
  form.elements.type.value = preset === 'stop' ? 'STOP_LIMIT' : 'LIMIT'; form.elements.price.value = '65000'; form.elements.stopPrice.value = preset === 'stop' ? '64500' : ''; form.elements.tif.value = 'GTC'; form.elements.scenario.value = preset === 'timeout' ? 'timeout' : 'accepted';
  syncFields(); execute(inputFromForm()).catch(()=>{});
}));
exportButton.addEventListener('click', () => {
  if (!lastTrace) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(lastTrace,null,2)+'\n'],{type:'application/json'}));
  const link = document.createElement('a'); link.href=url;link.download=`vidit-lab-${lastTrace.outcome}-trace.json`;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});
syncFields();
// Optional proposed WebMCP API. The visible form and tool share the same execution path.
const context = document.modelContext;
if (context?.registerTool) {
  const lifecycle = new AbortController();
  const inputSchema = {type:'object', properties:{symbol:{type:'string'},side:{type:'string',enum:['BUY','SELL']},type:{type:'string',enum:['MARKET','LIMIT','STOP_LIMIT']},quantity:{type:'string'},price:{type:'string'},stopPrice:{type:'string'},tif:{type:'string',enum:['GTC','IOC','FOK']},scenario:{type:'string',enum:['accepted','rejected','timeout']}},required:['symbol','side','type','quantity','scenario'],additionalProperties:false};
  try {
    Promise.resolve(context.registerTool({name:'run_simulated_request_trace',title:'Run request lab simulation',description:'Configure the visible request workbench and run local validation, translation, HMAC signing and a selected simulated outcome. Places no orders.',inputSchema,annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async input=>{
      if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Expected request configuration.');
      for (const key of Object.keys(input)) {
        if (!Object.hasOwn(inputSchema.properties,key) || typeof input[key] !== 'string') throw new Error('Unexpected field or field type.');
        const allowed = inputSchema.properties[key].enum;
        if (allowed && !allowed.includes(input[key])) throw new Error(`Unsupported ${key}.`);
      }
      for (const key of inputSchema.required) if (!Object.hasOwn(input,key)) throw new Error(`Missing ${key}.`);
      if (busy) throw new Error('A trace is already running.');
      for (const key of Object.keys(inputSchema.properties)) form.elements[key].value = input[key] ?? (key === 'tif' ? 'GTC' : '');
      syncFields();
      return execute(input);
    }},{signal:lifecycle.signal})).catch(()=>{});
  } catch { /* Unsupported draft API does not affect the workbench. */ }
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
execute(inputFromForm()).catch(()=>{});
