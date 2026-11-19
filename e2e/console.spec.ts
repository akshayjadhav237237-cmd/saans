import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';
import { A11Y_NAMES } from '../src/shared/a11y-names';

/**
 * Attaches console and page error listeners to capture runtime diagnostics and CSP notices.
 */
export function attachConsoleCollector(page: Page): {
  readonly errors: string[];
  readonly cspViolations: string[];
} {
  const errors: string[] = [];
  const cspViolations: string[] = [];

  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      errors.push(`[${type}] ${text}`);
    }
    if (text.includes('Refused to')) {
      cspViolations.push(text);
    }
  });

  page.on('pageerror', (err) => {
    errors.push(`[pageerror] ${err.message}`);
  });

  return { errors, cspViolations };
}

test.describe('Console and CSP Hygiene', () => {
  test('zero console errors, warnings, or CSP violations occur across application flows', async ({
    page,
  }) => {
    const collector = attachConsoleCollector(page);

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // 1. Location tab interactions
    await page.getByRole('button', { name: 'Gurugram' }).click();
    await expect(page.getByRole('heading', { name: 'Gurugram' })).toBeVisible();

    // 2. Household tab interactions
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.household }).click();
    await expect(page.locator('#household-profile')).toBeVisible();
    await page.getByRole('button', { name: A11Y_NAMES.buttons.saveHousehold }).click();

    // 3. Plan tab interactions
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.plan }).click();
    await expect(page.locator('#exposure-plan')).toBeVisible();

    // 4. Ask tab interactions
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.ask }).click();
    await expect(page.locator('#ask-panel')).toBeVisible();
    await page.getByLabel(A11Y_NAMES.inputs.question).fill('When should we open windows?');
    await page.getByRole('button', { name: A11Y_NAMES.buttons.askQuestion }).click();
    await expect(page.locator('#ask-panel')).toContainText(/window/i);

    // 5. Community tab interactions
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.community }).click();
    await expect(page.locator('#community-advisory')).toBeVisible();

    // 6. Language switch toggle back and forth
    await page.getByRole('button', { name: A11Y_NAMES.buttons.switchLanguage }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
    await page.getByRole('button', { name: A11Y_NAMES.buttons.switchLanguage }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // Assert strictly zero errors and zero CSP refusal messages
    expect(collector.cspViolations).toEqual([]);
    expect(collector.errors).toEqual([]);
  });
});
