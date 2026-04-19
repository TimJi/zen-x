// @ts-check
// 回歸：zen mode 不能遮掉 image lightbox
// （1.2.0 前的 bug：#layers { display: none } 把 X 渲染在 #layers 的 [role="dialog"] 整個藏掉）
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

let articlePage;
let imageLinkSelector = null;

test.beforeAll(async ({ browser }, testInfo) => {
  testInfo.setTimeout(120000);
  const context = await browser.newContext();
  const page = await context.newPage();

  // 嘗試載入一個有圖片的推文
  for (const url of ARTICLE_URLS) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.locator('[data-testid="primaryColumn"]').first()
        .waitFor({ state: 'visible', timeout: 10000 });
      // 給 SPA 一點時間渲染推文內容（含圖片連結）
      await page.waitForTimeout(1500);
      // X 的圖片連結 href 含 /photo/ 或 /media/
      const imgCount = await page.locator('a[href*="/photo/"], a[href*="/media/"]').count();
      if (imgCount > 0) {
        imageLinkSelector = 'a[href*="/photo/"], a[href*="/media/"]';
        articlePage = page;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!articlePage) {
    test.skip();
    await context.close();
    return;
  }

  // 注入 zen mode
  await articlePage.addStyleTag({ content: fs.readFileSync(cssPath, 'utf-8') });
  await articlePage.evaluate(fs.readFileSync(jsPath, 'utf-8'));
  await articlePage.waitForTimeout(500);
});

test.afterAll(async () => {
  if (articlePage) {
    await articlePage.context().close();
  }
});

test('before click: #layers has no dialog and drawers are hidden', async () => {
  test.skip(!articlePage, 'No article page with image loaded');
  const state = await articlePage.evaluate(() => {
    const layers = document.getElementById('layers');
    const children = layers ? Array.from(layers.children) : [];
    return {
      layersExists: !!layers,
      dialogCount: document.querySelectorAll('#layers [role="dialog"]').length,
      // 任何不含 dialog 的 direct child 應該被隱藏（zen CSS 規則）
      nonDialogChildrenDisplays: children
        .filter(c => !c.querySelector('[role="dialog"]'))
        .map(c => getComputedStyle(c).display),
    };
  });
  expect(state.layersExists).toBe(true);
  expect(state.dialogCount).toBe(0);
  for (const d of state.nonDialogChildrenDisplays) {
    expect(d).toBe('none');
  }
});

test('clicking image opens lightbox with [role="dialog"] visible inside #layers', async () => {
  test.skip(!articlePage || !imageLinkSelector, 'No article page with image loaded');

  // 點圖（X 會 pushState 到 /media/ 或 /photo/ 並把 dialog 插到 #layers）
  await articlePage.locator(imageLinkSelector).first().click();

  // 等 dialog 出現
  await articlePage.locator('#layers [role="dialog"]').first()
    .waitFor({ state: 'attached', timeout: 5000 });

  const visibility = await articlePage.evaluate(() => {
    const dialog = document.querySelector('#layers [role="dialog"]');
    if (!dialog) return null;
    // 從 dialog 往上找到 #layers 的 direct child（那一層決定整塊顯不顯示）
    let slot = dialog;
    while (slot.parentElement && slot.parentElement.id !== 'layers') {
      slot = slot.parentElement;
    }
    const slotStyle = getComputedStyle(slot);
    const rect = dialog.getBoundingClientRect();
    return {
      slotDisplay: slotStyle.display,
      slotVisibility: slotStyle.visibility,
      slotOpacity: slotStyle.opacity,
      dialogRectW: rect.width,
      dialogRectH: rect.height,
    };
  });

  expect(visibility, 'lightbox dialog not rendered').not.toBeNull();
  // 關鍵斷言：裝 dialog 的 slot 必須可見（1.2.0 前是 display: none）
  expect(visibility.slotDisplay).not.toBe('none');
  expect(visibility.slotVisibility).not.toBe('hidden');
  expect(Number(visibility.slotOpacity)).toBeGreaterThan(0);
});

test('lightbox close returns state (drawers still hidden, no dialog)', async () => {
  test.skip(!articlePage, 'No article page with image loaded');

  // 按 Esc 關 lightbox
  await articlePage.keyboard.press('Escape');
  await articlePage.waitForTimeout(500);

  const state = await articlePage.evaluate(() => {
    const layers = document.getElementById('layers');
    const children = layers ? Array.from(layers.children) : [];
    return {
      dialogCount: document.querySelectorAll('#layers [role="dialog"]').length,
      nonDialogChildrenDisplays: children
        .filter(c => !c.querySelector('[role="dialog"]'))
        .map(c => getComputedStyle(c).display),
    };
  });
  expect(state.dialogCount).toBe(0);
  for (const d of state.nonDialogChildrenDisplays) {
    expect(d).toBe('none');
  }
});
