import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';
import { A11Y_NAMES } from '../src/shared/a11y-names';

/**
 * Asserts that the document root and main landmark do not generate horizontal scrolling.
 */
export async function assertNoHorizontalScroll(page: Page): Promise<void> {
  const hasScroll = await page.evaluate(() => {
    const docEl = document.documentElement;
    const body = document.body;
    const main = document.querySelector('main');
    const mainOverflow = main ? main.scrollWidth > window.innerWidth : false;
    return (
      docEl.scrollWidth > window.innerWidth || body.scrollWidth > window.innerWidth || mainOverflow
    );
  });
  expect(hasScroll).toBe(false);
}

/**
 * Asserts that primary section cards and layout containers do not overlap vertically or horizontally.
 */
export async function assertNoCardOverlap(page: Page): Promise<void> {
  const hasOverlap = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('section, [role="tabpanel"] > div > div'));
    for (let i = 0; i < cards.length - 1; i += 1) {
      const a = cards[i]?.getBoundingClientRect();
      const b = cards[i + 1]?.getBoundingClientRect();
      if (a && b && a.bottom > b.top && a.left < b.right && a.right > b.left) {
        return true;
      }
    }
    return false;
  });
  expect(hasOverlap).toBe(false);
}

test.describe('Responsive Layout and Zoom Constraints', () => {
  test('narrow 320px mobile viewport exhibits zero horizontal scroll across all feature tabs', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');

    const tabs = [
      A11Y_NAMES.tabs.location,
      A11Y_NAMES.tabs.household,
      A11Y_NAMES.tabs.plan,
      A11Y_NAMES.tabs.ask,
      A11Y_NAMES.tabs.community,
    ];

    for (const tabName of tabs) {
      await page.getByRole('tab', { name: tabName }).click();
      await assertNoHorizontalScroll(page);
      await assertNoCardOverlap(page);
    }
  });

  test('200 percent zoom layout exhibits zero horizontal overflow on main workflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    await page.evaluate(() => {
      document.body.style.zoom = '200%';
    });

    await assertNoHorizontalScroll(page);

    await page.getByRole('tab', { name: A11Y_NAMES.tabs.household }).click();
    await assertNoHorizontalScroll(page);

    await page.evaluate(() => {
      document.body.style.zoom = '100%';
    });
  });
});
