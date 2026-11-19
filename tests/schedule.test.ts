import { describe, expect, it } from 'vitest';
import {
  getMemberSensitivityWeight,
  hasVulnerableMembers,
  validateHouseholdProfile,
} from '../src/domain/household';
import { bestWindows } from '../src/domain/schedule';
import type { HourlySeries, HouseholdProfile } from '../src/domain/types';

describe('Household & Schedule Engines', () => {
  const validProfile: HouseholdProfile = {
    id: 'h1',
    name: 'Verma Family',
    city: 'Patna',
    members: [
      { id: 'm1', role: 'adult', hasRespiratoryCondition: false },
      { id: 'm2', role: 'elder', hasRespiratoryCondition: true },
    ],
  };

  it('validates correct household profiles', () => {
    const res = validateHouseholdProfile(validProfile);
    expect(res.ok).toBe(true);
  });

  it('rejects profiles with missing name or city', () => {
    const emptyName = { ...validProfile, name: '   ' };
    expect(validateHouseholdProfile(emptyName).ok).toBe(false);

    const emptyCity = { ...validProfile, city: '' };
    expect(validateHouseholdProfile(emptyCity).ok).toBe(false);

    const noMembers = { ...validProfile, members: [] };
    expect(validateHouseholdProfile(noMembers).ok).toBe(false);

    const invalidMemberId = {
      ...validProfile,
      members: [{ id: '  ', role: 'adult' as const, hasRespiratoryCondition: false }],
    };
    expect(validateHouseholdProfile(invalidMemberId).ok).toBe(false);
  });

  it('rejects households exceeding maximum member limit of 6', () => {
    const crowded: HouseholdProfile = {
      ...validProfile,
      members: Array.from({ length: 7 }, (_, i) => ({
        id: `m${i}`,
        role: 'adult',
        hasRespiratoryCondition: false,
      })),
    };
    expect(validateHouseholdProfile(crowded).ok).toBe(false);
  });

  it('correctly assesses vulnerable members in household', () => {
    expect(hasVulnerableMembers(validProfile)).toBe(true);

    const robustProfile: HouseholdProfile = {
      id: 'h2',
      name: 'Adults Only',
      city: 'Pune',
      members: [{ id: 'm1', role: 'adult', hasRespiratoryCondition: false }],
    };
    expect(hasVulnerableMembers(robustProfile)).toBe(false);
  });

  it('calculates sensitivity weights accurately based on demographic and health indicators', () => {
    const adult = { id: '1', role: 'adult' as const, hasRespiratoryCondition: false };
    const child = { id: '2', role: 'child' as const, hasRespiratoryCondition: false };
    const elderSick = { id: '3', role: 'elder' as const, hasRespiratoryCondition: true };

    expect(getMemberSensitivityWeight(adult)).toBe(1.0);
    expect(getMemberSensitivityWeight(child)).toBeCloseTo(1.3);
    expect(getMemberSensitivityWeight(elderSick)).toBeCloseTo(1.7);
  });

  const mockDiurnalHourly: HourlySeries = Array.from({ length: 24 }, (_, hour) => {
    // PM2.5 typically dips in the afternoon (hours 12-16) and peaks at night/morning
    let pm25 = 200;
    if (hour >= 12 && hour <= 16) {
      pm25 = 80;
    } else if (hour >= 6 && hour <= 9) {
      pm25 = 280;
    }
    return { hour, pm25, aqi: 250 };
  });

  it('finds best non-overlapping windows for outdoor exercise', () => {
    const windows = bestWindows(mockDiurnalHourly, 'exercise', 2);
    expect(windows.length).toBe(2);
    // Best exercise windows should avoid morning peak (6-9) and favor lower PM2.5 afternoon
    expect(windows[0]?.startHour).toBe(16);
    expect(windows[0]?.averagePm25).toBe(80);
  });

  it('finds best afternoon ventilation windows with 2-hour duration', () => {
    const windows = bestWindows(mockDiurnalHourly, 'ventilation', 1);
    expect(windows.length).toBe(1);
    const win = windows[0];
    expect(win).toBeDefined();
    if (win) {
      expect(win.endHour - win.startHour).toBe(2);
      expect(win.averagePm25).toBe(80);
    }
  });

  it('returns empty array when hourly series is empty or count is zero', () => {
    expect(bestWindows([], 'exercise', 2)).toEqual([]);
    expect(bestWindows(mockDiurnalHourly, 'exercise', 0)).toEqual([]);
  });

  it('breaks ties deterministically using the earlier start hour', () => {
    const flatHourly: HourlySeries = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      pm25: 150,
      aqi: 200,
    }));
    const windows = bestWindows(flatHourly, 'exercise', 2);
    expect(windows.length).toBe(2);
    expect(windows[0]?.startHour).toBeLessThan(windows[1]?.startHour ?? 0);
  });
});
