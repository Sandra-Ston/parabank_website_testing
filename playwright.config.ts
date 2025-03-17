import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright-tests',
  use: {
    headless: true,
    baseURL: 'https://example.com',
  },
});