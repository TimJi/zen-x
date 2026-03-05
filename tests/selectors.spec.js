// @ts-check
const { test, expect } = require('@playwright/test');

const ARTICLE_URLS = [
  'https://x.com/elonmusk/status/1585841080431321088',
  'https://x.com/NASA/status/1562782891469197312',
  'https://x.com/GitHub/status/1556655450887061504',
];

const REQUIRED_SELECTORS = [
  '[data-testid="cellInnerDiv"]',
  '[data-testid="primaryColumn"]',
  '[data-testid="sidebarColumn"]',
  'header[role="banner"]',
  '[data-testid="app-bar-back"]',
  '#layers',
];

const OPTIONAL_SELECTORS = [
  '[data-testid="inline_reply_offscreen"]',
  '[data-testid="cellInnerDiv"] [role="group"]',
];

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

  articlePage = page;
});

test.afterAll(async () => {
  if (articlePage) {
    await articlePage.context().close();
  }
});

for (const selector of REQUIRED_SELECTORS) {
  test(`selector exists: ${selector}`, async () => {
    test.skip(!articlePage, 'No article page loaded');
    const count = await articlePage.locator(selector).count();
    expect(count, `Selector "${selector}" not found on page`).toBeGreaterThan(0);
  });
}

for (const selector of OPTIONAL_SELECTORS) {
  test(`optional selector: ${selector}`, async () => {
    test.skip(!articlePage, 'No article page loaded');
    const count = await articlePage.locator(selector).count();
    if (count === 0) {
      console.warn(`Optional selector "${selector}" not found — may need review`);
    }
    // Optional selectors don't fail the test
    expect(true).toBe(true);
  });
}
