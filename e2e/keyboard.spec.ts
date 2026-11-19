import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';
import { A11Y_NAMES } from '../src/shared/a11y-names';

/**
 * Validates that the active DOM element exhibits a visible keyboard focus indicator.
 */
export async function assertVisibleFocus(page: Page): Promise<void> {
  const hasVisibleRing = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return false;
    const style = window.getComputedStyle(el);
    const outline = style.outlineStyle !== 'none' && style.outlineWidth !== '0px';
    const shadow = style.boxShadow !== 'none' && style.boxShadow !== '';
    const hasRing =
      el.className && typeof el.className === 'string' && el.className.includes('focus:');
    return outline || shadow || Boolean(hasRing);
  });
  expect(hasVisibleRing).toBe(true);
}

/**
 * Selects a city and saves household profile via keyboard navigation.
 */
export async function setupCityAndHouseholdViaKeyboard(page: Page): Promise<void> {
  const gurugramBtn = page.getByRole('button', { name: 'Gurugram' });
  await gurugramBtn.focus();
  await assertVisibleFocus(page);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Gurugram' })).toBeVisible();

  const householdTab = page.getByRole('tab', { name: A11Y_NAMES.tabs.household });
  await householdTab.focus();
  await assertVisibleFocus(page);
  await page.keyboard.press('Enter');
  await expect(page.locator('#household-profile')).toBeVisible();

  const nameInput = page.getByLabel(A11Y_NAMES.inputs.householdName);
  await nameInput.focus();
  await assertVisibleFocus(page);
  await page.keyboard.type('Verma Household');

  const saveBtn = page.getByRole('button', { name: A11Y_NAMES.buttons.saveHousehold });
  await saveBtn.focus();
  await assertVisibleFocus(page);
  await page.keyboard.press('Enter');
  await expect(page.getByText('Profile saved successfully.')).toBeVisible();
}

/**
 * Navigates to plan and submits a question via keyboard navigation.
 */
export async function inspectPlanAndAskViaKeyboard(page: Page): Promise<void> {
  const planTab = page.getByRole('tab', { name: A11Y_NAMES.tabs.plan });
  await planTab.focus();
  await assertVisibleFocus(page);
  await page.keyboard.press('Enter');
  await expect(page.locator('#exposure-plan')).toBeVisible();

  const askTab = page.getByRole('tab', { name: A11Y_NAMES.tabs.ask });
  await askTab.focus();
  await assertVisibleFocus(page);
  await page.keyboard.press('Enter');
  await expect(page.locator('#ask-panel')).toBeVisible();

  const questionInput = page.getByLabel(A11Y_NAMES.inputs.question);
  await questionInput.focus();
  await assertVisibleFocus(page);
  await page.keyboard.type('How to clean indoor air?');

  const askBtn = page.getByRole('button', { name: A11Y_NAMES.buttons.askQuestion });
  await askBtn.focus();
  await assertVisibleFocus(page);
  await page.keyboard.press('Enter');
  await expect(page.locator('#ask-panel')).toContainText(/air/i);
}

test.describe('Keyboard Navigation - Core Flow', () => {
  test('skip link is keyboard focusable and navigates to main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skipLink = page.getByRole('link', { name: A11Y_NAMES.skipLink });
    await expect(skipLink).toBeFocused();
    await assertVisibleFocus(page);

    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('complete workflow can be operated solely through keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await setupCityAndHouseholdViaKeyboard(page);
    await inspectPlanAndAskViaKeyboard(page);
  });
});

test.describe('Keyboard Navigation - Focus Trap Check', () => {
  test('no keyboard focus trap exists when tabbing through interface', async ({ page }) => {
    await page.goto('/');

    const visitedElements = new Set<string>();
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press('Tab');
      const activeTag = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? `${el.tagName}:${el.id || el.textContent?.slice(0, 10)}` : 'none';
      });
      visitedElements.add(activeTag);
    }

    expect(visitedElements.size).toBeGreaterThan(3);

    const reverseVisited = new Set<string>();
    for (let i = 0; i < 5; i += 1) {
      await page.keyboard.press('Shift+Tab');
      const activeTag = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? `${el.tagName}:${el.id || el.textContent?.slice(0, 10)}` : 'none';
      });
      reverseVisited.add(activeTag);
    }

    expect(reverseVisited.size).toBeGreaterThan(2);
  });
});
