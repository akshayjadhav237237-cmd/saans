# ADR 0003: Deterministic Calculations Principle

## Status

Accepted

## Context

Generative AI models are prone to hallucinating numerical metrics and dosages, which is unacceptable for health and air quality guidance.

## Decision

All numerical quantities (AQI indices, PM2.5 concentrations, inhaled microgram doses, cost estimates, and percentage reductions) must be computed strictly by deterministic TypeScript domain engines. The AI model is strictly restricted to linguistic explanations and contextual advice, never producing or altering numeric outputs.

## Consequences

Guarantees mathematical correctness, auditability, and safety.
