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

test('preset city to live AQI to household matches deterministic engine exposure budget', async ({
  page,
}) => {
  const expected = computeExpectedPlan();

  await page.goto('/');

  const delhiChip = page.getByRole('button', { name: 'Delhi' });
  await delhiChip.click();

  await expect(page.getByText('220', { exact: true })).toBeVisible();
  await expect(page.getByText('170', { exact: true })).toBeVisible();

  await page.getByRole('tab', { name: A11Y_NAMES.tabs.household }).click();
  await expect(page.locator('#household-profile')).toBeVisible();
  await page.getByRole('button', { name: A11Y_NAMES.buttons.saveHousehold }).click();
  await expect(page.getByText('Profile saved successfully.')).toBeVisible();

  await page.getByRole('tab', { name: A11Y_NAMES.tabs.plan }).click();
  await expect(page.locator('#exposure-plan')).toBeVisible();

  await expect(page.getByText(String(expected.baselineDose), { exact: true })).toBeVisible();
  await expect(page.getByText(String(expected.optimizedDose), { exact: true })).toBeVisible();
  await expect(page.getByText(`-${expected.deltaPercent}%`)).toBeVisible();
  await expect(page.getByText(`~${expected.baselineCig}`)).toBeVisible();
  await expect(page.getByText(`~${expected.optimizedCig}`)).toBeVisible();
});

test('changing commute mode and purifier in Household updates displayed Plan baseline dose', async ({
  page,
}) => {
  const expected = computeExpectedPlan();
  await page.goto('/');
  await page.getByRole('button', { name: 'Delhi' }).click();
  await expect(page.getByText('220', { exact: true })).toBeVisible();

  await page.getByRole('tab', { name: A11Y_NAMES.tabs.household }).click();
  await page.locator('#household-commute').selectOption('commute_public');
  await page.getByRole('button', { name: A11Y_NAMES.buttons.saveHousehold }).click();

  await page.getByRole('tab', { name: A11Y_NAMES.tabs.plan }).click();
  const metroDoseText = await page.locator('#exposure-plan').innerText();
  const metroMatch = metroDoseText.match(/Today Baseline Exposure\s+(\d+)\s+ug\/day/i);
  const metroDose = metroMatch ? Number(metroMatch[1]) : 0;
  expect(metroDose).toBeGreaterThan(0);
  expect(metroDose).toBeLessThan(expected.baselineDose);
  await expect(page.getByText('Switch from Two-Wheeler to Metro or Bus')).toHaveCount(0);

  await page.getByRole('tab', { name: A11Y_NAMES.tabs.household }).click();
  await page.locator('#household-air-purifier').click();
  await page.getByRole('button', { name: A11Y_NAMES.buttons.saveHousehold }).click();

  await page.getByRole('tab', { name: A11Y_NAMES.tabs.plan }).click();
  const purifierText = await page.locator('#exposure-plan').innerText();
  const purifierMatch = purifierText.match(/Today Baseline Exposure\s+(\d+)\s+ug\/day/i);
  const purifierDose = purifierMatch ? Number(purifierMatch[1]) : 0;
  expect(purifierDose).toBeGreaterThan(0);
  expect(purifierDose).toBeLessThan(metroDose);
  await expect(page.getByText('Operate HEPA Purifier in Sleeping Area')).toHaveCount(0);
});
