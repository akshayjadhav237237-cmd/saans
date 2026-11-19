import { test as baseTest, expect, type Page, type Route } from '@playwright/test';
import { GEMINI_MODEL_ID } from '../src/config/models';

export const MOCK_HOURLY_PM25 = [
  120, 115, 110, 105, 100, 120, 150, 180, 195, 170, 150, 135, 125, 120, 115, 120, 135, 160, 190,
  210, 220, 180, 150, 130,
] as const;

export const MOCK_HOURLY_AQI = [
  184, 182, 179, 177, 174, 184, 199, 230, 245, 220, 199, 192, 187, 184, 182, 184, 192, 210, 240,
  260, 270, 230, 199, 189,
] as const;

export const MOCK_AIR_QUALITY_RESPONSE = {
  current: {
    us_aqi: 220,
    pm2_5: 170,
    pm10: 250,
  },
  hourly: {
    time: Array.from({ length: 24 }, (_, i) => `2026-11-19T${String(i).padStart(2, '0')}:00`),
    pm2_5: Array.from(MOCK_HOURLY_PM25),
    us_aqi: Array.from(MOCK_HOURLY_AQI),
  },
};

export const MOCK_GEOCODING_RESPONSE = {
  results: [
    {
      id: 1273294,
      name: 'Delhi',
      latitude: 28.6139,
      longitude: 77.209,
      country: 'India',
      admin1: 'Delhi',
    },
    {
      id: 1270583,
      name: 'Gurugram',
      latitude: 28.4595,
      longitude: 77.0266,
      country: 'India',
      admin1: 'Haryana',
    },
  ],
};

export const MOCK_GEMINI_EXPLAIN_RESPONSE = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify({
              summary: 'Air quality is in the very unhealthy band. Protect family members today.',
              highlights: [
                'Run indoor air purifiers continuously',
                'Avoid morning outdoor exercise during peak smog hours',
              ],
            }),
          },
        ],
      },
    },
  ],
};

export const MOCK_GEMINI_ANSWER_RESPONSE = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify({
              text: 'Use an N95 certified mask for high smog commutes to protect airways.',
              suggestedActionId: 'commute-mask-n95',
            }),
          },
        ],
      },
    },
  ],
};

/**
 * Intercepts external APIs and provides deterministic JSON fixtures.
 */
export async function setupMockRoutes(page: Page): Promise<void> {
  await page.route('**/v1/air-quality*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_AIR_QUALITY_RESPONSE),
    });
  });

  await page.route('**/v1/search*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_GEOCODING_RESPONSE),
    });
  });

  await page.route(`**/${GEMINI_MODEL_ID}:generateContent*`, async (route: Route) => {
    const postData = route.request().postData() ?? '';
    const isExplain = postData.includes('Explain this air quality');
    const responsePayload = isExplain ? MOCK_GEMINI_EXPLAIN_RESPONSE : MOCK_GEMINI_ANSWER_RESPONSE;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responsePayload),
    });
  });
}

export const test = baseTest.extend<{
  mockRoutes: void;
}>({
  mockRoutes: [
    async ({ page }, use) => {
      await setupMockRoutes(page);
      await use();
    },
    { auto: true },
  ],
});

export { expect };
