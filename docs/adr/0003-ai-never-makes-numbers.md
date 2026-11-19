# ADR 0003: AI Never Makes Numbers and Privacy Minimization

## Status

Accepted

## Context

Generative AI models are non-deterministic and prone to hallucinating numerical metrics, exposure values, and risk calculations. In the context of severe urban smog and public health guidance, invented numbers erode trust and create real safety risks. Furthermore, transmitting personal family profiles, coordinates, or household nicknames to cloud AI services violates privacy by design.

## Decision

1. **AI Never Makes Numbers**: All AQI classifications, PM2.5 concentrations, hourly inhaled microgram doses, cigarette-equivalents, and percentage deltas are computed exclusively by pure deterministic TypeScript domain engines.
2. **Words Only & Grounding**: AI providers return words only. Any numerical digits present in AI output must strictly match the grounded token allowlist derived from engine calculations (`numbersAreGrounded`). Any ungrounded numeric token triggers immediate schema rejection and fallback to local deterministic templates.
3. **Strict Privacy Allowlist**: The payload sent to cloud AI (`buildSanitizedPayload`) is strictly stripped of all PII: no city names, no nicknames, no dates, no coordinates, no notes, and no member IDs. Only categorical band keys, rounded integer PM2.5, member demographic roles, action IDs, delta percentages, and language codes are included.
4. **Verifiable Disclosure**: The disclosure list presented to the user is generated directly from the `payload.ts` field allowlist (`DISCLOSURE_DESCRIPTIONS`), ensuring transparency and parity.
5. **Prompt Injection Defense**: User queries are capped at 280 characters, stripped of control characters, and screened against an adversarial injection pattern corpus. User text is never concatenated into system instructions.

## Consequences

Guarantees mathematical determinism, robust user privacy, verifiable zero-PII transmission, and defense against prompt injection.
