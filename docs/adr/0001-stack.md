# ADR 0001: Architecture Stack Selection

## Status

Accepted

## Context

We need a performant, typed foundation for an urban air quality co-pilot that provides instant client-side calculation of PM2.5 exposure and mitigation impact.

## Decision

- Core: React 18, TypeScript 5, Vite 5
- State: Zustand
- Validation: Zod (adapters only)
- Styling: Tailwind CSS 3 with CSS variables
- Testing: Vitest 2 with jsdom and Testing Library

## Consequences

Deterministic performance, fast build times, and zero server-side rendering complexity.
