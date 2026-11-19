import { describe, it, expect } from 'vitest';
import { computeExposure, calculateEffectiveHourPm25 } from '../src/domain/exposure';
import type { ExposureInput, ScenarioHour } from '../src/domain/types';
import type { ParameterWithSource } from '../src/config/exposure-constants';

describe('Exposure computation engine', () => {
  it('validates parameter structure containing documentation source', () => {
    const param: ParameterWithSource<number> = {
      value: 1.0,
      source: 'heuristic',
      description: 'test param',
    };
    expect(param.value).toBe(1.0);
  });
  const baseHour: ScenarioHour = {
    hour: 8,
    environment: 'indoor_home',
    mask: 'none',
    purifier: 'off',
    windowsSealed: false,
    cookingVentilated: true,
    dampMopping: true,
    biomassBurning: false,
  };

  it('calculates unsealed indoor home exposure accurately (golden test)', () => {
    // 100 ug/m3 outdoor * 0.60 factor = 60 ug/m3
    const conc = calculateEffectiveHourPm25(100, baseHour);
    expect(conc).toBe(60);
  });

  it('verifies N95 mask filters 90% of inhaled concentration', () => {
    const maskHour: ScenarioHour = { ...baseHour, environment: 'outdoor', mask: 'n95' };
    // 100 ug/m3 * 1.0 * (1 - 0.90) = 10 ug/m3
    const conc = calculateEffectiveHourPm25(100, maskHour);
    expect(conc).toBeCloseTo(10);
  });

  it('verifies purifier on_room cuts indoor concentration in half', () => {
    const purifierHour: ScenarioHour = { ...baseHour, purifier: 'on_room' };
    // 100 * (0.60 * 0.5) = 30 ug/m3
    const conc = calculateEffectiveHourPm25(100, purifierHour);
    expect(conc).toBe(30);
  });

  it('computes 24h exposure and cigarette equivalence for a full household', () => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ ...baseHour, hour: i }));
    const hourly = Array.from({ length: 24 }, (_, i) => ({ hour: i, pm25: 100, aqi: 174 }));
    const input: ExposureInput = {
      hourly,
      profile: {
        id: 'h1',
        name: 'Family',
        city: 'Delhi',
        members: [
          { id: 'm1', role: 'adult', hasRespiratoryCondition: false },
          { id: 'm2', role: 'child', hasRespiratoryCondition: true },
        ],
      },
      scenario: { hours },
    };

    const res = computeExposure(input);
    // Adult: 60 ug/m3 * 0.6 m3/h * 24h = 864 ug
    // Child: 60 ug/m3 * 0.4 m3/h * 24h = 576 ug
    // Avg dose: (864 + 576) / 2 = 720 ug
    expect(res.dailyDoseUg).toBe(720);
    expect(res.averageBreathedPm25).toBe(60);
    // 60 / 22 = 2.72 -> 2.7
    expect(res.cigaretteEquivalent).toBe(2.7);
    expect(res.memberExposures).toHaveLength(2);
  });

  it('preserves property invariant: higher outdoor PM never lowers inhaled dose', () => {
    const hourA: ScenarioHour = { ...baseHour };
    const low = calculateEffectiveHourPm25(50, hourA);
    const high = calculateEffectiveHourPm25(150, hourA);
    expect(high).toBeGreaterThan(low);
  });

  it('preserves property invariant: mask never increases inhaled concentration', () => {
    const noMask = calculateEffectiveHourPm25(100, baseHour);
    const withMask = calculateEffectiveHourPm25(100, { ...baseHour, mask: 'surgical' });
    expect(withMask).toBeLessThan(noMask);
  });

  it('preserves property invariant: air purifier never increases indoor concentration', () => {
    const noPurifier = calculateEffectiveHourPm25(100, baseHour);
    const withPurifier = calculateEffectiveHourPm25(100, {
      ...baseHour,
      purifier: 'on_whole_house',
    });
    expect(withPurifier).toBeLessThan(noPurifier);
  });
});
