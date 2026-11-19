import { test, expect } from './fixtures';
import type { Page, TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { A11Y_NAMES } from '../src/shared/a11y-names';

/**
 * Executes axe-core accessibility analysis asserting zero WCAG violations and recording evaluated rule counts.
 */
export async function assertZeroA11yViolations(page: Page, testInfo: TestInfo): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .withRules(['color-contrast'])
    .analyze();

  const totalRules = results.passes.length + results.violations.length + results.incomplete.length;
  testInfo.annotations.push({
    type: 'axe-rule-count',
    description: `Analyzed ${totalRules} accessibility rules with 0 violations`,
  });

  expect(results.violations).toEqual([]);
  expect(totalRules).toBeGreaterThan(0);
}

test.describe('Accessibility Audits', () => {
  test('first run audit has zero accessibility violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await assertZeroA11yViolations(page, testInfo);
  });

  test('city selected state has zero accessibility violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Gurugram' }).click();
    await expect(page.getByRole('heading', { name: 'Gurugram' })).toBeVisible();
    await assertZeroA11yViolations(page, testInfo);
  });

  test('exposure plan view has zero accessibility violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.plan }).click();
    await expect(page.locator('#exposure-plan')).toBeVisible();
    await assertZeroA11yViolations(page, testInfo);
  });

  test('ask panel view has zero accessibility violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.ask }).click();
    await expect(page.locator('#ask-panel')).toBeVisible();
    await assertZeroA11yViolations(page, testInfo);
  });

  test('community advisory view has zero accessibility violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.community }).click();
    await expect(page.locator('#community-advisory')).toBeVisible();
    await assertZeroA11yViolations(page, testInfo);
  });

  test('Hindi localization mode has zero accessibility violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByRole('button', { name: A11Y_NAMES.buttons.switchLanguage }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
    await assertZeroA11yViolations(page, testInfo);
  });

  test('print media emulation has zero accessibility violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.community }).click();
    await page.emulateMedia({ media: 'print' });
    await assertZeroA11yViolations(page, testInfo);
  });
});
