# 002 / Translate concepts where the protocol begins

Status: retrospective analysis of public implementation.

## Problem

A user-facing command names a stop-limit order `STOP_LIMIT`. The exchange request uses `STOP`.

## Observable behavior

`_order_params_from_request` maps the order type, serializes decimal quantities, and adds `price`, `stopPrice`, and `timeInForce` for the relevant order types. The HTTP client receives protocol parameters rather than CLI options.

Source: [`bot/orders.py`](https://github.com/rockstar5656/binance-futures-trading-bot/blob/d7656c42b14aaec7326cc19d8f3d5fa2280389f1/bot/orders.py).

## Tradeoff

An explicit mapping requires maintenance when the API changes. It also gives a reviewer a single location to inspect the translation and allows that behavior to be verified without HTTP access.

## Limitations

This is one exchange adapter. The existence of a translation function does not establish multi-exchange support or every available order mode.

## Verification path

Inspect the tests for order parameter construction. Compare the resulting payloads with the exchange specification before changing the mapping.
