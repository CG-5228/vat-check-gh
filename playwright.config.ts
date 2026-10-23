import { defineConfig, devices } from '@playwright/test';

const previewPort = Number(process.env.PLAYWRIGHT_PORT ?? 4173);
if (!Number.isInteger(previewPort) || previewPort < 1 || previewPort > 65535)
  throw new Error('PLAYWRIGHT_PORT must be an integer from 1 to 65535.');
const previewOrigin = `http://127.0.0.1:${previewPort}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: previewOrigin,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile-360',
      use: { ...devices['Pixel 5'], viewport: { width: 360, height: 800 } },
    },
  ],
  webServer: {
    command: `pnpm exec serve out -l tcp://127.0.0.1:${previewPort}`,
    url: previewOrigin,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
