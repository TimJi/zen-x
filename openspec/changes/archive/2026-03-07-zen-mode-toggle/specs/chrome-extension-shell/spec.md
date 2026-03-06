## MODIFIED Requirements

### Requirement: Browser action triggers script injection
Extension SHALL provide a browser action button in Chrome toolbar. When clicked, the background service worker SHALL toggle zen mode: if not active, inject zen-mode CSS and JS; if already active, reload the page.

#### Scenario: User clicks extension button to activate zen mode
- **WHEN** user is on an `x.com/*/status/*` page, zen mode is not active, and clicks the extension icon
- **THEN** background service worker SHALL call `chrome.scripting.insertCSS` and `chrome.scripting.executeScript` with zen-mode files, and record the tab as active

#### Scenario: User clicks extension button to deactivate zen mode
- **WHEN** user is on an `x.com/*/status/*` page, zen mode is active, and clicks the extension icon
- **THEN** background service worker SHALL call `chrome.tabs.reload()` and remove the tab from active tracking
