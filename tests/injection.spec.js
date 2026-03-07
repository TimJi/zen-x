// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const ARTICLE_URLS = [
  'https://x.com/thedankoe/status/2010042119121957316',
  'https://x.com/jimprosser/status/2029699731539255640',
  'https://x.com/jiayuan_jy/status/2029851505583607961',
];

const cssPath = path.resolve(__dirname, '..', 'zen-mode.css');
const jsPath = path.resolve(__dirname, '..', 'zen-mode.js');
const restorePath = path.resolve(__dirname, '..', 'zen-restore.js');

let articlePage;

test.beforeAll(async ({ browser }, testInfo) => {
  testInfo.setTimeout(120000);
  const context = await browser.newContext();
  const page = await context.newPage();

  let loaded = false;
  for (const url of ARTICLE_URLS) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
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

test('zen-restore.js reverses all DOM changes without reload', async () => {
  test.skip(!articlePage, 'No article page loaded');

  // Capture zen-mode state before restore
  const beforeRestore = await articlePage.evaluate(() => ({
    zenXExists: !!window.__zenx,
    savedCount: window.__zenx?.savedStyles?.length ?? 0,
    scrollY: window.__zenx?.scrollY ?? 0
  }));
  expect(beforeRestore.zenXExists).toBe(true);
  expect(beforeRestore.savedCount).toBeGreaterThan(0);

  // Execute restore script
  const restoreContent = fs.readFileSync(restorePath, 'utf-8');
  await articlePage.evaluate(restoreContent);

  // Remove injected CSS (simulating chrome.scripting.removeCSS)
  await articlePage.evaluate(() => {
    document.querySelectorAll('style').forEach(s => {
      if (s.textContent.includes('--zen-content-max-width')) s.remove();
    });
  });

  await articlePage.waitForTimeout(500);

  // Verify __zenx is cleaned up
  const zenxGone = await articlePage.evaluate(() => !window.__zenx);
  expect(zenxGone).toBe(true);

  // Verify sidebar is visible again
  const sidebar = articlePage.locator('[data-testid="sidebarColumn"]');
  if (await sidebar.count() > 0) {
    await expect(sidebar.first()).toBeVisible();
  }

  // Verify left navigation is visible again
  const nav = articlePage.locator('header[role="banner"]');
  if (await nav.count() > 0) {
    await expect(nav.first()).toBeVisible();
  }

  // Verify primaryColumn max-width is restored (not 890px)
  const maxWidth = await articlePage.locator('[data-testid="primaryColumn"]').first().evaluate(
    el => getComputedStyle(el).maxWidth
  );
  expect(maxWidth).not.toBe('890px');

  // Verify scroll is at top after restore
  const scrollY = await articlePage.evaluate(() => window.scrollY);
  expect(scrollY).toBe(0);
});

test('zen mode can be re-activated after restore', async () => {
  test.skip(!articlePage, 'No article page loaded');

  // Re-inject CSS and JS
  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  await articlePage.addStyleTag({ content: cssContent });
  const jsContent = fs.readFileSync(jsPath, 'utf-8');
  await articlePage.evaluate(jsContent);
  await articlePage.waitForTimeout(500);

  // Verify zen mode is active again
  const zenXExists = await articlePage.evaluate(() => !!window.__zenx);
  expect(zenXExists).toBe(true);

  const sidebar = articlePage.locator('[data-testid="sidebarColumn"]');
  if (await sidebar.count() > 0) {
    await expect(sidebar.first()).toBeHidden();
  }
});
