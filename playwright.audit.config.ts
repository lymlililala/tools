import process from 'node:process';
import { defineConfig, devices } from '@playwright/test';

// Dedicated config for the full-site UI audit (src/ui-audit.spec.ts).
// Chromium-only, separate from the functional e2e suite so it doesn't bloat
// the sharded cross-browser run. Uses the preview build on :5050 in CI; set
// BASE_URL + NO_WEB_SERVER=true to point it at an already-running dev server.
const isCI = !!process.env.CI;
const baseUrl = process.env.BASE_URL || 'http://localhost:5050';
const useWebServer = process.env.NO_WEB_SERVER !== 'true';

export default defineConfig({
  testDir: './src',
  testMatch: /ui-audit\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: 0,
  workers: isCI ? 4 : undefined,
  reporter: isCI ? [['line'], ['html', { open: 'never' }]] : 'line',
  use: {
    baseURL: baseUrl,
    testIdAttribute: 'data-test-id',
    locale: 'en-GB',
    timezoneId: 'Europe/Paris',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  ...(useWebServer && {
    webServer: {
      command: 'npm run preview',
      url: 'http://localhost:5050',
      reuseExistingServer: !isCI,
      timeout: 120000,
    },
  }),
});
