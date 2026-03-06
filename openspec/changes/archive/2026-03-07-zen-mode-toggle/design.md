## Context

目前 ZenX 的 action 按鈕每次點擊都會注入 CSS 和執行 JS，屬於單向操作。使用者若想恢復原始介面只能重新整理頁面。需要加入 toggle 機制，讓第二次點擊可以還原。

## Goals / Non-Goals

**Goals:**
- 點擊 action 按鈕可在 zen mode 開/關之間切換
- 離開 zen mode 時透過 reload 頁面完整還原
- 狀態追蹤以 per-tab 為單位

**Non-Goals:**
- 不做 DOM 逆向還原（複雜度高，改用 reload）
- 不做跨 session 持久化（reload 後狀態重置為 off）
- 不做動畫過渡效果
- 不更換 icon 樣式來反映狀態（未來可做）

## Decisions

### Decision 1: 用 background.js 追蹤 tab 狀態

在 background.js 維護一個 `Set<tabId>` 記錄哪些 tab 處於 zen mode。點擊時：
- 不在 Set 中 → 注入 CSS + JS（進入 zen）
- 已在 Set 中 → reload 頁面（離開 zen）

Tab 關閉時從 Set 移除（監聽 `chrome.tabs.onRemoved`）。

**替代方案**：用 `chrome.storage.session` 持久化狀態 → 過度設計，Set 足夠。

### Decision 2: 離開 zen 用 reload 而非 DOM 還原

zen-mode.js 的 DOM 操作涉及大量遍歷和 inline style 修改，完美逆向成本高且不可靠。`chrome.tabs.reload()` 簡單、100% 可靠，使用者體驗也可接受（跟手動 F5 一樣）。

**替代方案**：建立 zen-mode-restore.js 做 DOM 還原 → 複雜度高，X.com 動態渲染可能導致還原不完全。

## Risks / Trade-offs

- **[Trade-off] Reload 會短暫白屏**：頁面重新載入約 1-2 秒 → 可接受，比不完美的 DOM 還原好
- **[Trade-off] Reload 後會回到頁面頂部**：使用者閱讀位置會丟失 → 可接受，離開 zen 代表讀完了
