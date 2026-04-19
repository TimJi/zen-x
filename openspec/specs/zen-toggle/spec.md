## Purpose

Define when and how the action button toggles zen mode: URL scope where the button is enabled, per-tab state tracking across SPA and hard-reload navigations, and the lightbox auto-close affordance.

## Requirements

### Requirement: Toggle zen mode on and off
The extension SHALL toggle zen mode when the user clicks the action button. The first click SHALL activate zen mode, and a subsequent click SHALL deactivate it by running the restore script and removing injected CSS, without reloading the page.

#### Scenario: Activate zen mode
- **WHEN** the user clicks the action button and zen mode is not active on the current tab
- **THEN** the extension SHALL inject zen-mode.css and execute zen-mode.js

#### Scenario: Deactivate zen mode
- **WHEN** the user clicks the action button and zen mode is already active on the current tab
- **THEN** the extension SHALL execute zen-restore.js to reverse DOM changes
- **AND** the extension SHALL call `chrome.scripting.removeCSS` to remove zen-mode.css
- **AND** the extension SHALL NOT reload the page

### Requirement: Per-tab state tracking
The extension SHALL track zen mode state independently for each tab, keyed on the tweet ID at the moment of activation. A tweet ID SHALL be extracted from URL paths of the form `/status/<digits>` or `/article/<digits>` on `x.com`; any other URL yields a null tweet ID. Activating zen mode on one tab SHALL NOT affect other tabs. The extension SHALL clear a tab's zen state when the tab is closed, or when the tab navigates to a different tweet (tweet ID changes or becomes null). SPA navigation within the same tweet (e.g., opening or closing an image lightbox) SHALL NOT clear zen state. When the user clicks the action button, the extension SHALL verify that the page's `window.__zenx` marker is still present before treating the tab as zen-active; if the marker is missing (e.g., after a hard reload wiped injected content), the extension SHALL clear the stale state so the click enters zen fresh rather than becoming a silent no-op.

#### Scenario: Multiple tabs with different states
- **WHEN** zen mode is active on tab A and the user clicks the action button on tab B
- **THEN** tab B SHALL enter zen mode while tab A remains in zen mode

#### Scenario: Tab closed
- **WHEN** a tab with active zen mode is closed
- **THEN** the extension SHALL remove that tab's state from tracking

#### Scenario: SPA navigation within the same tweet (lightbox open/close)
- **WHEN** zen mode is active on a tab at `/status/123` and the URL changes to `/article/123/media/456` (image lightbox) or back
- **THEN** the extension SHALL retain zen state for that tab

#### Scenario: Navigation to a different tweet
- **WHEN** zen mode is active on a tab and the URL changes to a different tweet ID (e.g., `/status/999`)
- **THEN** the extension SHALL clear zen state for that tab

#### Scenario: Navigation off tweet context
- **WHEN** zen mode is active on a tab and the URL changes to a non-tweet page (e.g., `/home`, `/explore`) or leaves `x.com`
- **THEN** the extension SHALL clear zen state for that tab

#### Scenario: Hard reload followed by icon click
- **WHEN** a tab is zen-active, the user presses F5 / Cmd+R to fully reload (wiping injected CSS/JS), and then clicks the action button
- **THEN** the extension SHALL detect the missing `window.__zenx` marker and treat the tab as not-yet-zen
- **AND** the extension SHALL enter zen mode on that same click (no intermediate "no-op" click)

### Requirement: Action button enabled on status and article paths
The extension SHALL enable the action button on URLs whose path contains `/status/` OR `/article/` on `x.com`. This covers both regular tweets, X Articles, and their media lightbox routes (e.g., `/article/<id>/media/<mediaId>`, `/status/<id>/photo/1`), so the user can toggle zen mode without first closing any overlay.

#### Scenario: Button available on status page
- **WHEN** the user navigates to `https://x.com/<user>/status/<id>`
- **THEN** the action button SHALL be enabled

#### Scenario: Button available on article page
- **WHEN** the user navigates to `https://x.com/<user>/article/<id>`
- **THEN** the action button SHALL be enabled

#### Scenario: Button available on lightbox route
- **WHEN** the user is on `https://x.com/<user>/article/<id>/media/<mediaId>` after clicking an image
- **THEN** the action button SHALL remain enabled

#### Scenario: Button disabled elsewhere
- **WHEN** the user is on `https://x.com/home`, `https://x.com/explore`, or any non-tweet page
- **THEN** the action button SHALL be disabled

### Requirement: Auto-close lightbox when toggling zen from within it
When the user clicks the action button while the tab's URL contains `/media/` (i.e., an image lightbox is currently showing), the extension SHALL perform the usual zen toggle AND SHALL call `history.back()` in the page context afterwards. This surfaces the new zen state immediately instead of leaving it hidden behind the lightbox overlay.

#### Scenario: Toggle zen off from inside lightbox
- **WHEN** zen is active and the user clicks the action button while on `/article/<id>/media/<mediaId>`
- **THEN** the extension SHALL deactivate zen (run restore + remove CSS)
- **AND** the extension SHALL call `history.back()` so the page returns to the underlying tweet view

#### Scenario: Toggle zen on from inside lightbox
- **WHEN** zen is not active and the user clicks the action button while on `/article/<id>/media/<mediaId>` (user opened the lightbox first)
- **THEN** the extension SHALL activate zen (inject CSS + run zen-mode.js)
- **AND** the extension SHALL call `history.back()` so the new zen styling is immediately visible
