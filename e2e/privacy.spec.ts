import { test, expect, MOCK_GEMINI_ANSWER_RESPONSE } from './fixtures';
import type { Page } from '@playwright/test';
import { GEMINI_MODEL_ID } from '../src/config/models';
import { A11Y_NAMES } from '../src/shared/a11y-names';

const CANARY_CITY = 'SecretCanaryCity99';
const CANARY_NICKNAME = 'CanaryElderGrandpa88';
const CANARY_NOTES = 'PrivateRespiratoryNotes77';
const CANARY_API_KEY = 'AIzaSyCanarySecretTestKey999';

/**
 * Enters canary city, household nickname, API key, and submits a canary question.
 */
export async function populateCanaryDataAndSubmit(page: Page): Promise<void> {
  const cityInput = page.getByLabel(A11Y_NAMES.inputs.searchCity);
  await cityInput.fill(CANARY_CITY);

  await page.getByRole('tab', { name: A11Y_NAMES.tabs.household }).click();
  const nameInput = page.getByLabel(A11Y_NAMES.inputs.householdName);
  await nameInput.fill(CANARY_NICKNAME);
  await page.getByRole('button', { name: A11Y_NAMES.buttons.saveHousehold }).click();

  await page.getByRole('tab', { name: A11Y_NAMES.tabs.ask }).click();
  const keyInput = page.getByLabel(A11Y_NAMES.inputs.geminiApiKey);
  await keyInput.fill(CANARY_API_KEY);

  const questionInput = page.getByLabel(A11Y_NAMES.inputs.question);
  await questionInput.fill(`What mask should we wear? Reference: ${CANARY_NOTES}`);

  const submitBtn = page.getByRole('button', { name: A11Y_NAMES.buttons.askQuestion });
  await submitBtn.click();
  await expect(page.locator('#ask-panel')).toContainText(/mask/i);
}

/**
 * Asserts that the canary API key is not stored in localStorage or sessionStorage.
 */
export async function assertNoKeyInWebStorage(page: Page, apiKey: string): Promise<void> {
  const localStorageValues = await page.evaluate(() => {
    return Object.keys(localStorage).map((k) => localStorage.getItem(k) ?? '');
  });
  for (const val of localStorageValues) {
    expect(val).not.toContain(apiKey);
  }

  const sessionStorageValues = await page.evaluate(() => {
    return Object.keys(sessionStorage).map((k) => sessionStorage.getItem(k) ?? '');
  });
  for (const val of sessionStorageValues) {
    expect(val).not.toContain(apiKey);
  }
}

test.describe('Privacy and Data Minimization', () => {
  test('gemini payload contains no canary PII, and API key never leaks to URL or web storage', async ({
    page,
  }) => {
    let capturedBody = '';
    let capturedUrl = '';
    let capturedApiKeyHeader = '';

    await page.route(`**/${GEMINI_MODEL_ID}:generateContent*`, async (route) => {
      const req = route.request();
      capturedUrl = req.url();
      capturedBody = req.postData() ?? '';
      capturedApiKeyHeader = req.headers()['x-goog-api-key'] ?? '';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_GEMINI_ANSWER_RESPONSE),
      });
    });

    await page.goto('/');
    await populateCanaryDataAndSubmit(page);

    expect(capturedBody).not.toBe('');
    expect(capturedBody).not.toContain(CANARY_CITY);
    expect(capturedBody).not.toContain(CANARY_NICKNAME);

    expect(capturedApiKeyHeader).toBe(CANARY_API_KEY);
    expect(capturedUrl).not.toContain(CANARY_API_KEY);
    expect(page.url()).not.toContain(CANARY_API_KEY);

    await assertNoKeyInWebStorage(page, CANARY_API_KEY);
  });
});
