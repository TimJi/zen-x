// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  globalTimeout: 300000,
  retries: 1,
  use: {
    headless: true,
    browserName: 'chromium',
    storageState: '.x-auth.json',
  },
});
