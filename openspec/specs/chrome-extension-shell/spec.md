## Purpose

Define the Chrome Manifest V3 packaging and permission surface for the ZenX extension — manifest structure, permissions required, action button, service worker entry point, and how script injection is scoped.

## Requirements

### Requirement: Extension manifest uses Manifest V3
Extension SHALL use Chrome Manifest V3 format with the following configuration:
- `manifest_version`: 3
- `permissions`: `activeTab`, `scripting`, `declarativeContent`
- `action`: 定義 browser action 按鈕與圖示
- `background`: 指定 service worker
- `homepage_url`: 指向 GitHub repository URL

#### Scenario: Valid manifest structure
- **WHEN** manifest.json is loaded by Chrome
- **THEN** Chrome SHALL recognize it as a valid Manifest V3 extension with action button, service worker, and homepage URL

### Requirement: Browser action triggers script injection
Extension SHALL provide a browser action button in Chrome toolbar. When clicked, the background service worker SHALL toggle zen mode: if not active, inject zen-mode CSS and JS; if already active, reload the page.

#### Scenario: User clicks extension button to activate zen mode
- **WHEN** user is on an `x.com/*/status/*` page, zen mode is not active, and clicks the extension icon
- **THEN** background service worker SHALL call `chrome.scripting.insertCSS` and `chrome.scripting.executeScript` with zen-mode files, and record the tab as active

#### Scenario: User clicks extension button to deactivate zen mode
- **WHEN** user is on an `x.com/*/status/*` page, zen mode is active, and clicks the extension icon
- **THEN** background service worker SHALL call `chrome.tabs.reload()` and remove the tab from active tracking

### Requirement: Action button only enabled on article pages
Extension SHALL enable the action button only when the active tab URL matches `x.com/*/status/*` pattern. On all other pages, the button SHALL be grayed out and non-clickable.

#### Scenario: User navigates to X.com article page
- **WHEN** user navigates to a URL matching `x.com/*/status/*`
- **THEN** the extension action button SHALL become enabled and clickable

#### Scenario: User navigates to non-article page
- **WHEN** user is on X.com homepage, profile page, or any non-article URL
- **THEN** the extension action button SHALL be grayed out and non-clickable

### Requirement: Extension includes icon assets
Extension SHALL include icon files at 16x16, 48x48, and 128x128 pixel sizes referenced in the manifest.

#### Scenario: Extension installed in Chrome
- **WHEN** extension is installed
- **THEN** Chrome SHALL display the 16px icon in the toolbar and 128px icon in the extensions management page
