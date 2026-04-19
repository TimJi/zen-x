## ADDED Requirements

### Requirement: Hide reply/comment section
The system SHALL hide all `[data-testid="cellInnerDiv"]` elements except the first one (the original article). The first cellInnerDiv SHALL use `position: relative` with no transform. All DOM style mutations SHALL be tracked in `window.__zenx.savedStyles` for later restoration.

#### Scenario: Article page with replies
- **WHEN** zen mode is activated on an article page with replies
- **THEN** only the original article (first cellInnerDiv) SHALL be visible; all reply cells SHALL be hidden

### Requirement: Hide navigation and sidebar
The system SHALL hide the left navigation bar (`header[role="banner"]`) and the right sidebar (`[data-testid="sidebarColumn"]`). In the floating-overlay container (`#layers`), the system SHALL hide only its direct children that do NOT contain a `[role="dialog"]` element, using the selector `#layers > div:not(:has([role="dialog"]))`. This keeps floating drawers (Grok, chat, BottomBar) hidden while preserving X's native modal overlays such as the image lightbox.

#### Scenario: Article page with full UI
- **WHEN** zen mode is activated
- **THEN** left navigation and right sidebar SHALL not be visible
- **AND** floating drawers (Grok, chat, BottomBar) rendered under `#layers` SHALL not be visible

#### Scenario: Image lightbox opened in zen mode
- **WHEN** zen mode is active and the user clicks an image, causing X to insert a `[role="dialog"]` into `#layers`
- **THEN** the dialog slot SHALL be visible (not hidden by zen CSS)
- **AND** drawer slots (those without a dialog) SHALL remain hidden

#### Scenario: Image lightbox closed
- **WHEN** the user closes the lightbox (Esc or ✕) and the dialog is removed from `#layers`
- **THEN** the remaining drawer slots SHALL be hidden again

### Requirement: Golden ratio content width
The system SHALL set the article content area to `max-width: var(--zen-content-max-width, 890px)` and `width: var(--zen-content-width, 61.8vw)`, centered horizontally. CSS variables SHALL be declared on `:root` for easy customization.

#### Scenario: Article on wide screen (>1440px)
- **WHEN** zen mode is activated on a viewport wider than 1440px
- **THEN** the article content SHALL be capped at 890px wide and centered

#### Scenario: Article on medium screen (~1024px)
- **WHEN** zen mode is activated on a 1024px viewport
- **THEN** the article content SHALL be approximately 633px wide (61.8% of 1024px) and centered

### Requirement: Fix virtual scroll container height
The system SHALL set timeline container (`[aria-label]` matching Timeline in multiple languages) child divs to `min-height: auto`, `height: auto`, and `overflow: hidden` to prevent scroll issues. All DOM style mutations SHALL be tracked in `window.__zenx.savedStyles` for later restoration.

#### Scenario: Timeline container adjustment
- **WHEN** zen mode is activated
- **THEN** the virtual scroll container SHALL auto-size to fit visible content without scroll artifacts

### Requirement: Hide interaction buttons
The system SHALL hide the interaction button group (`[role="group"]`) within the first cellInnerDiv, and the inline reply input (`[data-testid="inline_reply_offscreen"]`).

#### Scenario: Interaction elements removal
- **WHEN** zen mode is activated
- **THEN** like/retweet/reply buttons and the reply input box SHALL not be visible

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

### Requirement: Hide quotes link and Grok button
The system SHALL hide the container holding the "quotes" link and related buttons, as well as the Grok/caret button area.

#### Scenario: Article with quotes link and Grok
- **WHEN** zen mode is activated on an article showing quotes link and Grok button
- **THEN** both elements SHALL be hidden

### Requirement: Scroll to top
The system SHALL scroll the page to the top (`window.scrollTo(0, 0)`) after all cleanup operations complete.

#### Scenario: Page scroll reset
- **WHEN** zen mode is activated
- **THEN** the page SHALL scroll to the top position
