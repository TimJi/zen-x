// @ts-check
const { test, expect } = require('@playwright/test');
const { loadArticle } = require('./fixtures');

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
let articleContext;

test.beforeAll(async ({ browser }, testInfo) => {
  testInfo.setTimeout(120000);
  const { page, context } = await loadArticle(browser);
  if (!page) {
    test.skip();
    return;
  }
  articlePage = page;
  articleContext = context;
});

test.afterAll(async () => {
  if (articleContext) await articleContext.close();
});

for (const selector of REQUIRED_SELECTORS) {
  test(`selector exists: ${selector}`, async () => {
    test.skip(!articlePage, 'No article page loaded');
    const count = await articlePage.locator(selector).count();
    expect(count, `Selector "${selector}" not found on page`).toBeGreaterThan(0);
  });
}

for (const selector of OPTIONAL_SELECTORS) {
  test(`optional selector: ${selector}`, async ({}, testInfo) => {
    test.skip(!articlePage, 'No article page loaded');
    const count = await articlePage.locator(selector).count();
    if (count === 0) {
      testInfo.annotations.push({
        type: 'drift',
        description: `Optional selector "${selector}" not found — may need review`,
      });
    }
  });
}
