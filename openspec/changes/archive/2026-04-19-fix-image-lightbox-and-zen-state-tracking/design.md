## Context

Zen mode 的 CSS 和 background service worker 原本把 X.com 視為靜態頁面，沒有處理 X 作為 SPA 時在同一篇推文內的路由切換（主要場景是點圖 → push `/article/<id>/media/<mediaId>` → 關圖 → pop 回原路徑）。這類導航會：
1. 在 `#layers` 中插入一個 `[role="dialog"]` 節點（lightbox）。
2. 觸發 `chrome.tabs.onUpdated` 一次 `status: 'loading'` + URL 變更。

原本的 CSS 把整個 `#layers` 藏掉，原本的 background listener 把任何 `status: 'loading'` 視為「頁面換了」而清空 zenTabs——兩個決定分別造成了「lightbox 看不到」與「退出 zen 失敗」兩個 bug。

## Goals / Non-Goals

**Goals:**
- 在 zen mode 下保留 X 的原生 image lightbox 行為（點圖可見、Esc 可關）。
- Zen 狀態在同一篇推文的 SPA 導航之間穩定，不被誤清。
- Action 按鈕在 lightbox 網址（`/article/`）也能點，且點了之後使用者能**立即看到結果**。
- 核心狀態邏輯可測試（純函式 + unit test），回歸測試涵蓋 lightbox 可見性。

**Non-Goals:**
- 不重寫 zen mode 的 CSS/JS 注入模型（保留 `chrome.scripting.insertCSS / executeScript` + `window.__zenx` savedStyles）。
- 不支援多推文之間的 zen 狀態保留（跨推文導航仍會重置）。
- 不用 `webNavigation` API（避免新增 host permission）。
- 不處理 hard reload 後 zen 狀態偏差（接受第一次點擊 no-op 的降級）。

## Decisions

### D1: 用 `:has()` 留住 `#layers` 中的 dialog

**選項**：
- A. `#layers { display: none }`（原本；殺太重）
- B. `#layers > div:not(:has([role="dialog"])) { display: none }` ← 採用
- C. 改用 JS 監聽 dialog 出現再解除隱藏

**理由**：X 在 `#layers` 之下用獨立 `<div>` 裝 drawer（Grok、chat、BottomBar）vs. dialog（lightbox 等 modal）。`:has()` 直接對應這個結構，聲明式、零 runtime 成本。C 方案需要 MutationObserver，多了一個狀態來源。`:has()` 在 Chromium 105+ 支援，對 MV3 擴充套件的目標版本無問題。

### D2: 以「推文 ID」作為 zen 狀態保留的判準

**選項**：
- A. 任何 `status: 'loading'` 都清 zenTabs（原本；錯殺 SPA nav）
- B. 用 `webNavigation.onCommitted` 的 `transitionType` 過濾（要新權限）
- C. 在 `tabs.onUpdated` 比對新舊 URL 的 tweet ID，不同才清 ← 採用

**理由**：C 不用新權限、涵蓋所有 SPA pushState 場景（lightbox、photo、focus mode 等同推文內切換）。tweet ID 從 `/(?:status|article)/(\d+)/` regex 抽出，對 `/status/<id>`、`/article/<id>`、`/article/<id>/media/<mediaId>`、`/status/<id>/photo/1` 都一致。

### D3: Lightbox 中 toggle zen 自動關 lightbox

**選項**：
- A. Action 按鈕在 lightbox 時 disable（宣告式簡單，但使用者會困惑）
- B. Toggle zen 後停留在 lightbox（視覺上看不到變化，感覺按鈕壞了）
- C. Toggle zen 後用 `history.back()` 關 lightbox ← 採用

**理由**：C 給使用者立即的視覺回饋（看到 zen 進/退狀態），關閉路徑與 Esc 等價。實作僅一行：當 `tab.url.includes('/media/')` 時，toggle 完 `chrome.scripting.executeScript(history.back)`。

### D4: 純函式抽到 `zen-state.js`（UMD）

**選項**：
- A. 保留 inline（不可測）
- B. 改 `"type": "module"` + ES module import（要動 manifest；改動面大）
- C. 抽出獨立檔，UMD pattern：service worker 用 `importScripts`，Node 用 `require` ← 採用

**理由**：C 最小動。`importScripts` 是 classic service worker 原生支援，不動 manifest。Node 側用 `require` 呼叫 `zen-state.js`，同一份原始碼兩邊跑。

## Risks / Trade-offs

- **`:has()` 相容性**：Chrome 105+ 才支援。[Risk] 低版本 Chrome 使用者會看到 drawer 露出 → Mitigation：MV3 基準已遠高於 105，實務不影響。
- **Hard reload 後狀態偏差**：reload 會吹掉 injected CSS/JS，但 URL 不變、tweet ID 相同，`zenTabs` 不會在 `tabs.onUpdated` 被清。[Risk] `zenTabs` 與頁面實際狀態不一致 → Mitigation：在 `onClicked` 開頭用 `chrome.scripting.executeScript` 探 `window.__zenx` 是否存在，缺失就清 `zenTabs` 當作未進 zen。相較於引入 `webNavigation` 權限，少改 manifest、審查面小、不需新權限，代價僅多一次輕量 executeScript（ms 級）。
- **`history.back()` 在複雜歷史下行為**：若使用者在 lightbox 中又多走了幾步（例如切到別張圖），`history.back()` 只回退一步。[Risk] 可能只關閉最後一個 media step → Mitigation：可接受，符合瀏覽器直覺。
- **`importScripts` + 額外檔案打包**：release zip 需包含 `zen-state.js`。[Risk] 忘記加檔 → service worker 啟動即爆 → Mitigation：release 打包指令維護好，並在 README / CLAUDE.md 寫清楚。

## Migration Plan

- 版本從 1.1.0 → 1.2.0（minor，因為擴大了 action 按鈕的 URL 範圍）。
- 使用者不需任何手動操作，更新後行為即改善。
- 回退：若 1.2.0 出問題，Web Store 可直接退回 1.1.0；本地開發以 git revert 三個 commit（CSS / background / B2）即可。

## Open Questions

無。
