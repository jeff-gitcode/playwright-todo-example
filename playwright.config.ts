import { defineConfig, devices } from '@playwright/test';

/**
 * Minimal Playwright config for the TodoMVC example.
 * Run: `npm install && npx playwright install && npm test`
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Keep concurrency modest: this suite runs against a shared public demo site.
  workers: process.env.CI ? 2 : 3,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    // TodoMVC demo app (no local server needed).
    // Note: baseURL is the origin; tests navigate to '/todomvc/'.
    baseURL: 'https://demo.playwright.dev',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
