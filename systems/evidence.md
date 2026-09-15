# Claims and their evidence

## The lab computes real HMAC-SHA256 signatures

Implementation: [`signQuery`](../lab/core.mjs). Verification: RFC 4231 known vector and an independent Node HMAC calculation in [`tests/lab.test.mjs`](../tests/lab.test.mjs).

## Decimal quantities retain their input precision

Implementation: `decimal`, `validate`, and `translate` preserve strings. Verification uses `0.010000000000000000001`, a representation that should not be converted through floating point.

## Invalid demo inputs stop before signing

Implementation: `trace` returns an invalid result immediately when validation throws. Verification checks negative, zero, non-finite, exponent-form, and nonnumeric inputs, plus missing order-specific fields.

## A lost simulated response preserves uncertainty

Implementation: the timeout scenario sets `serverOutcome` to `unknown`. Verification distinguishes it from the rejection code and accepted `NEW` state. These are selected demo states, not measured network events.

## Source links are reproducible

The lab links to the public Python revision `d7656c42b14aaec7326cc19d8f3d5fa2280389f1`. The profile notebook analyzes that revision. The separate browser adaptation describes its differences in the [simulation contract](../lab/README.md).

## Automated checks gate lab publication

The [publication workflow](../.github/workflows/publish-lab.yml) runs the core test suite before deploying the static assets. No external service credentials are needed for these tests.
