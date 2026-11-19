# AGENTS.md — Development and Quality Contract

## Project Overview

**Saans** is an urban air quality assistant for families and communities experiencing severe winter smog. It calculates personalized inhaled PM2.5 exposure budgets deterministically and offers verifiable, low-emission actions.

## Quality Contract

- **File Length**: Maximum 200 lines per file (including blank lines and comments).
- **Function Length**: Maximum 60 lines per function (90 lines for `.tsx` components).
- **Complexity**: Maximum cyclomatic complexity 10.
- **Parameters**: Maximum 4 parameters per function.
- **Exports**: Named exports only across `src/`. No default exports.
- **Strict Typing**: No `any`, no non-null assertions (`!`), no `@ts-ignore`, no `eslint-disable`.
- **Error Handling**: Use `Result<T, E>` across architectural boundaries. No uncaught throws.
- **Logging**: No `console.log` or console methods in application code.
- **Documentation**: Exactly one-line JSDoc comment on every exported function.
- **Cleanliness**: Zero `TODO`, zero `FIXME`, zero commented-out code.
- **Units**: Integer arithmetic for micrograms and currency.
- **Inversion of Control**: Injected `Clock` and `IdGen` ports for all time and ID operations.

## Layering Boundaries

1. `src/domain`: Pure TypeScript engines. No React, Zustand, DOM, fetch, or Zod.
2. `src/data`: HTTP adapters and Zod schemas for Open-Meteo external data.
3. `src/ai`: Gemini API client with strict client-side privacy sanitization.
4. `src/state`: Zustand client state and versioned persistence.
5. `src/shared`: Generic design system components and Result/Port types.
6. `src/features`: Isolated feature UI panels. Features never import other features.
7. `src/app`: Application shell and layout.

## Core Directives

- **AI Never Makes Numbers**: All AQI, PM2.5 concentrations, inhaled doses, and cost/impact deltas are computed exclusively by deterministic domain engines. AI only provides wording and contextual guidance.
- **Honest Claims**: Every README and UI claim must be backed by a test or command. No unsubstantiated absolute words (e.g. always, never, zero, fully, secure, compliant).

## Unattended Operation Rules

- Never ask questions; record assumptions in reports.
- If a gate fails 3 times, revert to the last green commit and record the failure.
- Never leave `main` red. Never push red commits.
- Maintain exactly one branch (`main`). No extra branches.
- Terminate all background processes (dev servers, browsers) before finishing.
- Throwaway scripts must reside outside the repository (`pw6-tools`).
- Use Conventional Commits (`feat(...)`, `chore(...)`, `test(...)`, `ci(...)`, `docs(...)`).
