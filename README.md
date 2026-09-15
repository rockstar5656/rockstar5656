<p align="center"><a href="https://rockstar5656.github.io/rockstar5656/"><img src="assets/header.svg" alt="Vidit Shah / Engineering Lab" width="100%" /></a></p>

<p align="center"><b>🤖 ROBOTICS × 🧠 AI × ⚙️ SYSTEMS</b> &nbsp;·&nbsp; <a href="https://rockstar5656.github.io/rockstar5656/">ENTER THE LAB ↗</a></p>

# Vidit Shah

### I don't build demo projects. I build systems.

Software that can be questioned. Experiments that can be reproduced. Interfaces that expose the decisions underneath.

This profile is deliberately **not a static résumé**. The live lab is an interactive layer over the source: visitors can inspect the system, break it, follow the evidence, talk to a small local model, and run a guided presentation.

## 🤖 A small AI lives inside the page

The lab includes a **floating browser-local copilot** rather than a separate AI page. The first conversation loads a compact open language model; the page then uses it to discuss the public engineering context without a chat backend. The copilot is explicitly instructed to separate evidence from proposals and not invent private-project details, employers, metrics or achievements.

## 🎬 The portfolio can present itself

The **60-second system tour** is an in-page presentation with five automatically timed scenes covering the premise, interaction model, local AI, evidence graph and future direction. It also has optional browser speech, so the portfolio can literally walk a visitor through itself.

## ⚙️ System 001 / Request engineering

The public `binance-futures-trading-bot` repository is a layered Python CLI for Binance USDT-M Futures Testnet. The interactive front-end turns its most interesting boundaries into something a visitor can run:

```text
USER INTENT
     ↓
VALIDATE → TRANSLATE → HMAC SIGN → TRANSPORT
                                     ↓
                           CLIENT OBSERVATION
                           ├─ acknowledged
                           ├─ explicit rejection
                           └─ response missing / unknown
```

The underlying lesson is simple: **a timeout is not proof of rejection.** The client must distinguish what it observed from what the remote system may have done.

## 🔎 Evidence

[🛡️ Validation](https://github.com/rockstar5656/binance-futures-trading-bot/blob/d7656c42b14aaec7326cc19d8f3d5fa2280389f1/bot/validators.py) · [🔁 Translation](https://github.com/rockstar5656/binance-futures-trading-bot/blob/d7656c42b14aaec7326cc19d8f3d5fa2280389f1/bot/orders.py) · [🔐 Transport](https://github.com/rockstar5656/binance-futures-trading-bot/blob/d7656c42b14aaec7326cc19d8f3d5fa2280389f1/bot/client.py) · [🧪 Tests](https://github.com/rockstar5656/binance-futures-trading-bot/tree/d7656c42b14aaec7326cc19d8f3d5fa2280389f1/tests)

## 📓 Engineering notebook

**Decision 001:** A timeout doesn't mean failure.  
**Decision 002:** Translate concepts at the protocol boundary.  
**Experiment rule:** measurements need a method and an explicit limitation.

The notebook lives in [`notebook/`](notebook/).

## 🧬 The visual system

The lab front-end now uses restrained glassmorphism, layered ambient light, subtle motion, animated telemetry, project visuals, an evidence graph, scroll choreography, reduced-motion fallbacks and a floating interaction surface. The goal is **quietly futuristic**, not noisy.

## 🚀 Where this goes next

The architecture leaves room for richer local AI, robotics simulation, visual benchmarks, experiment timelines, project-level evidence graphs and interactive demonstrations. Those are future directions rather than claims about shipped public work.

---

<p align="center"><a href="https://rockstar5656.github.io/rockstar5656/"><b>▶ OPEN THE SYSTEM</b></a></p>

<sub>Public snapshot · 2026-09-15 · Model availability and performance depend on the visitor's browser/device.</sub>