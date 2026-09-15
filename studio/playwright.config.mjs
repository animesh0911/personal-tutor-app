import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.mjs',
  outputDir: './test-results/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:4311',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
  ],
  webServer: {
    command: 'node studio/tests/browser-server.mjs',
    cwd: new URL('..', import.meta.url).pathname,
    url: 'http://localhost:4311/api/health',
    reuseExistingServer: false,
    timeout: 30000,
  },
});
