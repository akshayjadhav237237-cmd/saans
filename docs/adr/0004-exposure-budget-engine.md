# ADR 0004: Deterministic Exposure Budget Calculation Engine

## Status

Accepted

## Context

Severe winter smog in northern and central Indian cities (such as Delhi-NCR, Lucknow, and Patna) elevates PM2.5 concentrations to hazardous levels (frequently exceeding 250-400 ug/m3). Existing consumer air quality applications display ambient AQI or raw sensor readings, but fail to translate ambient numbers into personal physiological consequences. Inhaled particulate dose varies dramatically depending on personal factors: an active child inhaling air while walking outdoors breathes far more PM2.5 than an adult resting in a room with an air purifier.

Furthermore, machine learning models and large language models (LLMs) are inherently non-deterministic and prone to numerical hallucinations. Presenting generated health metrics or fabricated exposure numbers creates severe safety and liability risks. We required a transparent, deterministic calculation engine that computes exact daily inhaled PM2.5 dosage and quantitatively ranks practical mitigations.

## Decision

1. **Deterministic Mathematical Engine**: We implemented pure TypeScript calculation engines in `src/domain/` with zero side-effects, zero network access, and no reliance on `Date.now()` or `Math.random()`. Time and unique identifiers are passed strictly via injected `Clock` and `IdGen` ports (`src/domain/ports.ts`).
2. **24-Hour Diurnal Dosage Formulation**: Total daily inhaled dose is evaluated across 24 hourly periods using standard inhalation rates:
   $$Dose (\mu g) = \sum_{h=0}^{23} \left[ C_{outdoor}[h] \times f_{env}[h] \times (1 - \eta_{mask}[h]) \times BR[role] \times (1 - \Delta_{purifier}[h]) + Additions[h] \right]$$
   - $C_{outdoor}[h]$: Hourly outdoor ambient PM2.5 (ug/m3) from forecast.
   - $f_{env}[h]$: Infiltration ratio by micro-environment (outdoor: 1.0, commute 2-wheeler: 1.25, walk: 1.1, car: 0.7, transit: 0.8, home: 0.60, school/office: 0.55).
   - $\eta_{mask}[h]$: Fit-adjusted mask efficiency (N95: 0.90, surgical: 0.40, cloth: 0.20, none: 0.0).
   - $BR[role]$: Breathing rate in m3/h (child: 0.4, adult: 0.6, elder: 0.5) sourced from US EPA Exposure Factors Handbook Chapter 6.
   - $\Delta_{purifier}$: Room HEPA air cleaner reduction (0.50) or central/DIY box (0.70).
   - $Additions[h]$: Indoor sources (unventilated cooking: +40 ug/m3, dry sweeping: +20 ug/m3, incense: +60 ug/m3).
3. **Verified Heuristic Sources**: Every parameter in `src/config/exposure-constants.ts` carries an explicit `source` attribute citing official EPA or CDC/NIOSH documentation or is explicitly labeled as a heuristic.
4. **Berkeley Earth Cigarette Heuristic**: Average inhaled concentration is translated to cigarette equivalents using the Berkeley Earth divisor (22 ug/m3 = 1 cigarette/day). This metric is explicitly labeled in UI as a rough comparative heuristic, not medical advice.
5. **Deterministic Action Deltas**: Action impacts are computed by evaluating a modified scenario against the baseline scenario. The delta dose ($\Delta Dose$) and percentage reduction ($\Delta \% = \text{round}((\Delta Dose / BaselineDose) \times 100)$) are strictly mathematical. Actions are ranked by efficiency score: $\Delta Dose / Effort$.

## Consequences

- **Mathematical Reproducibility**: Identical inputs yield identical outputs across all runs and architectures, as verified by property-based tests (`tests/properties.test.ts`).
- **Zero Hallucination Risk**: LLMs and cloud APIs never generate or modify exposure statistics; they receive pre-computed numbers as read-only grounding tokens.
- **Strict Layering Isolation**: Domain code imports no React, Zustand, DOM, fetch, or Zod libraries, ensuring clean portability and independent unit testability.
