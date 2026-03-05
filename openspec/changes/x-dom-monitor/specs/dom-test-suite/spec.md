## ADDED Requirements

### Requirement: Selector existence check
The test suite SHALL verify that all CSS selectors used by zen-mode.css and zen-mode.js exist on an X.com article page.

Required selectors (test SHALL fail if missing):
- `[data-testid="cellInnerDiv"]`
- `[data-testid="primaryColumn"]`
- `[data-testid="sidebarColumn"]`
- `header[role="banner"]`
- `[data-testid="app-bar-back"]`
- `#layers`

Optional selectors (warn but do not fail, as they may not appear on every article):
- `[data-testid="inline_reply_offscreen"]`
- `[role="group"]` within cellInnerDiv

#### Scenario: All selectors present
- **WHEN** the test loads a public X.com article page
- **THEN** all listed selectors SHALL be found in the DOM

#### Scenario: Selector missing
- **WHEN** a selector is not found on the page
- **THEN** the test SHALL fail and report which specific selector(s) are missing

### Requirement: Zen mode injection test
The test suite SHALL inject zen-mode.css and zen-mode.js into an X.com article page and verify:
- `[data-testid="sidebarColumn"]` is hidden (display: none or visibility: hidden)
- `header[role="banner"]` is hidden
- `[data-testid="primaryColumn"]` has the expected max-width
- Only the first `[data-testid="cellInnerDiv"]` is visible

#### Scenario: Successful injection
- **WHEN** zen-mode CSS and JS are injected into an article page
- **THEN** sidebar, navigation, and reply sections SHALL be hidden, and article column SHALL have zen-mode width

### Requirement: Multiple fallback URLs
The test suite SHALL attempt to load from a list of 2-3 public article URLs. If all URLs fail to load (404 or redirect to login), the test SHALL be marked as skipped, not failed.

#### Scenario: Primary URL available
- **WHEN** the first article URL loads successfully
- **THEN** tests SHALL run against that page

#### Scenario: All URLs unavailable
- **WHEN** all fallback URLs fail to load a valid article page
- **THEN** tests SHALL be skipped with a warning, not marked as failure
