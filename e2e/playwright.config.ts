import { defineConfig, devices } from '@playwright/test';

const isCi = Boolean(process.env['CI']);

/**
 * Playwright end-to-end test configuration for Saans real-browser validation.
 */
const config = defineConfig({
  testDir: './',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !isCi,
    timeout: 120000,
  },
});

export default config;
