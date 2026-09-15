# Systems lab / simulation contract

The public lab is an educational adaptation of `rockstar5656/binance-futures-trading-bot` at revision `d7656c42b14aaec7326cc19d8f3d5fa2280389f1`.

## Implemented here

- Local normalization and order-specific validation.
- Decimal strings preserved without JavaScript floating-point conversion.
- Mapping from `STOP_LIMIT` to `STOP`.
- Real browser HMAC-SHA256 signatures, using a public demonstration key.
- Fixed historical timestamp for reproducible signatures.
- User-selected simulated acceptance, rejection, and lost-response outcomes.
- JSON trace export with source revision and browser processing time.
- Source links to an immutable Python revision.

## Scope and differences

This code sends no HTTP requests to an exchange. It knows no account balances and applies no live exchange symbol, tick-size, or quantity filters. Acceptance does not imply a fill. The timestamp is intentionally unsuitable for a live request.

The demo accepts positive plain decimal strings up to 80 characters; Python's Decimal accepts additional representations such as exponent notation. Decimal representation is retained as entered rather than canonicalized by Python. This is a scoped educational adaptation, not exact cross-language compatibility.

Processing duration includes browser cryptography and scheduling overhead. It is neither Python performance nor exchange latency. Selected outcomes are simulations, not experimental observations about an exchange.

## Verify

Run `node --test tests/lab.test.mjs` from the repository root. Signing is checked against the RFC 4231 HMAC-SHA256 test vector and Node's independent HMAC implementation. Other cases check precision, translation, validation barriers, and outcome distinctions.

The optional draft WebMCP tool, `run_simulated_request_trace`, uses the same execution function and updates the visible form. It is feature-detected. No supported browser WebMCP validation context was available during implementation, so registration and end-to-end invocation have not been verified. Ordinary browser operation does not depend on this feature.
