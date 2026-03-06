## ADDED Requirements

### Requirement: Toggle zen mode on and off
The extension SHALL toggle zen mode when the user clicks the action button. The first click SHALL activate zen mode, and a subsequent click SHALL deactivate it by reloading the page.

#### Scenario: Activate zen mode
- **WHEN** the user clicks the action button and zen mode is not active on the current tab
- **THEN** the extension SHALL inject zen-mode.css and execute zen-mode.js

#### Scenario: Deactivate zen mode
- **WHEN** the user clicks the action button and zen mode is already active on the current tab
- **THEN** the extension SHALL reload the page to restore the original state

### Requirement: Per-tab state tracking
The extension SHALL track zen mode state independently for each tab. Activating zen mode on one tab SHALL NOT affect other tabs.

#### Scenario: Multiple tabs with different states
- **WHEN** zen mode is active on tab A and the user clicks the action button on tab B
- **THEN** tab B SHALL enter zen mode while tab A remains in zen mode

#### Scenario: Tab closed
- **WHEN** a tab with active zen mode is closed
- **THEN** the extension SHALL remove that tab's state from tracking

#### Scenario: Page reloaded
- **WHEN** a tab with active zen mode is reloaded (by toggle or manually)
- **THEN** the extension SHALL remove that tab from active tracking
