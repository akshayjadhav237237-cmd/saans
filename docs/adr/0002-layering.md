# ADR 0002: Architectural Layering and Boundaries

## Status

Accepted

## Context

Clear boundaries prevent spaghetti dependencies, ensure domain logic remains pure and portable, and isolate third-party APIs.

## Decision

1. `src/domain`: Pure TypeScript functions. No React, Zustand, DOM, fetch, or Zod.
2. `src/data`: HTTP clients and schema validation for external APIs.
3. `src/ai`: Model communication and privacy redaction.
4. `src/state`: Client state management and local persistence.
5. `src/shared`: Generic primitives and design tokens.
6. `src/features`: Isolated UI views. Features never cross-import other features.
7. `src/app`: Shell layout and root routing.

## Consequences

Enforced by ESLint restricted imports. Enhances testability and maintainability.
