## 1. Extension 基礎架構

- [x] 1.1 建立 manifest.json（Manifest V3，含 permissions: activeTab + scripting，action 設定，background service worker）
- [x] 1.2 建立 background.js（監聽 action click，呼叫 chrome.scripting.insertCSS 和 chrome.scripting.executeScript；設定 URL 規則僅在 x.com/*/status/* 頁面啟用按鈕）
- [x] 1.3 建立「Z」字 Extension icon 圖示檔案（icon16.png、icon48.png、icon128.png）

## 2. Zen Mode 腳本

- [x] 2.1 建立 zen-mode.css（宣告 CSS 變數 --zen-content-max-width: 890px 和 --zen-content-width: 61.8vw；從現有腳本抽取所有 CSS 規則：隱藏留言區、側邊欄、導航欄、浮動層、互動按鈕、回覆輸入框、虛擬滾動容器修正；內容區域以黃金比例寬度置中）
- [x] 2.2 建立 zen-mode.js（從現有腳本抽取所有 DOM 操作：全寬展開、圖片修正、sticky 導航列隱藏、Premium 橫幅隱藏、quotes/Grok 隱藏、MutationObserver、捲動至頂部）

## 3. 測試驗證

- [x] 3.1 在 Chrome 載入未封裝的 Extension，點擊圖示驗證 X.com 文章頁面的 Zen 模式效果
