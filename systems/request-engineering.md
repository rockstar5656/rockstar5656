# System 001 / Request engineering

## Problem

Turn command-line inputs into exchange requests while retaining precision, separating protocol details, and preserving the distinction between rejection and missing responses.

## Source snapshot

The case study examines public revision [`d7656c42b14aaec7326cc19d8f3d5fa2280389f1`](https://github.com/rockstar5656/binance-futures-trading-bot/tree/d7656c42b14aaec7326cc19d8f3d5fa2280389f1). It is a retrospective analysis of observable implementation. It does not claim undocumented author motives.

## Boundaries

1. **CLI:** presents options and results.
2. **Validation:** builds a normalized `OrderRequest` and parses decimal fields.
3. **Order adapter:** constructs protocol parameters and normalizes acknowledgements or explicit rejections.
4. **Transport:** signs requests, sets HTTP timeouts, and translates request exceptions.

## Important behavior

`STOP_LIMIT` maps to `STOP`. Market requests omit limit fields. The request signature is computed over the URL-encoded parameter string. `BinanceAPIError` is converted to an unsuccessful result; `NetworkError` propagates because missing transport acknowledgement can leave the remote write outcome uncertain.

## Verification boundaries

Mocked tests can establish local parameter construction, signing, and exception handling. They cannot prove live service availability or every exchange-side behavior. The profile's JavaScript demo has its own tests and explicitly simulated responses; it is not the Python project's integration test.

## Extension worth investigating

Stable client request identifiers and reconciliation before retrying could improve handling of ambiguous writes. This proposal is not implemented in the source examined here. A meaningful experiment would simulate lost acknowledgements after server acceptance and verify that retry handling does not create duplicate writes.

## Explore

[Run the educational lab](https://rockstar5656.github.io/rockstar5656/) · [Source repository](https://github.com/rockstar5656/binance-futures-trading-bot) · [Evidence map](evidence.md)
