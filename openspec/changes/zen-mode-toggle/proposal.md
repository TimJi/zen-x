## Why

目前 ZenX 只有「進入 Zen 模式」的單向操作，使用者點擊按鈕後無法恢復原始介面，只能手動重新整理頁面。加入 toggle 功能讓使用者可以再次點擊按鈕離開 Zen 模式，提升使用體驗。

## What Changes

- 修改 `background.js`：用 Set 追蹤每個 tab 的 zen 狀態，第二次點擊時 reload 頁面還原
- 監聽 tab 關閉與 reload 事件，自動清理狀態

## Capabilities

### New Capabilities
- `zen-toggle`: 點擊 action 按鈕可切換 zen mode 開/關，包含 per-tab 狀態追蹤

### Modified Capabilities
- `chrome-extension-shell`: background.js 的點擊行為從「注入」改為「toggle」

## Impact

- `background.js`：需維護 per-tab zen 狀態，點擊邏輯改為 toggle
- `zen-mode.js`：不需修改
- `zen-mode.css`：不需修改
