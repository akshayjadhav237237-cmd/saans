import { describe, expect, it } from 'vitest';
import { buildAdvisory } from '../src/domain/advisory';
import { roundInteger, roundOneDecimal } from '../src/domain/format';

describe('Advisory & Formatting Engines', () => {
  it('correctly rounds integers and one decimal floats', () => {
    expect(roundInteger(42.4)).toBe(42);
    expect(roundInteger(42.5)).toBe(43);
    expect(roundOneDecimal(42.456)).toBe(42.5);
    expect(roundOneDecimal(42.01)).toBe(42.0);
  });

  it('permits school outdoor activity only in Good and Moderate bands', () => {
    const goodAdv = buildAdvisory({ aqi: 40, city: 'Delhi', dominantCategory: 'good' });
    expect(goodAdv.schoolOutdoorPermitted).toBe(true);

    const modAdv = buildAdvisory({ aqi: 80, city: 'Delhi', dominantCategory: 'moderate' });
    expect(modAdv.schoolOutdoorPermitted).toBe(true);

    const sensitiveAdv = buildAdvisory({
      aqi: 120,
      city: 'Delhi',
      dominantCategory: 'unhealthy_sensitive',
    });
    expect(sensitiveAdv.schoolOutdoorPermitted).toBe(false);

    const hazAdv = buildAdvisory({ aqi: 450, city: 'Delhi', dominantCategory: 'hazardous' });
    expect(hazAdv.schoolOutdoorPermitted).toBe(false);
  });

  it('returns appropriate community actions and message keys for each band', () => {
    const adv = buildAdvisory({ aqi: 220, city: 'Noida', dominantCategory: 'very_unhealthy' });
    expect(adv.headlineKey).toBe('advisory.very_unhealthy.headline');
    expect(adv.adviceKey).toBe('advisory.very_unhealthy.advice');
    expect(adv.communityActions).toContain('advisory.action.mandatory_work_from_home');
    expect(adv.city).toBe('Noida');
    expect(adv.aqi).toBe(220);
  });
});
