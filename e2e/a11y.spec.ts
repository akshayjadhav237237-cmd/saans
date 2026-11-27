import { test, expect } from './fixtures';
import type { Page, TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { A11Y_NAMES } from '../src/shared/a11y-names';

/** Executes full WCAG 2.1 AA axe-core analysis with color-contrast enabled. */
export async function assertZeroA11yViolations(page: Page, testInfo: TestInfo): Promise<void> {
  await page.evaluate(async () => {
    const finite = document
      .getAnimations()
      .filter((anim) => anim.effect?.getComputedTiming().iterations !== Infinity);
    await Promise.allSettled(finite.map((anim) => anim.finished));
  });

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .options({ rules: { 'color-contrast': { enabled: true } } })
    .analyze();

  const totalRules = results.passes.length + results.violations.length + results.incomplete.length;
  const incompleteIds = results.incomplete.map((r) => `${r.id}(${r.nodes.length})`).join(', ');
  testInfo.annotations.push({
    type: 'axe-audit',
    description: `rules=${totalRules} passes=${results.passes.length} violations=${results.violations.length} incomplete=${results.incomplete.length} [${incompleteIds}]`,
  });

  expect(results.violations).toEqual([]);
  expect(totalRules).toBeGreaterThan(10);
}

async function selectGurugramCity(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Gurugram' }).click();
  await expect(page.getByRole('heading', { name: 'Gurugram' })).toBeVisible();
}

test.describe('Accessibility Audits - Five Feature Tabs', () => {
  test('first run audit (Location tab) has zero accessibility violations', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await assertZeroA11yViolations(page, testInfo);
  });

  test('city selected state (Location tab) has zero accessibility violations', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    await selectGurugramCity(page);
    await assertZeroA11yViolations(page, testInfo);
  });

  test('household profile view has zero accessibility violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.household }).click();
    await expect(page.locator('#household-profile')).toBeVisible();
    await assertZeroA11yViolations(page, testInfo);
  });

  test('exposure plan view has zero accessibility violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await selectGurugramCity(page);
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.plan }).click();
    await expect(page.locator('#exposure-plan')).toBeVisible();
    await assertZeroA11yViolations(page, testInfo);
  });

  test('ask panel view has zero accessibility violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await selectGurugramCity(page);
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.ask }).click();
    await expect(page.locator('#ask-panel')).toBeVisible();
    await assertZeroA11yViolations(page, testInfo);
  });

  test('community advisory view has zero accessibility violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await selectGurugramCity(page);
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.community }).click();
    await expect(page.locator('#community-advisory')).toBeVisible();
    await assertZeroA11yViolations(page, testInfo);
  });
});

test.describe('Accessibility Audits - Localization and Print Modes', () => {
  test('Hindi localization mode has zero accessibility violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await selectGurugramCity(page);
    await page.getByRole('button', { name: A11Y_NAMES.buttons.switchLanguage }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
    await assertZeroA11yViolations(page, testInfo);
  });

  test('print media emulation has zero accessibility violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await selectGurugramCity(page);
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.community }).click();
    await expect(page.locator('#community-advisory')).toBeVisible();
    await page.emulateMedia({ media: 'print' });
    await assertZeroA11yViolations(page, testInfo);
  });

  test('roving tablist passes axe tab and ARIA rules after keyboard activation', async ({
    page,
  }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#household-profile')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('[role="tablist"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .options({ rules: { 'color-contrast': { enabled: true } } })
      .analyze();

    expect(results.violations).toEqual([]);
    const passedIds = new Set(results.passes.map((r) => r.id));
    for (const ruleId of [
      'aria-allowed-attr',
      'aria-required-attr',
      'aria-required-children',
      'aria-required-parent',
      'aria-roles',
      'tabindex',
    ]) {
      expect(passedIds.has(ruleId)).toBe(true);
    }
  });
});
