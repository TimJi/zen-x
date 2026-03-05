## Why

X.com (Twitter) 的文章頁面充滿干擾元素（側邊欄、留言區、互動按鈕、廣告橫幅等），使用者難以專注閱讀單篇文章內容。目前已有一段可在瀏覽器 console 執行的清理腳本，需要包裝成 Chrome Extension，讓使用者一鍵啟用 Zen 閱讀模式。

## What Changes

- 將現有的 console 腳本包裝為 Chrome Extension（Manifest V3）
- 提供 browser action 按鈕，點擊後在當前 X.com 文章頁面注入清理腳本
- 腳本功能包含：
  - 隱藏留言區（僅保留原始文章）
  - 隱藏左側導航欄、右側側邊欄
  - 隱藏浮動按鈕層、互動按鈕列、回覆輸入框
  - 文章欄位擴展至全寬
  - 修正圖片顯示
  - 隱藏置頂導航列、Premium 廣告橫幅、Grok 按鈕等干擾元素
  - 透過 MutationObserver 持續清理動態插入的廣告
  - 自動捲動至頁面頂部

## Capabilities

### New Capabilities
- `chrome-extension-shell`: Chrome Extension 的基礎架構（manifest.json、background service worker、popup 或 action 觸發機制）
- `zen-mode-injection`: 將現有清理腳本作為 content script 注入 X.com 文章頁面的能力

### Modified Capabilities
<!-- 無既有能力需要修改 -->

## Impact

- 新增 Chrome Extension 所需的檔案結構（manifest.json、background.js、content script、icons）
- 僅作用於 x.com 網域，不影響其他網站
- 無外部依賴，純前端 JavaScript + CSS
