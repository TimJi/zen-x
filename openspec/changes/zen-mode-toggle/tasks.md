## 1. Background 邏輯

- [x] 1.1 修改 background.js：加入 `zenTabs` Set 追蹤 zen 狀態的 tab
- [x] 1.2 修改點擊邏輯：不在 Set 中 → 注入 CSS + JS 並加入 Set；已在 Set 中 → reload 頁面並移除
- [x] 1.3 監聽 chrome.tabs.onRemoved，tab 關閉時從 Set 清理
- [x] 1.4 監聽 chrome.tabs.onUpdated，頁面 reload/導航時從 Set 清理

## 2. 測試驗證

- [x] 2.1 手動測試：進入 zen → 再點一次 → 頁面 reload 恢復原狀
