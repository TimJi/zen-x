## Why

Zen mode 有兩個互相關聯的 bug：
1. 在 zen mode 下點擊文章圖片，URL 變了（`/article/<id>/media/<mediaId>`）但 lightbox 沒出現。使用者體驗是「看不到回應」。
2. 開關 lightbox 後點 action 圖示，**預期退出 zen、實際卻回到 zen 初始狀態**（包含 scroll to top）。等同於 zen 模式「卡住」。

兩者都源自當時未考慮 X.com 在同一篇推文中的 SPA 導航（圖片 lightbox 走的是 pushState 路徑）。

## What Changes

- **`#layers` 隱藏規則改寫**：從整個 `#layers { display: none }` 改成 `#layers > div:not(:has([role="dialog"])) { display: none }`。保留 X 渲染在 `#layers` 的 lightbox `[role="dialog"]`，只隱藏浮動 drawers（Grok / chat / BottomBar）。
- **Zen 狀態以「推文 ID」追蹤**：background.js 原本在 `tabs.onUpdated` 收到 `status: 'loading'` 就清 `zenTabs`，X 的 SPA pushState 也會觸發這個事件造成誤清。改為記住進入 zen 時的 tweet ID，**只在 URL 換到不同推文（或離開 x.com 推文脈絡）才清除狀態**。
- **Action 按鈕在 lightbox 中可點**：`declarativeContent` 從只匹配 `/status/` 擴大到同時匹配 `/article/`，涵蓋 lightbox 的 URL。
- **Lightbox 中切換 zen 會自動關 lightbox**：讓使用者立即看到 zen 狀態變化（否則視覺上毫無反應）。用 `history.back()` 實作。
- **抽出純邏輯、加測試**：`tweetIdFromUrl` 與 `shouldClearZenState` 移到 `zen-state.js`（UMD），service worker 用 `importScripts`、Node 用 `require` 都能載入。新增 13 個 unit tests（`node:test`）與 3 個 Playwright lightbox 回歸測試。

## Capabilities

### New Capabilities

無。

### Modified Capabilities

- `zen-toggle`：新增 SPA 導航下的狀態保留規則、action 按鈕的 URL 匹配擴大、lightbox 自動關閉行為。
- `zen-mode-injection`：`#layers` 的隱藏規則改為「只隱藏不含 dialog 的 slot」。
- `dom-test-suite`：新增 state machine unit tests 與 lightbox 回歸測試兩類。

## Impact

- **Code**：
  - `zen-mode.css` — `#layers` 規則
  - `background.js` — state map、declarativeContent、action handler、onUpdated listener
  - `zen-state.js`（新增）— 純函式模組
  - `manifest.json` — version bump 1.1.0 → 1.2.0
  - `tests/zen-state.test.js`（新增）、`tests/lightbox.spec.js`（新增）
  - `package.json` — `test:unit` / `test:e2e` 分離
  - `playwright.config.js` — `testMatch: *.spec.js`
- **Dependencies**：無新增。Node 內建 `node:test` 作為 unit test runner。
- **Release**：`manifest.json` 版本 1.2.0；release zip 需包含新檔 `zen-state.js`（`zenx-v1.2.0.zip` 送審版本仍為 inline 版，行為相同，已送審不需重新上傳）。
- **Store listing**：`store/description.txt` 輕微更新（修 typo、加「點擊圖片可開啟原生檢視」說明）。
