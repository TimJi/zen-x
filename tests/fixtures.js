// @ts-check
const path = require('path');
const fs = require('fs');

const ARTICLE_URLS = [
  'https://x.com/thedankoe/status/2010042119121957316',
  'https://x.com/jimprosser/status/2029699731539255640',
  'https://x.com/jiayuan_jy/status/2029851505583607961',
];

async function loadArticle(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const url of ARTICLE_URLS) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.locator('[data-testid="primaryColumn"]').first()
        .waitFor({ state: 'visible', timeout: 10000 });
      await page.locator('[data-testid="cellInnerDiv"]').first()
        .waitFor({ state: 'attached', timeout: 10000 });
      return { page, context };
    } catch {
      continue;
    }
  }
  await context.close();
  return { page: null, context: null };
}

const cssPath = path.resolve(__dirname, '..', 'zen-mode.css');
const jsPath = path.resolve(__dirname, '..', 'zen-mode.js');
const restorePath = path.resolve(__dirname, '..', 'zen-restore.js');

async function injectZenMode(page) {
  await page.addStyleTag({ content: fs.readFileSync(cssPath, 'utf-8') });
  await page.evaluate(fs.readFileSync(jsPath, 'utf-8'));
}

async function injectZenRestore(page) {
  await page.evaluate(fs.readFileSync(restorePath, 'utf-8'));
}

module.exports = { ARTICLE_URLS, loadArticle, injectZenMode, injectZenRestore };
