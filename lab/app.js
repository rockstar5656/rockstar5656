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

function inputFromForm() { return Object.fromEntries(new FormData(form)); }
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
execute(inputFromForm()).catch(()=>{});

// ─────────────────────────────────────────────────────────────────────────────
// Local AI Copilot — browser-only, no application server.
// The first chat message dynamically loads Transformers.js + SmolLM2. The
// portfolio context below is deliberately curated so the model has evidence
// rather than pretending it knows private or unverified achievements.
// ─────────────────────────────────────────────────────────────────────────────
const chatLog = document.querySelector('#chat-log');
const chatForm = document.querySelector('#chat-form');
const chatText = document.querySelector('#chat-text');
const chatSend = document.querySelector('#chat-send');
const aiStatus = document.querySelector('#ai-status');
const modelLoad = document.querySelector('#model-load');
const clearChat = document.querySelector('#clear-chat');
const MODEL_ID = 'HuggingFaceTB/SmolLM2-360M-Instruct';
const CHAT_KEY = 'vidit-lab-chat-v1';
const portfolioContext = `You are the local AI Copilot for Vidit Shah's public engineering portfolio. Be warm, concise, technically sharp, and honest. Never invent achievements, employers, metrics, repositories, publications, or robotics hardware. If the evidence is not in this context, say you do not know.

IDENTITY: Vidit Shah. Engineering focus presented in this lab: robotics, AI, automation, computer vision, Python systems, API integration, and software engineering.

PUBLIC LAB: An interactive browser workbench demonstrates request validation, protocol translation, local HMAC-SHA256 signing, and explicitly simulated accepted/rejected/timeout outcomes. It is educational and places no orders. The source is public in github.com/rockstar5656/rockstar5656/lab.

PUBLIC SYSTEM 001: binance-futures-trading-bot is a Python CLI for Binance USDT-M Futures Testnet. The documented architecture separates validation, order translation, REST transport/signing, and tests. A key engineering decision is that a timeout does not prove rejection; client observation and remote state are different.

CURRENT PRIVATE/CONNECTED PROJECT SIGNALS: The linked GitHub account contains private projects named AarnaAI-v1.0, AarnaAI-v2.0, AarnaAI-Files, MeeraAI-Installer, MeeraAI---The-Ultimate-Personal-AI-Assistant, Profolio, and gemini-web2api. Do not describe their implementation details because their source is not public in this lab.

INTERACTIVE DESIGN: The portfolio intentionally lets visitors ask questions, inspect evidence, run a simulation, export a trace, and read engineering decisions. The AI Copilot itself is designed to run in the browser with a compact open model and no chat backend.

When discussing what would improve the portfolio, distinguish between what exists and what is proposed. Prefer concrete engineering suggestions over generic career advice.`;

let generator = null;
let loadingPromise = null;
let conversation = [];

function escapeText(text) { return text; }
function addMessage(role, text, streaming=false) {
  const wrap = document.createElement('div'); wrap.className = `chat-msg ${role}`;
  const avatar = document.createElement('div'); avatar.className = 'avatar'; avatar.textContent = role === 'bot' ? '🤖' : '👤';
  const body = document.createElement('div');
  const speaker = document.createElement('span'); speaker.className = 'speaker'; speaker.textContent = role === 'bot' ? 'LAB COPILOT' : 'YOU';
  const p = document.createElement('p'); p.textContent = escapeText(text);
  if (streaming) p.classList.add('typing');
  body.append(speaker,p); wrap.append(avatar,body); chatLog.append(wrap); chatLog.scrollTop = chatLog.scrollHeight;
  return p;
}

function setStatus(text, state='idle') {
  aiStatus.textContent = text;
  aiStatus.dataset.state = state;
}

async function loadModel() {
  if (generator) return generator;
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    setStatus('LOADING MODEL', 'loading');
    modelLoad.textContent = 'Downloading the compact model for local inference…';
    const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2');
    env.allowLocalModels = false;
    env.useBrowserCache = true;
    const device = 'webgpu' in navigator ? 'webgpu' : 'wasm';
    generator = await pipeline('text-generation', MODEL_ID, { device, dtype: device === 'webgpu' ? 'q4f16' : 'q8' });
    setStatus(device === 'webgpu' ? 'LOCAL / WEBGPU' : 'LOCAL / WASM', 'ready');
    modelLoad.textContent = `Model ready · ${device === 'webgpu' ? 'GPU accelerated' : 'CPU/WASM fallback'} · cached by the browser.`;
    return generator;
  })().catch(error => {
    loadingPromise = null; generator = null; setStatus('LOAD FAILED', 'error');
    modelLoad.textContent = 'Model could not load. Check the browser console/network connection and try again.';
    throw error;
  });
  return loadingPromise;
}

function buildPrompt() {
  const recent = conversation.slice(-6).map(item => `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.content}`).join('\n');
  return `<|system|>\n${portfolioContext}\n<|end|>\n<|user|>\n${recent}\n<|end|>\n<|assistant|>\n`;
}

async function askLocalModel(userMessage, target) {
  const model = await loadModel();
  conversation.push({role:'user', content:userMessage});
  const prompt = buildPrompt();
  const result = await model(prompt, {max_new_tokens:220, temperature:0.65, top_p:0.9, do_sample:true, return_full_text:false});
  let answer = result?.[0]?.generated_text ?? '';
  answer = answer.replace(/<\|end\|>[\s\S]*$/,'').trim();
  if (!answer) answer = 'I could not produce an answer this time. Try a more specific question.';
  target.textContent = answer;
  target.classList.remove('typing');
  conversation.push({role:'assistant', content:answer});
  localStorage.setItem(CHAT_KEY, JSON.stringify(conversation.slice(-12)));
}

function restoreChat() {
  try {
    const saved = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]');
    if (!Array.isArray(saved)) return;
    conversation = saved.slice(-12);
    for (const item of conversation) addMessage(item.role === 'assistant' ? 'bot' : 'user', item.content);
  } catch { conversation = []; }
}

async function submitChat(message) {
  if (!message || chatSend.disabled) return;
  chatText.value = '';
  chatText.style.height = 'auto';
  chatSend.disabled = true;
  const user = addMessage('user', message);
  const target = addMessage('bot', 'Thinking locally…', true);
  try { await askLocalModel(message, target); }
  catch (error) { target.textContent = `I couldn't start the local model. ${error.message || 'Please try again.'}`; target.classList.remove('typing'); }
  finally { chatSend.disabled = false; chatText.focus(); }
}

chatForm.addEventListener('submit', event => { event.preventDefault(); submitChat(chatText.value.trim()); });
chatText.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); chatForm.requestSubmit(); } });
chatText.addEventListener('input', () => { chatText.style.height = 'auto'; chatText.style.height = `${Math.min(chatText.scrollHeight,140)}px`; });
document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => submitChat(button.dataset.prompt)));
clearChat.addEventListener('click', () => { conversation=[]; localStorage.removeItem(CHAT_KEY); chatLog.replaceChildren(); addMessage('bot','Memory cleared. 👋 Ask me anything about the public lab or what you want to build next.'); });
restoreChat();
