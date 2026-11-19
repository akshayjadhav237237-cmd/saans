import type { Clock, IdGen } from '../src/domain/ports';
import type { HourlySeries, HouseholdProfile, Scenario } from '../src/domain/types';

/**
 * Shared mock clock fixture for deterministic testing.
 */
export const mockClock: Clock = {
  now: () => 1763539200000,
  iso: () => '2026-11-19T08:00:00.000Z',
};

/**
 * Shared mock identifier generator fixture for testing.
 */
export const mockIdGen: IdGen = {
  nextId: () => 'test_id_1',
};

/**
 * Shared sample household profile with adult and child members.
 */
export const sampleHouseholdProfile: HouseholdProfile = {
  id: 'h1',
  name: 'Sharma Family',
  city: 'Delhi',
  members: [
    { id: 'm1', role: 'adult', hasRespiratoryCondition: false },
    { id: 'm2', role: 'child', hasRespiratoryCondition: true },
  ],
};

/**
 * Shared high-smog hourly PM2.5 and AQI series fixture.
 */
export const sampleHourlySeries: HourlySeries = Array.from({ length: 24 }, (_, hour) => ({
  hour,
  pm25: 250,
  aqi: 300,
}));

/**
 * Creates a fresh baseline 24-hour activity scenario fixture.
 */
export function createDefaultScenario(): Scenario {
  return {
    hours: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      environment: hour >= 8 && hour <= 9 ? 'commute_two_wheeler' : 'indoor_home',
      mask: 'none',
      purifier: 'off',
      windowsSealed: false,
      cookingVentilated: false,
      dampMopping: false,
      biomassBurning: true,
    })),
  };
}

/**
 * Shared baseline 24-hour activity scenario fixture.
 */
export const defaultScenario: Scenario = createDefaultScenario();
