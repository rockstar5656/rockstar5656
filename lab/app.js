import {trace} from './core.mjs';

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM 001 / REQUEST WORKBENCH
// ─────────────────────────────────────────────────────────────────────────────
const form = document.querySelector('#request-form');
const output = document.querySelector('#output');
const run = document.querySelector('#run');
const exportButton = document.querySelector('#export');
let lastTrace = null;
let busy = false;

function syncFields(){
  const type=form.elements.type.value;
  form.elements.price.disabled=type==='MARKET';
  form.elements.stopPrice.disabled=type!=='STOP_LIMIT';
  form.elements.tif.disabled=type==='MARKET';
}
form.elements.type.addEventListener('change',()=>{if(form.elements.type.value==='MARKET')form.elements.price.value='';else if(!form.elements.price.value)form.elements.price.value='65000';syncFields()});
function render(result){
  output.replaceChildren();
  document.querySelectorAll('[data-stage]').forEach(node=>node.classList.remove('done','failed'));
  for(const step of result.steps){
    const section=document.createElement('div');section.className='trace-step';
    const heading=document.createElement('h3');heading.textContent=step.title;
    const pre=document.createElement('pre');pre.textContent=typeof step.data==='string'?step.data:JSON.stringify(step.data,null,2);
    section.append(heading,pre);output.append(section);
    document.querySelector(`[data-stage="${step.stage}"]`)?.classList.add(result.outcome==='invalid'?'failed':'done');
  }
  const box=document.createElement('div');
  box.className='outcome'+(['invalid','rejected','error'].includes(result.outcome)?' error':result.outcome==='timeout'?' unknown':'');
  const title=document.createElement('b');title.textContent={accepted:'ACKNOWLEDGED / SIMULATED',rejected:'REJECTED / SIMULATED',timeout:'OUTCOME UNKNOWN / SIMULATED',invalid:'BLOCKED BEFORE TRANSPORT',error:'BROWSER PROCESSING ERROR'}[result.outcome];
  const explanation=document.createElement('p');explanation.textContent=result.explanation;
  box.append(title,explanation);output.append(box);
  document.querySelector('#trace-status').textContent=result.outcome.toUpperCase();
}
async function execute(input){
  if(busy)throw new Error('A trace is already running.');
  busy=true;run.disabled=true;exportButton.disabled=true;
  const started=performance.now();
  try{const result=await trace(input);const elapsed=performance.now()-started;lastTrace={...result,browserProcessingMs:Number(elapsed.toFixed(3)),measuredAt:new Date().toISOString()};render(result);document.querySelector('#duration').textContent=`${elapsed.toFixed(2)} MS / BROWSER PROCESSING ONLY`;exportButton.disabled=false;return lastTrace}
  catch(error){lastTrace=null;render({steps:[],outcome:'error',explanation:error.message});document.querySelector('#duration').textContent='TRACE NOT COMPLETED';throw error}
  finally{busy=false;run.disabled=false}
}
function inputFromForm(){return Object.fromEntries(new FormData(form))}
form.addEventListener('submit',e=>{e.preventDefault();execute(inputFromForm()).catch(()=>{})});
document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{
  if(busy)return;const preset=button.dataset.preset;
  form.elements.symbol.value='BTCUSDT';form.elements.side.value='BUY';form.elements.quantity.value=preset==='invalid'?'-1':'0.01';form.elements.type.value=preset==='stop'?'STOP_LIMIT':'LIMIT';form.elements.price.value='65000';form.elements.stopPrice.value=preset==='stop'?'64500':'';form.elements.tif.value='GTC';form.elements.scenario.value=preset==='timeout'?'timeout':'accepted';syncFields();execute(inputFromForm()).catch(()=>{})
}));
exportButton.addEventListener('click',()=>{if(!lastTrace)return;const url=URL.createObjectURL(new Blob([JSON.stringify(lastTrace,null,2)+'\n'],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=`vidit-lab-${lastTrace.outcome}-trace.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
syncFields();execute(inputFromForm()).catch(()=>{});

// ─────────────────────────────────────────────────────────────────────────────
// ON-PAGE LOCAL AI COPILOT
// Transformers.js runs the compact model in the visitor's browser. The UI is
// deliberately a small floating surface rather than a separate destination.
// ─────────────────────────────────────────────────────────────────────────────
const copilot=document.querySelector('#floating-copilot');
const launch=document.querySelector('#copilot-launch');
const closeCopilot=document.querySelector('#copilot-close');
const chatLog=document.querySelector('#chat-log');
const chatForm=document.querySelector('#chat-form');
const chatText=document.querySelector('#chat-text');
const chatSend=document.querySelector('#chat-send');
const aiStatus=document.querySelector('#ai-status');
const modelLoad=document.querySelector('#model-load');
const clearChat=document.querySelector('#clear-chat');
const MODEL_ID='HuggingFaceTB/SmolLM2-360M-Instruct';
const CHAT_KEY='vidit-lab-chat-v2';
const portfolioContext=`You are the on-page AI Copilot for Vidit Shah's public engineering lab. Be warm, concise, technically sharp, and honest. Never invent employers, awards, metrics, hardware, publications, projects, or implementation details. When evidence is unavailable, say so clearly. Distinguish shipped/public work from proposed future work.

PUBLIC IDENTITY: Vidit Shah. The lab presents an engineering direction spanning robotics, AI, automation, computer vision, Python systems, API integration, and software engineering.

PUBLIC SYSTEM: The browser lab is an educational adaptation of a Python Binance Futures Testnet CLI. It demonstrates validation, protocol translation, local HMAC-SHA256 signing, and explicitly simulated accepted/rejected/timeout outcomes. It places no orders and uses no account connection.

PUBLIC ENGINEERING IDEAS: A timeout does not prove rejection. User-facing concepts should be translated at a clear protocol boundary. Claims are strongest when they map to source, tests, or explicit limitations.

CONNECTED PRIVATE REPOSITORIES: The GitHub account contains private projects including AarnaAI-v1.0, AarnaAI-v2.0, AarnaAI-Files, MeeraAI-Installer, MeeraAI---The-Ultimate-Personal-AI-Assistant, Profolio, and gemini-web2api. Their private internals must not be disclosed or guessed.

INTERACTION: Visitors can run the request simulation, inspect evidence, read engineering decisions, ask this model questions, and run a guided 60-second presentation.`;
let generator=null;
let loadingPromise=null;
let conversation=[];

function addMessage(role,text,typing=false){
  const wrap=document.createElement('div');wrap.className=`chat-msg ${role}`;
  const avatar=document.createElement('div');avatar.className='avatar';avatar.textContent=role==='bot'?'🤖':'👤';
  const body=document.createElement('div');const speaker=document.createElement('span');speaker.className='speaker';speaker.textContent=role==='bot'?'LAB COPILOT':'YOU';
  const p=document.createElement('p');p.textContent=text;if(typing)p.classList.add('typing');body.append(speaker,p);wrap.append(avatar,body);chatLog.append(wrap);chatLog.scrollTop=chatLog.scrollHeight;return p;
}
function setStatus(text,state='idle'){aiStatus.textContent=text;aiStatus.dataset.state=state}
async function loadModel(){
  if(generator)return generator;if(loadingPromise)return loadingPromise;
  loadingPromise=(async()=>{
    setStatus('LOADING','loading');modelLoad.textContent='loading compact model…';
    const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.1');
    env.allowLocalModels=false;env.useBrowserCache=true;
    const device='webgpu' in navigator?'webgpu':'wasm';
    generator=await pipeline('text-generation',MODEL_ID,{device,dtype:device==='webgpu'?'q4':'q8'});
    setStatus(device==='webgpu'?'LOCAL / WEBGPU':'LOCAL / WASM','ready');modelLoad.textContent=`${device==='webgpu'?'GPU':'CPU/WASM'} · cached locally`;
    return generator;
  })().catch(error=>{loadingPromise=null;generator=null;setStatus('ERROR','error');modelLoad.textContent='model failed to load · try again';throw error});
  return loadingPromise;
}
function buildMessages(userMessage){
  const recent=conversation.slice(-6).map(item=>({role:item.role==='assistant'?'assistant':'user',content:item.content}));
  return [{role:'system',content:portfolioContext},...recent,{role:'user',content:userMessage}];
}
async function askLocalModel(userMessage,target){
  const model=await loadModel();
  const messages=buildMessages(userMessage);
  const result=await model(messages,{max_new_tokens:190,temperature:.65,top_p:.9,do_sample:true});
  let answer='';
  const generated=result?.[0]?.generated_text;
  if(Array.isArray(generated))answer=generated.at(-1)?.content||'';else if(typeof generated==='string')answer=generated;
  answer=answer.replace(/<\|end\|>[\s\S]*$/,'').trim();
  if(!answer)answer='I could not produce an answer this time. Try a more specific engineering question.';
  target.textContent=answer;target.classList.remove('typing');conversation.push({role:'user',content:userMessage},{role:'assistant',content:answer});localStorage.setItem(CHAT_KEY,JSON.stringify(conversation.slice(-10)));chatLog.scrollTop=chatLog.scrollHeight;
}
function restoreChat(){try{const saved=JSON.parse(localStorage.getItem(CHAT_KEY)||'[]');if(!Array.isArray(saved))return;conversation=saved.slice(-10);for(const item of conversation)addMessage(item.role==='assistant'?'bot':'user',item.content)}catch{conversation=[]}}
async function submitChat(message){
  if(!message||chatSend.disabled)return;chatText.value='';chatText.style.height='auto';chatSend.disabled=true;addMessage('user',message);const target=addMessage('bot','Thinking locally…',true);
  try{await askLocalModel(message,target)}catch(error){target.textContent=`Local model unavailable. ${error.message||'Please retry.'}`;target.classList.remove('typing')}finally{chatSend.disabled=false;chatText.focus()}
}
function openCopilot(){copilot.classList.add('open');launch?.setAttribute('aria-expanded','true');setTimeout(()=>chatText.focus(),100)}
function closeCopilotNow(){copilot.classList.remove('open');launch?.setAttribute('aria-expanded','false')}
launch.addEventListener('click',openCopilot);closeCopilot.addEventListener('click',closeCopilotNow);
document.querySelector('#hero-copilot').addEventListener('click',openCopilot);
chatForm.addEventListener('submit',e=>{e.preventDefault();submitChat(chatText.value.trim())});
chatText.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();chatForm.requestSubmit()}});
chatText.addEventListener('input',()=>{chatText.style.height='auto';chatText.style.height=`${Math.min(chatText.scrollHeight,110)}px`});
document.querySelectorAll('[data-prompt]').forEach(button=>button.addEventListener('click',()=>submitChat(button.dataset.prompt)));
clearChat.addEventListener('click',()=>{conversation=[];localStorage.removeItem(CHAT_KEY);chatLog.replaceChildren();addMessage('bot','Memory cleared. 👋 Ask me anything about the public lab.')});
restoreChat();

// ─────────────────────────────────────────────────────────────────────────────
// AUTOMATED 60-SECOND PRESENTATION
// ─────────────────────────────────────────────────────────────────────────────
const tourOverlay=document.querySelector('#tour-overlay');
const tourKicker=document.querySelector('#tour-kicker');
const tourTitle=document.querySelector('#tour-title');
const tourText=document.querySelector('#tour-text');
const tourCounter=document.querySelector('#tour-counter');
const tourTimer=document.querySelector('#tour-timer');
const tourBar=document.querySelector('#tour-progress-bar');
const tourVisual=document.querySelector('#tour-visual');
const tourVoice=document.querySelector('#tour-voice');
const tourSlides=[
  {k:'01 / THE PREMISE',title:'A portfolio you can interrogate.',text:'Not a wall of claims. A small engineering environment where the visitor can ask, run, break and inspect.',visual:'core'},
  {k:'02 / INTERACTION',title:'The interface is part of the proof.',text:'The lab exposes state and failure paths instead of hiding everything behind a polished screenshot.',visual:'orbit'},
  {k:'03 / AI',title:'A tiny model lives inside the page.',text:'The floating copilot uses a compact language model in the browser, so the interaction feels like part of the system rather than another destination.',visual:'ai'},
  {k:'04 / EVIDENCE',title:'Claims terminate in evidence.',text:'Validation, translation, transport and tests are connected to the public implementation, with limitations called out explicitly.',visual:'proof'},
  {k:'05 / NEXT',title:'The portfolio becomes a living lab.',text:'The same foundation can grow into robotics simulations, visual benchmarks, experiment timelines and richer local AI interaction.',visual:'future'}
];
let slideIndex=0;let slideDeadline=0;let tourPlaying=false;let tourTick=null;let voiceOn=false;
function paintVisual(kind){
  tourVisual.dataset.kind=kind;
  tourVisual.innerHTML=`<div class="tour-orbit-core"></div><div class="tour-orbit-1"></div><div class="tour-orbit-2"></div><div class="tour-grid-points"></div><span class="tour-code">${kind.toUpperCase()} // SIGNAL</span>`;
}
function speakSlide(){if(!voiceOn||!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const s=tourSlides[slideIndex];const u=new SpeechSynthesisUtterance(`${s.title}. ${s.text}`);u.rate=.96;u.pitch=1;window.speechSynthesis.speak(u)}
function showSlide(index){slideIndex=(index+tourSlides.length)%tourSlides.length;const s=tourSlides[slideIndex];tourKicker.textContent=s.k;tourTitle.textContent=s.title;tourText.textContent=s.text;tourCounter.textContent=`${String(slideIndex+1).padStart(2,'0')} / ${String(tourSlides.length).padStart(2,'0')}`;tourVisual.dataset.kind=s.visual;paintVisual(s.visual);slideDeadline=performance.now()+12000;speakSlide()}
function startTour(){tourOverlay.classList.add('open');tourOverlay.setAttribute('aria-hidden','false');slideIndex=0;tourPlaying=true;document.querySelector('#tour-play').textContent='PAUSE';showSlide(0);clearInterval(tourTick);tourTick=setInterval(()=>{if(!tourPlaying)return;if(performance.now()>=slideDeadline){if(slideIndex<tourSlides.length-1)showSlide(slideIndex+1);else{tourPlaying=false;document.querySelector('#tour-play').textContent='REPLAY';}}const total=12000;const remain=Math.max(0,slideDeadline-performance.now());tourBar.style.width=`${Math.min(100,100-(remain/total*100))}%`;tourTimer.textContent=`${Math.ceil(remain/1000)}s`},100)}
function closeTour(){tourPlaying=false;clearInterval(tourTick);window.speechSynthesis?.cancel();tourOverlay.classList.remove('open');tourOverlay.setAttribute('aria-hidden','true')}
document.querySelector('#tour-trigger').addEventListener('click',startTour);document.querySelector('#hero-tour').addEventListener('click',startTour);document.querySelector('#tour-close').addEventListener('click',closeTour);
document.querySelector('#tour-prev').addEventListener('click',()=>{tourPlaying=false;document.querySelector('#tour-play').textContent='PLAY';showSlide(slideIndex-1)});
document.querySelector('#tour-next').addEventListener('click',()=>{if(slideIndex===tourSlides.length-1){showSlide(0);tourPlaying=true}else showSlide(slideIndex+1);document.querySelector('#tour-play').textContent='PAUSE';tourPlaying=true});
document.querySelector('#tour-play').addEventListener('click',()=>{if(slideIndex===tourSlides.length-1&& !tourPlaying){showSlide(0);tourPlaying=true;document.querySelector('#tour-play').textContent='PAUSE';return}tourPlaying=!tourPlaying;document.querySelector('#tour-play').textContent=tourPlaying?'PAUSE':'PLAY';if(tourPlaying)slideDeadline=performance.now()+12000});
tourVoice.addEventListener('click',()=>{voiceOn=!voiceOn;tourVoice.textContent=voiceOn?'◉ VOICE ON':'◉ VOICE';if(voiceOn)speakSlide();else window.speechSynthesis?.cancel()});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeTour();closeCopilotNow()}if(e.key==='?'&&!e.metaKey&&!e.ctrlKey){e.preventDefault();openCopilot()}});

// Scroll choreography + subtle number reveal.
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.section-reveal').forEach(node=>observer.observe(node));
const countObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.querySelectorAll('[data-count]').forEach(el=>{const target=Number(el.dataset.count);const start=performance.now();function tick(now){const p=Math.min(1,(now-start)/850);el.textContent=String(Math.round(target*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(tick)}requestAnimationFrame(tick)});countObserver.unobserve(entry.target)}),{threshold:.5});
const proofStrip=document.querySelector('.proof-strip');if(proofStrip)countObserver.observe(proofStrip);
