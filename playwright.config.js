// @ts-check
const { defineConfig } = require('@playwright/test');
const fs = require('fs');

const authFile = '.x-auth.json';

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  globalTimeout: 300000,
  retries: 1,
  use: {
    headless: true,
    browserName: 'chromium',
    ...(fs.existsSync(authFile) ? { storageState: authFile } : {}),
  },
});
