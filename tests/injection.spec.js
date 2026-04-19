// @ts-check
const { test, expect } = require('@playwright/test');
const { loadArticle, injectZenMode, injectZenRestore } = require('./fixtures');

let articlePage;
let articleContext;

test.beforeAll(async ({ browser }, testInfo) => {
  testInfo.setTimeout(120000);
  const { page, context } = await loadArticle(browser);
  if (!page) {
    test.skip();
    return;
  }
  await injectZenMode(page);
  await page.waitForTimeout(1000);
  articlePage = page;
  articleContext = context;
});

test.afterAll(async () => {
  if (articleContext) await articleContext.close();
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

  const beforeRestore = await articlePage.evaluate(() => ({
    zenXExists: !!window.__zenx,
    savedCount: window.__zenx?.savedStyles?.length ?? 0,
  }));
  expect(beforeRestore.zenXExists).toBe(true);
  expect(beforeRestore.savedCount).toBeGreaterThan(0);

  await injectZenRestore(articlePage);

  // Remove injected CSS (simulating chrome.scripting.removeCSS)
  await articlePage.evaluate(() => {
    document.querySelectorAll('style').forEach(s => {
      if (s.textContent.includes('--zen-content-max-width')) s.remove();
    });
  });

  await articlePage.waitForTimeout(500);

  const zenxGone = await articlePage.evaluate(() => !window.__zenx);
  expect(zenxGone).toBe(true);

  const sidebar = articlePage.locator('[data-testid="sidebarColumn"]');
  if (await sidebar.count() > 0) {
    await expect(sidebar.first()).toBeVisible();
  }

  const nav = articlePage.locator('header[role="banner"]');
  if (await nav.count() > 0) {
    await expect(nav.first()).toBeVisible();
  }

  const maxWidth = await articlePage.locator('[data-testid="primaryColumn"]').first().evaluate(
    el => getComputedStyle(el).maxWidth
  );
  expect(maxWidth).not.toBe('890px');

  const scrollY = await articlePage.evaluate(() => window.scrollY);
  expect(scrollY).toBe(0);
});

test('zen mode can be re-activated after restore', async () => {
  test.skip(!articlePage, 'No article page loaded');

  await injectZenMode(articlePage);
  await articlePage.waitForTimeout(500);

  const zenXExists = await articlePage.evaluate(() => !!window.__zenx);
  expect(zenXExists).toBe(true);

  const sidebar = articlePage.locator('[data-testid="sidebarColumn"]');
  if (await sidebar.count() > 0) {
    await expect(sidebar.first()).toBeHidden();
  }
});
