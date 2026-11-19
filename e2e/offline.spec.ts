import { test, expect } from './fixtures';
import { A11Y_NAMES } from '../src/shared/a11y-names';

test.describe('Offline Manual Override Resilience', () => {
  test('manual PM2.5 path and Local AI provider operate smoothly with network blocked post-load', async ({
    page,
  }) => {
    // 1. Initial application load with assets
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // 2. Sever external APIs (block network after initial asset delivery)
    await page.route('**/air-quality-api.open-meteo.com/**', (route) => route.abort());
    await page.route('**/geocoding-api.open-meteo.com/**', (route) => route.abort());
    await page.route('**/generativelanguage.googleapis.com/**', (route) => route.abort());

    // 3. Open manual PM2.5 override panel
    const manualToggle = page.locator('#manual-pm25-toggle');
    await manualToggle.click();

    const manualInput = page.getByLabel(A11Y_NAMES.inputs.manualPm25);
    await expect(manualInput).toBeVisible();
    await manualInput.fill('145');

    const applyBtn = page.getByRole('button', { name: A11Y_NAMES.buttons.applyManualPm25 });
    await applyBtn.click();

    // 4. Verify manual override notice and reflected concentration
    await expect(page.getByText('Using manual PM2.5 override')).toBeVisible();
    await expect(page.getByText('145', { exact: true })).toBeVisible();

    // 5. Navigate to Ask panel and verify Local provider works without network
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.ask }).click();
    await expect(page.locator('#ask-panel')).toBeVisible();
    await expect(page.getByTestId('mode-badge')).toContainText('Local');

    const questionInput = page.getByLabel(A11Y_NAMES.inputs.question);
    await questionInput.fill('Should I run my air purifier at night?');

    const askBtn = page.getByRole('button', { name: A11Y_NAMES.buttons.askQuestion });
    await askBtn.click();

    // Answer rendered locally without external network calls
    await expect(page.locator('#ask-panel')).toContainText(/purifier/i);

    // 6. Navigate to Plan tab and verify deterministic calculation on manual data
    await page.getByRole('tab', { name: A11Y_NAMES.tabs.plan }).click();
    await expect(page.locator('#exposure-plan')).toBeVisible();
    await expect(page.getByText('ug/day').first()).toBeVisible();
  });
});
