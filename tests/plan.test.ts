import { describe, expect, it } from 'vitest';
import { buildDayPlan, rankActions } from '../src/domain/plan';
import {
  formatCategoryLabel,
  formatRiskBandLabel,
  mapRiskToAqiBand,
} from '../src/features/plan/plan.format';
import {
  buildActionGroupViewModels,
  buildComparisonViewModel,
  buildMemberViewModels,
} from '../src/features/plan/plan.viewmodel';
import {
  defaultScenario as baselineScenario,
  mockClock,
  sampleHouseholdProfile as profile,
  sampleHourlySeries as highSmogHourly,
} from './helpers';

describe('Plan Engine (rankActions & buildDayPlan)', () => {
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

  it('formats risk bands and categories across supported locales', () => {
    expect(mapRiskToAqiBand('low')).toBe('good');
    expect(mapRiskToAqiBand('moderate')).toBe('moderate');
    expect(mapRiskToAqiBand('high')).toBe('unhealthy');
    expect(mapRiskToAqiBand('severe')).toBe('hazardous');
    expect(mapRiskToAqiBand('unknown')).toBe('moderate');

    expect(formatRiskBandLabel('low', 'en')).toBe('Low');
    expect(formatRiskBandLabel('moderate', 'en')).toBe('Moderate');
    expect(formatRiskBandLabel('high', 'en')).toBe('High');
    expect(formatRiskBandLabel('severe', 'en')).toBe('Severe');
    expect(formatRiskBandLabel('custom', 'en')).toBe('custom');

    expect(formatCategoryLabel('routine', 'en')).toBe('Daily Routines & Masks');
    expect(formatCategoryLabel('indoor', 'en')).toBe('Indoor Air & Home Sealing');
    expect(formatCategoryLabel('sustainable', 'en')).toBe('Sustainable Travel & Fuel');
    expect(formatCategoryLabel('community', 'en')).toBe('Community & Neighborhood Actions');

    expect(formatCategoryLabel('routine', 'hi')).toBe('दैनिक आदतें एवं मास्क');
    expect(formatCategoryLabel('indoor', 'hi')).toBe('घर की हवा एवं सीलिंग');
    expect(formatCategoryLabel('sustainable', 'hi')).toBe('स्वच्छ परिवहन एवं ईंधन');
    expect(formatCategoryLabel('community', 'hi')).toBe('सामुदायिक प्रयास');
  });

  it('handles edge case viewmodel branches for zero dose and missing members', () => {
    const zeroExposure = {
      dailyDoseUg: 0,
      averageBreathedPm25: 0,
      cigaretteEquivalent: 0,
      hourlyDoseUg: [],
      memberExposures: [],
    };
    const comp = buildComparisonViewModel(zeroExposure, zeroExposure, 'en');
    expect(comp.deltaPercent).toBe(0);

    const plan = buildDayPlan({ hourly: highSmogHourly, profile, baselineScenario }, mockClock);
    const emptyPlan = {
      ...plan,
      baselineExposure: zeroExposure,
      optimizedExposure: zeroExposure,
    };
    const members = buildMemberViewModels(emptyPlan, profile, 'en');
    expect(members[0]?.baselineDoseUg).toBe(0);
    expect(members[0]?.baselineRiskBand).toBe('moderate');

    const groups = buildActionGroupViewModels(plan.rankedActions, 'hi');
    expect(groups.length).toBe(4);
  });
});
