import { defineConfig, devices } from '@playwright/test';

console.log('Branch: ', process.env.GITHUB_HEAD_REF);

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  globalSetup: './tests/global-playwright-setup.js',
  testDir: './tests',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    [process.env.CI ? 'github' : 'list'],
    [process.env.CI ? 'blob' : 'html', { open: 'never' }],
  ],
  use: {
    // Traces are heavy so we want to use them sparingly, but having full trace
    // to reference of the latest dev build is useful to inspect.
    trace: process.env.GITHUB_HEAD_REF === 'dev' ? 'on' : 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'yarn dev:test-app',
    port: 3000,
    timeout: 15000,
  },
});
