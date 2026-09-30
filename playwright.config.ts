import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 2,
  use: { baseURL: 'http://127.0.0.1:4321', browserName: 'chromium', channel: process.platform === 'win32' ? 'chrome' : undefined },
  projects: [
    { name: 'mobile', use: { viewport: { width: 360, height: 800 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: { command: 'pnpm exec astro preview --host 127.0.0.1', url: 'http://127.0.0.1:4321', reuseExistingServer: false },
});
