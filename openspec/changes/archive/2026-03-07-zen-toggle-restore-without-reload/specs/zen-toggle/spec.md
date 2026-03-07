## MODIFIED Requirements

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
