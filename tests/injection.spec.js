// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const ARTICLE_URLS = [
  'https://x.com/elonmusk/status/1585841080431321088',
  'https://x.com/NASA/status/1562782891469197312',
  'https://x.com/GitHub/status/1556655450887061504',
];

const cssPath = path.resolve(__dirname, '..', 'zen-mode.css');
const jsPath = path.resolve(__dirname, '..', 'zen-mode.js');

let articlePage;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  let loaded = false;
  for (const url of ARTICLE_URLS) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const column = await page.locator('[data-testid="primaryColumn"]').first();
      await column.waitFor({ state: 'visible', timeout: 10000 });
      loaded = true;
      break;
    } catch {
      continue;
    }
  }

  if (!loaded) {
    test.skip();
    await context.close();
    return;
  }

  // Inject zen-mode CSS
  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  await page.addStyleTag({ content: cssContent });

  // Inject zen-mode JS
  const jsContent = fs.readFileSync(jsPath, 'utf-8');
  await page.evaluate(jsContent);

  // Wait for DOM changes to settle
  await page.waitForTimeout(1000);

  articlePage = page;
});

test.afterAll(async () => {
  if (articlePage) {
    await articlePage.context().close();
  }
});

test('sidebar is hidden after injection', async () => {
  test.skip(!articlePage, 'No article page loaded');
  const sidebar = articlePage.locator('[data-testid="sidebarColumn"]');
  if (await sidebar.count() > 0) {
    await expect(sidebar.first()).toBeHidden();
  }
});

test('left navigation is hidden after injection', async () => {
  test.skip(!articlePage, 'No article page loaded');
  const nav = articlePage.locator('header[role="banner"]');
  if (await nav.count() > 0) {
    await expect(nav.first()).toBeHidden();
  }
});

test('primaryColumn has zen-mode max-width', async () => {
  test.skip(!articlePage, 'No article page loaded');
  const maxWidth = await articlePage.locator('[data-testid="primaryColumn"]').first().evaluate(
    el => getComputedStyle(el).maxWidth
  );
  expect(maxWidth).toBe('890px');
});

test('only first cellInnerDiv is visible', async () => {
  test.skip(!articlePage, 'No article page loaded');
  const cells = articlePage.locator('[data-testid="cellInnerDiv"]');
  const count = await cells.count();
  if (count > 1) {
    const secondDisplay = await cells.nth(1).evaluate(
      el => getComputedStyle(el).display
    );
    expect(secondDisplay).toBe('none');
  }
});
