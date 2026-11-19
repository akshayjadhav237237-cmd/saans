import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';
import { A11Y_NAMES } from '../src/shared/a11y-names';

/**
 * Asserts that the document has zero elements running active infinite animations.
 */
export async function assertZeroRunningAnimations(page: Page): Promise<void> {
  const activeSpinners = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    let count = 0;
    for (const el of all) {
      const style = window.getComputedStyle(el);
      const isSpinning =
        style.animationName !== 'none' &&
        style.animationIterationCount === 'infinite' &&
        style.animationPlayState === 'running';
      if (isSpinning) {
        count += 1;
      }
    }
    return count;
  });
  expect(activeSpinners).toBe(0);
}

test.describe('Prefers Reduced Motion Conformance', () => {
  test('emulating prefers-reduced-motion stops all continuous CSS animations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await assertZeroRunningAnimations(page);
  });

  test('spinner components suppress spin animations when reduced motion is requested', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Check all SVG graphic nodes for suppressed keyframe animations
    const svgAnimations = await page.evaluate(() => {
      const svgs = Array.from(document.querySelectorAll('svg'));
      return svgs.map((svg) => window.getComputedStyle(svg).animationName);
    });

    for (const anim of svgAnimations) {
      expect(anim === 'none' || anim === '').toBe(true);
    }
  });

  test('tab transitions and interactions execute without motion when reduced motion is preferred', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const tabs = [
      A11Y_NAMES.tabs.household,
      A11Y_NAMES.tabs.plan,
      A11Y_NAMES.tabs.ask,
      A11Y_NAMES.tabs.community,
    ];

    for (const tabName of tabs) {
      await page.getByRole('tab', { name: tabName }).click();
      await assertZeroRunningAnimations(page);
    }
  });
});
