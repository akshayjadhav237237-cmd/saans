import { describe, expect, it } from 'vitest';
import { calculateEffectiveHourPm25, computeExposure } from '../src/domain/exposure';
import type {
  ExposureInput,
  HourlyReading,
  HouseholdProfile,
  ScenarioHour,
} from '../src/domain/types';

describe('Domain Mathematical Properties', () => {
  it('types HourlyReading correctly', () => {
    const reading: HourlyReading = { hour: 0, pm25: 50, aqi: 100 };
    expect(reading.hour).toBe(0);
  });
  const profile: HouseholdProfile = {
    id: 'h1',
    name: 'Test Household',
    city: 'Delhi',
    members: [
      { id: 'm1', role: 'adult', hasRespiratoryCondition: false },
      { id: 'm2', role: 'child', hasRespiratoryCondition: false },
      { id: 'm3', role: 'elder', hasRespiratoryCondition: true },
    ],
  };

  const baseHour: ScenarioHour = {
    hour: 12,
    environment: 'indoor_home',
    mask: 'none',
    purifier: 'off',
    windowsSealed: false,
    cookingVentilated: true,
    dampMopping: true,
    biomassBurning: false,
  };

  it('monotonicity: higher outdoor PM2.5 never results in a lower inhaled dose', () => {
    const buildInput = (pm25: number): ExposureInput => ({
      profile,
      hourly: Array.from({ length: 24 }, (_, hour) => ({ hour, pm25, aqi: 150 })),
      scenario: {
        hours: Array.from({ length: 24 }, (_, hour) => ({ ...baseHour, hour })),
      },
    });

    const exp50 = computeExposure(buildInput(50));
    const exp100 = computeExposure(buildInput(100));
    const exp250 = computeExposure(buildInput(250));
    const exp500 = computeExposure(buildInput(500));

    expect(exp100.dailyDoseUg).toBeGreaterThanOrEqual(exp50.dailyDoseUg);
    expect(exp250.dailyDoseUg).toBeGreaterThanOrEqual(exp100.dailyDoseUg);
    expect(exp500.dailyDoseUg).toBeGreaterThanOrEqual(exp250.dailyDoseUg);
  });

  it('safety invariant: wearing a mask never raises effective PM2.5 exposure', () => {
    const pm25 = 200;
    const noMask = calculateEffectiveHourPm25(pm25, { ...baseHour, mask: 'none' });
    const cloth = calculateEffectiveHourPm25(pm25, { ...baseHour, mask: 'cloth' });
    const surgical = calculateEffectiveHourPm25(pm25, { ...baseHour, mask: 'surgical' });
    const n95 = calculateEffectiveHourPm25(pm25, { ...baseHour, mask: 'n95' });

    expect(cloth).toBeLessThanOrEqual(noMask);
    expect(surgical).toBeLessThanOrEqual(cloth);
    expect(n95).toBeLessThanOrEqual(surgical);
  });

  it('safety invariant: running an air purifier never raises indoor PM2.5 concentration', () => {
    const pm25 = 200;
    const off = calculateEffectiveHourPm25(pm25, { ...baseHour, purifier: 'off' });
    const room = calculateEffectiveHourPm25(pm25, { ...baseHour, purifier: 'on_room' });
    const whole = calculateEffectiveHourPm25(pm25, { ...baseHour, purifier: 'on_whole_house' });

    expect(room).toBeLessThanOrEqual(off);
    expect(whole).toBeLessThanOrEqual(room);
  });

  it('safety invariant: sealing windows never raises indoor PM2.5 concentration', () => {
    const pm25 = 250;
    const unsealed = calculateEffectiveHourPm25(pm25, { ...baseHour, windowsSealed: false });
    const sealed = calculateEffectiveHourPm25(pm25, { ...baseHour, windowsSealed: true });

    expect(sealed).toBeLessThanOrEqual(unsealed);
  });
});
