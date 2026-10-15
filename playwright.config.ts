import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: '**/*.spec.ts', timeout: 45000,
  use: { baseURL: process.env.TEST_URL || 'http://localhost:3101', headless: true, screenshot: 'only-on-failure' },
  webServer: process.env.TEST_URL ? undefined : { command: 'npm run dev', url: 'http://localhost:3101', reuseExistingServer: true, timeout: 120000 },
});
