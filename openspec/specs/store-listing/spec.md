## Purpose

Define Chrome Web Store listing artifacts: privacy policy document, store description text, and the no-data-collection posture ZenX commits to.

## Requirements

### Requirement: Privacy policy document
The project SHALL include a `PRIVACY.md` file in the repository root declaring that the extension does not collect, store, or transmit any user data.

#### Scenario: Privacy policy content
- **WHEN** a user or reviewer reads PRIVACY.md
- **THEN** it SHALL clearly state: no data collection, no analytics, no cookies, no third-party services, all processing is local to the browser

### Requirement: Store description
The project SHALL include a `store/description.txt` file containing the Chrome Web Store listing description in English.

#### Scenario: Store description content
- **WHEN** the developer copies description.txt to Chrome Web Store
- **THEN** it SHALL include: extension name, what it does, key features, how to use it, and permissions explanation

### Requirement: Screenshot guide
The project SHALL include a `store/screenshots.md` file documenting the required screenshots and their specifications.

#### Scenario: Screenshot specifications
- **WHEN** the developer reads screenshots.md
- **THEN** it SHALL list: required screenshot dimensions (1280x800 or 640x400), recommended screenshots (before/after comparison of X.com article page), and promotional image specs (440x280)
