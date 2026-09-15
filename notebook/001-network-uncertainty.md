# 001 / A transport failure does not prove rejection

Status: retrospective analysis of public implementation.

## Problem

A client sends an order request and loses the response. A timeout cannot establish whether the service processed the request.

## Observable behavior

The REST client translates request exceptions into `NetworkError`. The order layer converts `BinanceAPIError` into an unsuccessful `OrderResult`, but allows `NetworkError` to propagate. Its inline comment explicitly identifies the order outcome as unknown.

Source: [`bot/client.py`](https://github.com/rockstar5656/binance-futures-trading-bot/blob/d7656c42b14aaec7326cc19d8f3d5fa2280389f1/bot/client.py), [`bot/orders.py`](https://github.com/rockstar5656/binance-futures-trading-bot/blob/d7656c42b14aaec7326cc19d8f3d5fa2280389f1/bot/orders.py).

## Tradeoff

The caller must handle an additional state. In return, it can distinguish a known rejection from a response that never arrived. A blind retry after an ambiguous write could duplicate the action.

## What remains unresolved

The observed code does not establish a complete idempotent retry or automatic reconciliation mechanism. A future change could use stable client request identifiers and query the service before retrying. That is a proposal, not an implemented feature.

## Verification path

Inspect exception handling in both layers and the network-error cases in the repository's tests. Simulated transport failures verify local propagation; only a controlled integration test can examine server-side outcomes.
