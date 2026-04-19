<!-- 實作順序為實際執行順序。所有任務都已完成（此 change 是回溯補 spec）。 -->

## 1. Image lightbox CSS fix

- [x] 1.1 在 `zen-mode.css` 把 `#layers { display: none !important }` 改為 `#layers > div:not(:has([role="dialog"])) { display: none !important }`
- [x] 1.2 在 Chrome DevTools MCP 中驗證：有 dialog 的 slot 保留顯示，無 dialog 的 slot 被隱藏
- [x] 1.3 端對端實測：zen mode 下點圖 → lightbox 顯示 → Esc 關閉 → 回 zen article

## 2. Zen state machine fix

- [x] 2.1 在 `background.js` 引入 `tweetIdFromUrl(urlStr)` 輔助函式
- [x] 2.2 將 `zenTabs` 從 `Set<tabId>` 改為 `Map<tabId, tweetId>`；`onClicked` 進入 zen 時記錄 `tweetIdFromUrl(tab.url)`
- [x] 2.3 改寫 `tabs.onUpdated` listener：只在 `changeInfo.url` 的 tweet ID 與目前紀錄不同時才 `zenTabs.delete`
- [x] 2.4 實測：zen → 點圖 → 關圖 → 點 icon → 正確退出 zen（不再回到 zen 初始狀態）

## 3. Action button scope + lightbox auto-close

- [x] 3.1 `background.js` 的 `declarativeContent` 加上第二個 `PageStateMatcher`：`pathContains: '/article/'`
- [x] 3.2 `onClicked` handler 末尾加：若 `tab.url.includes('/media/')`，toggle 完後 `chrome.scripting.executeScript({ func: () => history.back() })`
- [x] 3.3 實測：在 lightbox 中點 icon → zen toggle + lightbox 自動關閉 → 立即看到新狀態

## 4. Extract pure logic for testability

- [x] 4.1 建立 `zen-state.js`，以 UMD pattern 輸出 `tweetIdFromUrl` 與 `shouldClearZenState(prevTweetId, changeInfoUrl)`
- [x] 4.2 `background.js` 改用 `importScripts('zen-state.js')` 載入，移除 inline 實作
- [x] 4.3 確認 service worker 仍正常啟動（classic mode，無需 manifest type: module）

## 5. Unit tests

- [x] 5.1 新增 `tests/zen-state.test.js`，用 `node:test` 寫 13 個 cases（`tweetIdFromUrl` × 7、`shouldClearZenState` × 6）
- [x] 5.2 `package.json` 新增 `test:unit` script：`node --test tests/*.test.js`
- [x] 5.3 跑 `npm run test:unit`，確認 13/13 通過

## 6. Lightbox regression e2e test

- [x] 6.1 新增 `tests/lightbox.spec.js`：注入 zen → 點圖 → 斷言 `#layers [role="dialog"]` 可見；按 Esc → 斷言狀態復原
- [x] 6.2 `playwright.config.js` 加 `testMatch: /\.spec\.js$/`，避免 unit test 被 Playwright 誤執行
- [x] 6.3 `package.json` 加 `test:e2e` script；`test` 合併兩者
- [x] 6.4 跑 `npm test`，確認 unit 13/13 + e2e 17/17 全綠

## 7. Release preparation

- [x] 7.1 `manifest.json` bump 到 1.2.0
- [x] 7.2 重新打包 `zenx-v1.2.0.zip`（送審的 zip 使用 inline 邏輯版的 background.js；行為等同）
- [x] 7.3 `store/description.txt` 更新：修 `x.com//status/` typo、`floating layers` → `floating drawers`、新增「點圖開原生檢視」說明
- [x] 7.4 `git push` 三個 commit（CSS 修正 + state machine / action button 擴大 + B2 自動關 lightbox + 版本 bump）

## 8. Hard reload: verify __zenx marker before treating tab as zen

- [x] 8.1 `background.js` `onClicked` handler：若 `zenTabs.has(tab.id)`，先用 `chrome.scripting.executeScript` 探 `typeof window.__zenx !== 'undefined'`；不存在就 `zenTabs.delete`
- [x] 8.2 更新 `zen-toggle` spec 的 `Per-tab state tracking` 需求，新增「Hard reload followed by icon click」scenario
- [x] 8.3 更新 `design.md` 的 hard-reload 風險條目為「已用 probe 解決」
- [x] 8.4 `npm test` 全綠（unit 13/13、e2e 17/17）
