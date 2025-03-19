import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  use: {
    baseURL: 'https://parabank.parasoft.com/parabank/index.htm',
    headless: true
  },
});