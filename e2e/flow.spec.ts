import { test, expect, MOCK_AIR_QUALITY_RESPONSE } from './fixtures';
import { buildDayPlan } from '../src/domain/plan';
import { createDefaultBaselineScenario } from '../src/features/plan/usePlan';
import { createSystemClock } from '../src/domain/ports';
import { A11Y_NAMES } from '../src/shared/a11y-names';
import type { HourlySeries, HouseholdProfile } from '../src/domain/types';

/**
 * Computes deterministic daily plan for test comparison matching domain logic.
 */
export function computeExpectedPlan(): {
  baselineDose: number;
  optimizedDose: number;
  deltaPercent: number;
  baselineCig: number;
  optimizedCig: number;
} {
  const hourly: HourlySeries = MOCK_AIR_QUALITY_RESPONSE.hourly.pm2_5
    .slice(0, 24)
    .map((rawPm25, hour) => {
      const pm25 = rawPm25 !== null ? Math.round(rawPm25) : 100;
      const rawAqi = MOCK_AIR_QUALITY_RESPONSE.hourly.us_aqi[hour];
      const aqi = rawAqi !== null && rawAqi !== undefined ? Math.round(rawAqi) : 174;
      return { hour, pm25, aqi };
    });

  const profile: HouseholdProfile = {
    id: 'h_default',
    name: 'Our Family',
    city: 'Delhi',
    members: [
      { id: 'm_adult_1', role: 'adult', hasRespiratoryCondition: false },
      { id: 'm_child_1', role: 'child', hasRespiratoryCondition: false },
    ],
  };

  const plan = buildDayPlan(
    {
      hourly,
      profile,
      baselineScenario: createDefaultBaselineScenario(),
    },
    createSystemClock(),
  );

  const baselineDose = plan.baselineExposure.dailyDoseUg;
  const optimizedDose = plan.optimizedExposure.dailyDoseUg;
  const deltaDose = Math.max(0, baselineDose - optimizedDose);
  const deltaPercent = baselineDose > 0 ? Math.round((deltaDose / baselineDose) * 100) : 0;

  return {
    baselineDose,
    optimizedDose,
    deltaPercent,
    baselineCig: plan.baselineExposure.cigaretteEquivalent,
    optimizedCig: plan.optimizedExposure.cigaretteEquivalent,
  };
}

test.describe('End-to-End Core Calculation Flow', () => {
  test('preset city to live AQI to household matches deterministic engine exposure budget', async ({
    page,
  }) => {
    const expected = computeExpectedPlan();

    await page.goto('/');

    // 1. Select preset city 'Delhi'
    const delhiChip = page.getByRole('button', { name: 'Delhi' });
    await delhiChip.click();

    // 2. Verify Live AQI card displays mock fixture values
    await expect(page.getByText('220', { exact: true })).toBeVisible();
    await expect(page.getByText('170', { exact: true })).toBeVisible();

    // 3. Navigate to Household Profile and confirm profile
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.household }).click();
    await expect(page.locator('#household-profile')).toBeVisible();
    await page.getByRole('button', { name: A11Y_NAMES.buttons.saveHousehold }).click();
    await expect(page.getByText('Profile saved successfully.')).toBeVisible();

    // 4. Navigate to Plan tab
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.plan }).click();
    await expect(page.locator('#exposure-plan')).toBeVisible();

    // 5. Assert exposure numbers strictly equal deterministic engine calculations
    await expect(page.getByText(String(expected.baselineDose), { exact: true })).toBeVisible();
    await expect(page.getByText(String(expected.optimizedDose), { exact: true })).toBeVisible();
    await expect(page.getByText(`-${expected.deltaPercent}%`)).toBeVisible();
    await expect(page.getByText(`~${expected.baselineCig}`)).toBeVisible();
    await expect(page.getByText(`~${expected.optimizedCig}`)).toBeVisible();
  });
});
