import { describe, expect, it } from 'vitest';
import { buildAllowedNumbers, numbersAreGrounded } from '../src/ai/grounding';
import type { SanitizedPayload } from '../src/ai/port';

describe('Numerical Grounding Verification', () => {
  const samplePayload: SanitizedPayload = {
    aqiBandKey: 'aqi.band.very_unhealthy',
    roundedPm25: 220,
    memberKinds: ['adult', 'child'],
    actions: [
      { id: 'purifier_bedroom', deltaPercent: 45 },
      { id: 'commute_n95_mask', deltaPercent: 30 },
    ],
    language: 'en',
  };

  it('builds grounded allowlist from payload integers', () => {
    const allowed = buildAllowedNumbers(samplePayload);
    expect(allowed).toContain(220);
    expect(allowed).toContain(45);
    expect(allowed).toContain(30);
  });

  it('allows text containing zero numeric digits', () => {
    const text = 'Wear a well-fitted mask outdoors and keep bedroom windows tightly sealed.';
    expect(numbersAreGrounded(text, [220, 45, 30])).toBe(true);
  });

  it('allows text containing numbers present in the grounded set', () => {
    const text = 'Action cuts inhaled PM2.5 by 45% and ambient levels are around 220.';
    expect(numbersAreGrounded(text, [220, 45, 30])).toBe(true);
  });

  it('rejects text hallucinating or inventing ungrounded numbers', () => {
    const text = 'Air quality will drop to 142 tomorrow and your risk drops by 88%.';
    expect(numbersAreGrounded(text, [220, 45, 30])).toBe(false);
  });

  it('handles floating point numerical tokens accurately', () => {
    expect(numbersAreGrounded('Dose reduced by 45.0 percent.', [45])).toBe(true);
    expect(numbersAreGrounded('Dose reduced by 45.8 percent.', [45])).toBe(false);
  });
});
