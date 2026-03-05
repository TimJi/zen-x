## Context

目前已有一段完整的 JavaScript 腳本，可在 X.com 文章頁面的瀏覽器 console 中執行，達到清理介面的效果。專案需要將此腳本包裝成 Chrome Extension（Manifest V3），讓使用者透過工具列按鈕一鍵觸發，無需手動開啟 DevTools。

現有腳本包含兩部分：
1. **CSS 注入**：透過 `<style>` 標籤持久化隱藏規則（留言區、側邊欄、導航欄等）
2. **DOM 操作**：JavaScript 遍歷 DOM 處理全寬展開、圖片修正、特定元素隱藏、MutationObserver 持續清理

## Goals / Non-Goals

**Goals:**
- 將現有腳本以最小改動包裝為可安裝的 Chrome Extension
- 使用者點擊 Extension 圖示即可在當前 X.com 文章頁面啟用 Zen 模式
- 僅在 `x.com/*/status/*` 文章頁面啟用按鈕，其他頁面灰顯不可點
- 使用 Manifest V3 規範，符合 Chrome Web Store 上架要求

**Non-Goals:**
- 不做設定頁面或自訂選項（v1 僅提供一鍵開關）
- 不做 toggle 關閉功能（重新整理頁面即恢復）
- 不做自動偵測文章頁面後自動啟用
- 不支援 Firefox 或其他瀏覽器
- 不重構現有腳本邏輯

## Decisions

### 1. 使用 Manifest V3 的 `scripting.executeScript` API

**選擇**: 點擊 browser action 時透過 background service worker 呼叫 `chrome.scripting.executeScript()` 注入腳本。

**理由**: 比起 content_scripts 自動注入，手動觸發更符合「使用者主動啟用」的需求。不需要在每個 X.com 頁面都自動執行，節省資源也避免干擾正常瀏覽。

**替代方案**:
- content_scripts 自動注入 — 會在所有 X.com 頁面自動執行，不符合「按需啟用」
- popup.html 中觸發 — 多一層 UI，不必要

### 2. 僅在文章頁面啟用按鈕

**選擇**: 使用 `chrome.declarativeContent` 或 `chrome.tabs.onUpdated` 監聽 URL，僅在符合 `x.com/*/status/*` 格式時啟用 action 按鈕，其他頁面灰顯不可點擊。

**理由**: 讓使用者一眼就知道何時可用，避免在非文章頁面誤觸。

**替代方案**:
- 不限制，任何頁面都可點 — 功能上無害但體驗不佳

### 3. 腳本拆分為獨立檔案

**選擇**: 將 CSS 和 JS 邏輯拆為 `zen-mode.css` 和 `zen-mode.js`，透過 `scripting.insertCSS` + `scripting.executeScript` 分別注入。

**理由**: CSS 和 JS 分離更易維護；`insertCSS` 比 JS 動態建立 `<style>` 更乾淨。

**替代方案**:
- 保持原始 IIFE 結構不拆分 — 可行但維護性差

### 4. 黃金比例閱讀寬度

**選擇**: 內容區域使用 `max-width: 890px; width: 61.8vw` 置中顯示，以 CSS 變數宣告：
```css
:root {
  --zen-content-max-width: 890px;
  --zen-content-width: 61.8vw;
}
```

**理由**: 890px ≈ 1440/φ，大螢幕閱讀舒適；61.8vw 讓小螢幕按比例縮放；CSS 變數方便日後調整。

**替代方案**:
- 固定 100% 全寬 — 寬螢幕閱讀體驗差
- 固定 680px（Medium 風格） — 對寬螢幕偏窄

### 5. 圖示設計

**選擇**: 使用「Z」字文字 icon，生成 16/48/128px 三種尺寸。

**理由**: 簡潔，與 ZenX 品牌一致，v1 先用 placeholder，後續可替換。

### 6. 檔案結構

```
zen-x/
  manifest.json
  background.js
  zen-mode.css
  zen-mode.js
  icons/
    icon16.png
    icon48.png
    icon128.png
```

扁平結構，簡單直接，不需要建置工具。

## Risks / Trade-offs

- **X.com DOM 結構變更** → 腳本選擇器可能失效。緩解：CSS 選擇器使用 `data-testid` 等穩定屬性，比 class 名稱更不易變動。
- **Manifest V3 權限審核** → `activeTab` + `scripting` 權限應足夠，不需要 `<all_urls>`，降低審核風險。
- **多語系 aria-label** → 現有腳本已處理中文、英文、日文的 Timeline label 變體，但其他語言可能遺漏。緩解：v1 先支援主要語言，後續可擴充。
