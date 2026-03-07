## 1. Refactor zen-mode.js to track DOM mutations

- [x] 1.1 Initialize `window.__zenx = { savedStyles: [], observer: null, scrollY: 0 }` at the top of the IIFE
- [x] 1.2 Create a helper function `saveAndSet(el, prop, value, priority)` that saves original style to `savedStyles` then applies the new value
- [x] 1.3 Replace all direct `el.style.X = ...` and `el.style.setProperty(...)` calls with `saveAndSet`
- [x] 1.4 Save `window.scrollY` into `window.__zenx.scrollY` before `window.scrollTo(0, 0)`
- [x] 1.5 Store the MutationObserver instance in `window.__zenx.observer`
- [x] 1.6 Ensure the MutationObserver callback also uses `saveAndSet` for Premium banner hiding

## 2. Create zen-restore.js

- [x] 2.1 Create `zen-restore.js` that reads `window.__zenx.savedStyles` and restores each entry's original style value
- [x] 2.2 Disconnect `window.__zenx.observer` if it exists
- [x] 2.3 Restore scroll position via `window.scrollTo(0, window.__zenx.scrollY)`
- [x] 2.4 Delete `window.__zenx` from the window object after restore

## 3. Update background.js toggle-off logic

- [x] 3.1 Replace `chrome.tabs.reload(tab.id)` with `chrome.scripting.executeScript` to run `zen-restore.js`
- [x] 3.2 Add `chrome.scripting.removeCSS({ target: { tabId: tab.id }, files: ['zen-mode.css'] })` after restore script execution

## 4. Testing

- [x] 4.1 Manually verify: activate zen mode, then deactivate — page should restore without reload
- [x] 4.2 Verify scroll position is restored after deactivate
- [x] 4.3 Verify MutationObserver is disconnected (no console errors after deactivate)
- [x] 4.4 Verify re-activating zen mode after a restore cycle works correctly
- [x] 4.5 Update or add Playwright tests for the new toggle-off behavior
