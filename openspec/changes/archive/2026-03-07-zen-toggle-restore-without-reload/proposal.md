## Why

Currently, deactivating ZenX requires reloading the entire page (`chrome.tabs.reload`). This destroys the user's scroll position, any in-progress compose drafts, and causes a visible flash — a poor experience. The toggle should restore the original DOM state in-place without a page reload.

## What Changes

- **zen-mode.js** will save original DOM state (inline styles, hidden elements) before making changes, and expose an undo function that restores them
- **zen-mode.css** will be injected/removed via `chrome.scripting.insertCSS` / `removeCSS` instead of relying on page reload to clear it
- **background.js** toggle-off path will call a restore script and remove CSS instead of reloading the page
- The MutationObserver created during zen activation will be disconnected on restore

## Capabilities

### New Capabilities
- `zen-mode-restore`: Save and restore original DOM state when exiting zen mode without page reload

### Modified Capabilities
- `zen-toggle`: Deactivate scenario changes from "reload page" to "run restore script and remove CSS"
- `zen-mode-injection`: zen-mode.js must track all DOM mutations it performs so they can be reversed

## Impact

- **background.js**: Toggle-off logic changes from `chrome.tabs.reload` to `chrome.scripting.removeCSS` + `chrome.scripting.executeScript` (restore script)
- **zen-mode.js**: Must save original inline styles before overwriting, store references to hidden elements, and expose restoration logic
- **zen-mode.css**: No content changes, but injection/removal mechanism changes
- **manifest.json**: No changes expected (already has `scripting` permission)
