## MODIFIED Requirements

### Requirement: Hide reply/comment section
The system SHALL hide all `[data-testid="cellInnerDiv"]` elements except the first one (the original article). The first cellInnerDiv SHALL use `position: relative` with no transform. All DOM style mutations SHALL be tracked in `window.__zenx.savedStyles` for later restoration.

#### Scenario: Article page with replies
- **WHEN** zen mode is activated on an article page with replies
- **THEN** only the original article (first cellInnerDiv) SHALL be visible; all reply cells SHALL be hidden

### Requirement: Fix virtual scroll container height
The system SHALL set timeline container (`[aria-label]` matching Timeline in multiple languages) child divs to `min-height: auto`, `height: auto`, and `overflow: hidden` to prevent scroll issues. This is handled by zen-mode.css and requires no changes. All DOM style mutations SHALL be tracked in `window.__zenx.savedStyles` for later restoration.

#### Scenario: Timeline container adjustment
- **WHEN** zen mode is activated
- **THEN** the virtual scroll container SHALL auto-size to fit visible content without scroll artifacts

### Requirement: Fix image display
The system SHALL make images with class `css-9pa8cd` fully visible by setting `opacity: 1`, `position: static`, `width: 100%`, `height: auto`, and hiding background-image siblings. All original style values SHALL be saved in `window.__zenx.savedStyles` before modification.

#### Scenario: Article with images
- **WHEN** zen mode is activated on an article containing images
- **THEN** all images SHALL display at full width without being overlapped by background layers
- **AND** original style values for each modified element SHALL be recorded in `window.__zenx.savedStyles`

### Requirement: Hide sticky navigation bar
The system SHALL find the back button (`[data-testid="app-bar-back"]`) and hide its nearest ancestor with `position: sticky` or `position: fixed`. The original display value SHALL be saved in `window.__zenx.savedStyles`.

#### Scenario: Sticky header removal
- **WHEN** zen mode is activated
- **THEN** the sticky "Post" navigation bar at the top SHALL be hidden
- **AND** its original display value SHALL be saved for restoration

### Requirement: Hide Premium ad banners
The system SHALL hide `[role="status"]` elements containing "premium", "upgrade", or related text. A MutationObserver SHALL continuously monitor for dynamically inserted Premium banners. The observer reference SHALL be stored in `window.__zenx.observer`. All elements hidden by the observer SHALL have their original display value tracked in `window.__zenx.savedStyles`.

#### Scenario: Premium banner appears after page load
- **WHEN** X.com dynamically inserts a Premium upgrade banner after zen mode activation
- **THEN** the MutationObserver SHALL detect, save original display value, and hide the banner

### Requirement: Scroll to top
The system SHALL save the current scroll position in `window.__zenx.scrollY` and then scroll the page to the top (`window.scrollTo(0, 0)`) after all cleanup operations complete.

#### Scenario: Page scroll reset
- **WHEN** zen mode is activated
- **THEN** the original scroll position SHALL be saved and the page SHALL scroll to the top position
