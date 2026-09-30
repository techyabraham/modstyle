import { defineConfig } from '@playwright/test';
const port = process.env.PLAYWRIGHT_PORT ?? '4323';
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 2,
  use: { baseURL, browserName: 'chromium', channel: process.platform === 'win32' ? 'chrome' : undefined },
  projects: [
    { name: 'mobile', use: { viewport: { width: 360, height: 800 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: { command: `pnpm exec astro preview --host 127.0.0.1 --port ${port}`, url: baseURL, reuseExistingServer: false },
});
