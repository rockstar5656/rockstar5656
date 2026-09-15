<p align="center"><a href="https://rockstar5656.github.io/rockstar5656/"><img src="assets/header.svg" alt="Vidit Shah / Engineering Lab — Interrogate the portfolio." width="100%" /></a></p>

<p align="center">
<a href="https://rockstar5656.github.io/rockstar5656/"><b>🤖 TALK TO THE LAB ↗</b></a> &nbsp; / &nbsp;
<a href="#systems">⚙️ SYSTEMS</a> &nbsp; / &nbsp;
<a href="notebook/README.md">📓 DECISIONS</a> &nbsp; / &nbsp;
<a href="https://github.com/rockstar5656?tab=repositories">🧬 PUBLIC INDEX</a>
</p>

# Vidit Shah

**Robotics × AI × Automation × Systems**

> **Don't just read the portfolio. Interrogate it.**

I build software and intelligent systems with an emphasis on explicit boundaries, inspectable behavior, automation, and the engineering decisions between intent and execution.

This profile is deliberately more than a résumé. **Run the lab. Ask the local copilot. Break the simulation. Follow a claim back to source.**

## 🤖 The Lab Copilot

The interactive lab now includes a **browser-local AI copilot** powered by a compact open small language model. It can discuss the public engineering context of this profile and distinguish documented work from proposed ideas.

- 🧠 **Ask:** architecture, tradeoffs, failures, engineering decisions, hiring perspective, next builds.
- ⚡ **Local-first:** inference happens in the browser; WebGPU is used when available with a compatible fallback.
- 🔒 **No chat backend:** conversation state stays in the browser and can be cleared locally.
- 🔎 **Evidence-aware:** the copilot is given curated public context and instructed not to invent achievements or metrics.

**First use downloads the model into the browser cache.** A modern Chromium-based browser with WebGPU gives the best experience.

[**Open the AI Lab →**](https://rockstar5656.github.io/rockstar5656/#copilot)

## ⚙️ Systems

### System 001 / Request engineering

**Binance Futures Testnet CLI** — a layered Python command-line application for market, limit, and stop-limit requests. The engineering focus is preserving meaning as an input crosses validation, protocol translation, signed transport, and an uncertain network.

```mermaid
flowchart LR
    A[User intent] --> B[Validate]
    B --> C[Translate]
    C --> D[Sign + transport]
    D --> E{Client observation}
    E --> F[Acknowledged]
    E --> G[Explicit rejection]
    E --> H[Response missing: unknown]
```

**Inspect the evidence**

- [🛡️ Validation](https://github.com/rockstar5656/binance-futures-trading-bot/blob/d7656c42b14aaec7326cc19d8f3d5fa2280389f1/bot/validators.py) — normalized requests, decimal values, cross-field rules.
- [🔁 Order adapter](https://github.com/rockstar5656/binance-futures-trading-bot/blob/d7656c42b14aaec7326cc19d8f3d5fa2280389f1/bot/orders.py) — protocol translation and structured rejection results.
- [🔐 REST client](https://github.com/rockstar5656/binance-futures-trading-bot/blob/d7656c42b14aaec7326cc19d8f3d5fa2280389f1/bot/client.py) — HMAC signing, timeouts, transport exceptions.
- [🧪 Tests](https://github.com/rockstar5656/binance-futures-trading-bot/tree/d7656c42b14aaec7326cc19d8f3d5fa2280389f1/tests) — inspect which guarantees are established without the network.

[**Run the interactive system →**](https://rockstar5656.github.io/rockstar5656/#workbench) · [Technical case study](systems/request-engineering.md)

## 🔬 What makes this profile different

**01 / Interrogate** — Ask an AI copilot about the engineering instead of scanning a static résumé.

**02 / Experiment** — Configure a request, inject an invalid input, simulate a rejection, or create an unknown-outcome timeout.

**03 / Verify** — Export the trace and open the exact source revision behind the behavior.

**04 / Decide** — Read the engineering notebook to understand *why* the system is shaped this way.

**05 / Reproduce** — Clone the repository and run the local verification suite without credentials.

## 📓 Decisions worth discussing

**A timeout doesn't establish rejection.** The remote service may have accepted a write before the response disappeared. Preserving uncertainty gives the caller a reason to reconcile before retrying.

[Read the analysis →](notebook/001-network-uncertainty.md)

**Translate user concepts at the protocol boundary.** The CLI's `STOP_LIMIT` name becomes the exchange's `STOP` parameter in one inspectable mapping.

[Read the analysis →](notebook/002-protocol-boundaries.md)

**A demo needs a verification contract.** The browser lab checks a published HMAC test vector, decimal precision, invalid inputs, request translation, and three simulated outcome states.

[Inspect the lab tests →](tests/lab.test.mjs) · [Map claims to evidence →](systems/evidence.md)

<details>
<summary><b>🧪 Reproduce the browser lab</b></summary>

Requires Node.js 22 or later. No dependency installation or credentials are needed.

```bash
git clone https://github.com/rockstar5656/rockstar5656.git
cd rockstar5656
node --test tests/lab.test.mjs
```

To run the interface locally:

```bash
python -m http.server 8765 --bind 127.0.0.1 --directory lab
```

Open `http://127.0.0.1:8765`.

</details>

<details>
<summary><b>🔎 Inspect the Python project</b></summary>

```bash
git clone https://github.com/rockstar5656/binance-futures-trading-bot.git
cd binance-futures-trading-bot
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt pytest
python -m pytest tests/ -v
```

These are the project's documented offline test commands. They do not place orders. Review the source and limitations before running integration commands.

</details>

## 🌐 Public engineering index

<!-- PUBLIC-INDEX:START -->
**Public snapshot · 2026-09-15 11:55 UTC**

1 original public project repository · 0 public forks

- [binance-futures-trading-bot](https://github.com/rockstar5656/binance-futures-trading-bot) — Python CLI trading bot for Binance USDT-M Futures Testnet featuring Market, Limit & Stop-Limit orders, structured logging, validation, exception handling, and modular architecture.

**Language inventory by GitHub-reported source bytes:** Python: 51,352 bytes.
<!-- PUBLIC-INDEX:END -->

<sub>Private repositories are intentionally excluded from the public index. The profile does not claim expertise from repository size alone.</sub>

---

<p align="center"><b>Source → architecture → decisions → experiments → discussion.</b></p>

<p align="center"><a href="https://rockstar5656.github.io/rockstar5656/">🚀 Interactive Lab</a> · <a href="notebook/README.md">📓 Engineering Notebook</a> · <a href="https://github.com/rockstar5656?tab=repositories">🧬 Public Repositories</a></p>
