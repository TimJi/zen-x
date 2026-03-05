## Context

ZenX Extension 依賴多個 X.com 的 DOM selector（`data-testid`、`role`、`aria-label` 等）。X.com 是 SPA 架構，DOM 結構可能隨版本更新而變動。需要每日自動化測試來偵測這些變動。

## Goals / Non-Goals

**Goals:**
- 每天自動檢查 X.com 文章頁面的 DOM 結構是否仍相容
- 檢測到問題時透過 GitHub Issue 和 email 通知
- Issue 不重複開啟，連續失敗以 comment 追蹤，恢復時自動關閉

**Non-Goals:**
- 不自動修復壞掉的 selector
- 不做 X.com 登入（先用未登入狀態測試）
- 不測試非文章頁面

## Decisions

### 1. 使用 Playwright 作為測試框架

**選擇**: Playwright headless Chromium，直接在 GitHub Action runner 上執行。

**理由**: 需要完整的瀏覽器環境來渲染 X.com SPA；Playwright 支援 CSS injection 和 script evaluation；GitHub Action 原生支援。

**替代方案**:
- Puppeteer — 功能類似但 Playwright 社群更活躍
- curl + cheerio — 無法渲染 SPA

### 2. 測試分兩層

**選擇**:
- Layer 1: Selector 檢查 — 載入頁面後用 `page.locator()` 確認所有依賴 selector 存在
- Layer 2: 注入測試 — 用 `page.addStyleTag()` 和 `page.evaluate()` 注入 zen-mode，驗證元素被隱藏、寬度正確

**理由**: Layer 1 快速定位哪個 selector 壞了；Layer 2 驗證整體功能仍正常。

### 3. Issue 去重機制

**選擇**: 測試失敗時用 `gh` CLI 搜尋標題含 `[ZenX Monitor]` 的 open issue。存在則加 comment，不存在則開新 issue。測試通過時搜尋並關閉對應 issue。

**理由**: 簡單、不需要額外狀態儲存、用 GitHub 原生 API 即可實現。

### 4. 測試用的文章 URL

**選擇**: 硬編碼 2-3 個高能見度的公開推文 URL 作為測試目標（如 @elonmusk 的釘選推文）。如果全部 404 則測試標記為 skip 而非 fail。

**理由**: 需要穩定存在的公開文章頁面。多個 URL 作為 fallback 避免單一推文被刪。

## Risks / Trade-offs

- **X.com 要求登入** → 未登入可能無法取得完整 DOM。緩解：先用公開頁面，失敗時在 Issue 中標記「可能需要登入」。
- **推文被刪除** → 測試目標消失。緩解：多個 fallback URL，全部失敗時 skip 不 fail。
- **GitHub Action 被 rate limit** → 一天一次應不會觸發。
