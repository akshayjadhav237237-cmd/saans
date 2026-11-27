# ADR 0005: Client-Side Privacy Sanitization and Grounded Gemini Integration

## Status

Accepted

## Context

Saans allows urban families to personalize air quality guidance using household member roles and respiratory sensitivity toggles (`src/features/household/`, `tests/household.feature.test.tsx`), UI commute/purifier inputs, and deterministic daily exposure scenarios (`src/domain/actions.catalog.ts`, `tests/actions.test.ts`). When integrating cloud GenAI capabilities (Google Gemini) for contextual explanations, transmitting personal details, names, street locations, or GPS coordinates to external APIs presents severe privacy risks.

Moreover, integrating third-party LLMs introduces risks of prompt injection attacks, unpredictable formatting, and hallucinations of medical metrics or exposure values. We required an architecture that guarantees data minimization, protects against prompt tampering, ensures numbers are grounded in engine calculations, and operates reliably even without external network access or API keys.

## Decision

1. **Strict Client-Side Allowlist Sanitization**: Cloud GenAI requests are constructed exclusively through `buildSanitizedPayload()` in `src/ai/payload.ts`. All PII is removed:
   - Zero transmission of city names, GPS coordinates, household names, nicknames, member IDs, notes, or timestamps.
   - Outbound payloads are restricted to five categorical fields: `aqiBandKey` (e.g. `'unhealthy'`), `roundedPm25` (integer), `memberKinds` (demographic roles: `child`, `adult`, `elder`), top 5 action IDs with calculated integer percentage deltas, and `language` (`'en'` or `'hi'`).
   - Verified by privacy canary tests capturing mocked outbound request bodies (`tests/privacy.canary.test.ts`).
2. **Transparent User Disclosure**: The UI displays the exact data elements shared with Google before submission. This disclosure list is generated directly from `DISCLOSURE_DESCRIPTIONS` in code, ensuring complete parity between policy and implementation.
3. **Ephemeral In-Memory API Key Handling**:
   - User Gemini API keys are maintained strictly in memory via Zustand store (`src/state/store.ts`).
   - Keys are never persisted to `localStorage`, `sessionStorage`, cookies, URLs, or telemetry logs.
   - Keys are transmitted exclusively via the standard `X-goog-api-key` HTTP header to official endpoints (`src/ai/gemini.ts`).
4. **Prompt Injection Defense Layer**: User questions are pre-processed by `src/ai/guard.ts`:
   - Enforced maximum length cap of 280 characters.
   - Stripping of control characters and non-printable sequences.
   - Screened against a regex corpus of known prompt-injection and jailbreak signatures.
   - Delimited payload separation: user text is never concatenated directly into system instructions.
5. **Strict Numerical Grounding Verification**: The `numbersAreGrounded()` engine (`src/ai/grounding.ts`) extracts all numeric digit sequences from the model's response and compares them against an allowlist of calculated engine values. If any ungrounded number is detected, the response is rejected.
6. **Graceful Local Fallback**: When Gemini is unavailable, unauthenticated, times out (15s limit), or returns ungrounded numbers, `src/ai/select.ts` automatically falls back to `LocalProvider` (`src/ai/local.ts`), which provides deterministic, template-based answers across 12 winter smog topics without internet access.

## Consequences

- **Verifiable Privacy by Design**: Zero personal identity or geographic coordinates leave the client machine (`tests/privacy.canary.test.ts`).
- **Elimination of Fabricated Metrics**: AI is mathematically restricted to contextual narrative; it cannot generate ungrounded exposure numbers.
- **Offline and Zero-Key Usability**: Users without an API key receive immediate, deterministic assistance without network degradation.
