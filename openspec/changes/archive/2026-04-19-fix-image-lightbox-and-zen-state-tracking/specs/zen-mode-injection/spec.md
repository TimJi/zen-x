## MODIFIED Requirements

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
