## ADDED Requirements

### Requirement: Save original DOM state before mutations
The system SHALL save the original inline style value for every DOM property it modifies into `window.__zenx.savedStyles` before overwriting it. Each entry SHALL record the element reference, property name, and original value.

#### Scenario: Inline style backup on activate
- **WHEN** zen-mode.js sets `element.style.maxWidth = '100%'` on a primaryColumn ancestor
- **THEN** the original value of `element.style.maxWidth` SHALL be saved in `window.__zenx.savedStyles` before the assignment

#### Scenario: Display-none backup on activate
- **WHEN** zen-mode.js hides an element via `element.style.setProperty('display', 'none', 'important')`
- **THEN** the original `display` value and priority SHALL be saved in `window.__zenx.savedStyles`

### Requirement: Scroll to top on restore
The restore script SHALL scroll the page to the top (`window.scrollTo(0, 0)`) after restoring all DOM mutations.

#### Scenario: Page scroll reset on deactivate
- **WHEN** the restore script executes
- **THEN** the page SHALL scroll to the top position

### Requirement: Store MutationObserver reference
The system SHALL store the MutationObserver instance in `window.__zenx.observer` so it can be disconnected on restore.

#### Scenario: Observer stored
- **WHEN** zen mode creates the MutationObserver for Premium banner hiding
- **THEN** `window.__zenx.observer` SHALL reference that observer instance

### Requirement: Restore all DOM mutations on deactivate
The restore script SHALL iterate `window.__zenx.savedStyles` and restore each element's original inline style value. After restoration, it SHALL disconnect the MutationObserver and restore the scroll position.

#### Scenario: Full restore
- **WHEN** the restore script executes
- **THEN** all elements modified by zen-mode.js SHALL have their original inline style values restored
- **AND** the MutationObserver SHALL be disconnected
- **AND** the page SHALL scroll to the top

#### Scenario: Cleanup window state
- **WHEN** the restore script completes
- **THEN** `window.__zenx` SHALL be deleted from the window object

### Requirement: Premium banners hidden by observer are restored
The restore script SHALL restore display styles on any `[role="status"]` elements that were hidden by the MutationObserver during zen mode.

#### Scenario: Dynamic banner restore
- **WHEN** the MutationObserver hid a Premium banner during zen mode and restore runs
- **THEN** the banner's display property SHALL be restored to its original value
