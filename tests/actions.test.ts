import { describe, expect, it } from 'vitest';
import { applyAction, listActions } from '../src/domain/actions';
import { ACTIONS_CATALOG } from '../src/domain/actions.catalog';
import type { HouseholdProfile } from '../src/domain/types';
import { defaultScenario, sampleHouseholdProfile as profileWithChild } from './helpers';

describe('Actions Catalog & Domain Actions', () => {
  const adultOnlyProfile: HouseholdProfile = {
    id: 'h2',
    name: 'Single Professional',
    city: 'Gurugram',
    members: [{ id: 'm1', role: 'adult', hasRespiratoryCondition: false }],
  };

  it('contains between 16 and 20 distinct actions with unique identifiers', () => {
    expect(ACTIONS_CATALOG.length).toBeGreaterThanOrEqual(16);
    expect(ACTIONS_CATALOG.length).toBeLessThanOrEqual(20);
    const ids = new Set(ACTIONS_CATALOG.map((a) => a.id));
    expect(ids.size).toBe(ACTIONS_CATALOG.length);
  });

  it('covers all four required mitigation categories', () => {
    const categories = new Set(ACTIONS_CATALOG.map((a) => a.category));
    expect(categories.has('routine')).toBe(true);
    expect(categories.has('indoor')).toBe(true);
    expect(categories.has('sustainable')).toBe(true);
    expect(categories.has('community')).toBe(true);
  });

  it('filters actions correctly based on household profile composition', () => {
    const childActions = listActions(profileWithChild);
    const adultActions = listActions(adultOnlyProfile);

    expect(childActions.length).toBeGreaterThan(adultActions.length);
    expect(childActions.some((a) => a.id === 'shift_outdoor_play')).toBe(true);
    expect(adultActions.some((a) => a.id === 'shift_outdoor_play')).toBe(false);
  });

  it('modifies scenario correctly when applying commute_n95_mask action', () => {
    const updated = applyAction(defaultScenario, 'commute_n95_mask');
    const commuteHour = updated.hours.find((h) => h.hour === 8);
    expect(commuteHour?.mask).toBe('n95');
    const homeHour = updated.hours.find((h) => h.hour === 12);
    expect(homeHour?.mask).toBe('none');
  });

  it('modifies scenario correctly when applying purifier_bedroom action', () => {
    const updated = applyAction(defaultScenario, 'purifier_bedroom');
    const homeHour = updated.hours.find((h) => h.hour === 12);
    expect(homeHour?.purifier).toBe('on_room');
  });

  it('modifies scenario correctly when applying school_run_timing action', () => {
    const updated = applyAction(defaultScenario, 'school_run_timing');
    const hour8 = updated.hours.find((h) => h.hour === 8);
    expect(hour8?.environment).toBe('commute_car');
    expect(hour8?.mask).toBe('n95');
  });

  it('returns unmodified scenario when action ID is not recognized', () => {
    const updated = applyAction(defaultScenario, 'non_existent_action');
    expect(updated).toEqual(defaultScenario);
  });

  it('identifies qualitative actions with reasonKey and leaves scenario unchanged', () => {
    const qualitative = ACTIONS_CATALOG.filter((a) => a.isQualitative);
    expect(qualitative.length).toBeGreaterThan(0);
    for (const action of qualitative) {
      expect(action.reasonKey).toBeDefined();
      const result = action.apply(defaultScenario);
      expect(result).toEqual(defaultScenario);
    }
  });
});
