## Context

ZenX is a Chrome extension that injects CSS and JS into X.com article pages to create a distraction-free reading mode. Currently, `zen-mode.js` runs as an IIFE that directly mutates DOM elements (inline styles) and creates a MutationObserver. `zen-mode.css` is injected via `chrome.scripting.insertCSS`. When deactivating, `background.js` calls `chrome.tabs.reload()` — a blunt approach that loses all page state.

The JS mutations include:
- Setting `maxWidth`/`width` on primaryColumn ancestors
- Modifying `img.css-9pa8cd` styles (opacity, position, width, height) and hiding siblings
- Hiding sticky/fixed nav bar ancestor of `app-bar-back`
- Hiding Premium banners via `[role="status"]`
- Hiding quotes link container and Grok/caret button container
- Creating a MutationObserver on `document.body`
- Scrolling to top

## Goals / Non-Goals

**Goals:**
- Deactivate zen mode by reversing all DOM changes in-place (no reload)
- Remove injected CSS cleanly via `chrome.scripting.removeCSS`
- Disconnect the MutationObserver on deactivate
- Scroll to top on deactivate (same as activate)

**Non-Goals:**
- Changing what zen mode hides/shows (visual behavior stays the same)
- Supporting partial restore (it's all-or-nothing)
- Persisting zen state across page navigation

## Decisions

### 1. Snapshot-and-restore pattern for inline styles

**Decision**: Before each `element.style.X = ...` mutation, save the original value in an array. On restore, iterate the array and write back original values.

**Alternative considered**: Using `element.style.cssText` to snapshot entire inline style — risks overwriting styles changed by X.com's own JS between activate and deactivate.

**Rationale**: Per-property save is more surgical and less likely to cause side effects.

### 2. Store state on `window.__zenx`

**Decision**: Attach a `window.__zenx` object containing `{ savedStyles: [], observer: MutationObserver, scrollY: number }`. The restore script reads and clears this object.

**Alternative considered**: Using `chrome.storage.session` — adds async complexity for data that only lives within a single page session.

**Rationale**: `window.__zenx` is simple, synchronous, and automatically cleaned up on navigation. The content script already runs in the page's world (via `chrome.scripting.executeScript`).

### 3. Separate restore script (`zen-restore.js`)

**Decision**: Create a new `zen-restore.js` file that `background.js` executes on deactivate, rather than embedding restore logic inside `zen-mode.js`.

**Alternative considered**: Making `zen-mode.js` a toggle (check `window.__zenx` to decide activate vs restore) — mixes concerns and makes the activate path harder to read.

**Rationale**: Separation of concerns. Each script has a single responsibility.

### 4. Use `chrome.scripting.removeCSS` for CSS cleanup

**Decision**: Call `chrome.scripting.removeCSS` with the same `files: ['zen-mode.css']` used during insertion. This is the inverse API provided by Chrome.

**Rationale**: Clean, official API. No need to track injected style elements manually.

### 5. CSS vs JS restore 分工

**Decision**: Deactivate 時分兩層復原，各自負責不同的視覺變更：

**`removeCSS` 自動復原（不需要 JS 介入）：**
- 隱藏留言區（cellInnerDiv :not(:first-child)）
- 第一個 cellInnerDiv 的 position/transform 覆寫
- 虛擬滾動容器高度（Timeline aria-label）
- 隱藏左側導航（header[role="banner"]）
- 隱藏右側側邊欄（sidebarColumn）
- 隱藏浮動按鈕（#layers）
- 隱藏互動按鈕列（[role="group"]）
- 隱藏回覆輸入框（inline_reply_offscreen）
- primaryColumn 寬度與置中

**`zen-restore.js` 手動復原（inline style 變更）：**
- primaryColumn 祖先元素的 maxWidth/width
- 圖片樣式修正（img.css-9pa8cd 及其 parent/siblings）
- sticky/fixed 導航列的 display
- Premium 廣告橫幅的 display
- quotes link 容器的 display
- Grok/caret 按鈕容器的 display
- 捲動位置


**Rationale**: 這個分工讓 `zen-restore.js` 只需處理 JS 造成的 inline style 變更，大幅降低復原邏輯的複雜度。CSS 規則移除後瀏覽器會自動回到原始樣式，不需要額外處理。

### 6. 維持現有 CSS Timeline 容器規則

**Decision**: 保留 `zen-mode.css` 中 Timeline 容器的 `height: auto` / `min-height: auto` / `overflow: hidden` 規則不變。

**Background**: 經實測（長文 20477px），現有的 `height: auto + overflow: hidden` 並未觸發 X.com 的自動載入。捲到底部等待 8 秒後，cellInnerDiv 數量和頁面高度均未變化。

**Rationale**: 現有做法已經可用，不需要額外的 scroll clamp 機制。如果未來 X.com 改變行為導致自動載入被觸發，再改為 scroll clamp 方案。

### 7. 維持預設 ISOLATED world

**Decision**: `zen-mode.js` 和 `zen-restore.js` 都使用 `chrome.scripting.executeScript` 的預設 ISOLATED world，不指定 `world` 參數。

**Alternative considered**: 使用 `world: 'MAIN'` 直接在頁面 JS 環境執行——但 `window.__zenx` 會暴露給 X.com 的程式碼，有被意外覆蓋的風險。

**Rationale**: ISOLATED world 中同一 tab 的多次 executeScript 共享同一個 JS context，`zen-restore.js` 可以存取 `zen-mode.js` 設定的 `window.__zenx`。同時 ISOLATED world 可以完整操作 DOM，element references 在兩個 script 間保持有效。不需要額外設定，也避免與 X.com 全域變數衝突。

## Risks / Trade-offs

- **X.com may mutate styles between activate/deactivate** → Mitigation: We restore only the properties we changed, not the entire style string. X.com's own changes to other properties are preserved.
- **MutationObserver may have already modified elements we didn't track** → Mitigation: The observer only hides Premium banners, which we'll explicitly restore.
- **`window.__zenx` could theoretically conflict with page scripts** → Mitigation: Double-underscore prefix + unique name makes collision extremely unlikely.
- **Scroll position**: Both activate and deactivate scroll to top for a clean, predictable experience.
