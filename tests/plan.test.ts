import { describe, expect, it } from 'vitest';
import { buildDayPlan, rankActions } from '../src/domain/plan';
import type { Clock } from '../src/domain/ports';
import type { HourlySeries, HouseholdProfile, Scenario } from '../src/domain/types';

describe('Plan Engine (rankActions & buildDayPlan)', () => {
  const mockClock: Clock = {
    now: () => 1763539200000,
    iso: () => '2026-11-19T08:00:00.000Z',
  };

  const profile: HouseholdProfile = {
    id: 'h1',
    name: 'Kapoor Family',
    city: 'Delhi',
    members: [
      { id: 'm1', role: 'adult', hasRespiratoryCondition: false },
      { id: 'm2', role: 'child', hasRespiratoryCondition: true },
    ],
  };

  const highSmogHourly: HourlySeries = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    pm25: 250,
    aqi: 300,
  }));

  const baselineScenario: Scenario = {
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

  it('ranks actions by exposure reduction efficiency per effort unit', () => {
    const ranked = rankActions({
      hourly: highSmogHourly,
      profile,
      baselineScenario,
    });

    expect(ranked.length).toBeGreaterThan(0);
    // Actions with positive deltaDoseUg should appear before zero-delta qualitative actions
    const firstEffective = ranked[0];
    expect(firstEffective).toBeDefined();
    expect(firstEffective?.deltaDoseUg).toBeGreaterThan(0);

    for (let i = 0; i < ranked.length - 1; i += 1) {
      const current = ranked[i];
      const next = ranked[i + 1];
      if (current && next) {
        const scoreCurr = current.deltaDoseUg / current.action.effort;
        const scoreNext = next.deltaDoseUg / next.action.effort;
        expect(scoreCurr).toBeGreaterThanOrEqual(scoreNext);
      }
    }
  });

  it('builds a complete day plan where optimized exposure is lower than baseline', () => {
    const plan = buildDayPlan(
      {
        hourly: highSmogHourly,
        profile,
        baselineScenario,
      },
      mockClock,
    );

    expect(plan.baselineExposure.dailyDoseUg).toBeGreaterThan(plan.optimizedExposure.dailyDoseUg);
    expect(plan.optimizedExposure.cigaretteEquivalent).toBeLessThan(
      plan.baselineExposure.cigaretteEquivalent,
    );
    expect(plan.rankedActions.length).toBeGreaterThan(0);
    expect(plan.bestWindows.length).toBeGreaterThan(0);
  });

  it('is strictly deterministic for identical inputs', () => {
    const plan1 = buildDayPlan({ hourly: highSmogHourly, profile, baselineScenario }, mockClock);
    const plan2 = buildDayPlan({ hourly: highSmogHourly, profile, baselineScenario }, mockClock);

    expect(plan1.baselineExposure.dailyDoseUg).toBe(plan2.baselineExposure.dailyDoseUg);
    expect(plan1.optimizedExposure.dailyDoseUg).toBe(plan2.optimizedExposure.dailyDoseUg);
  });
});
