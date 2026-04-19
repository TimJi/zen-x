## ADDED Requirements

### Requirement: Unit tests for zen state machine
The project SHALL include unit tests, runnable without a browser, for the pure functions that govern zen-state clearing logic. The functions under test SHALL live in a separate module (`zen-state.js`) that is consumable both by the service worker (via `importScripts`) and by Node (via `require`). Tests SHALL run under `node --test`.

Covered functions:
- `tweetIdFromUrl(urlStr)`: extract tweet ID from URLs, or null for non-tweet URLs.
- `shouldClearZenState(prevTweetId, changeInfoUrl)`: decide whether a `tabs.onUpdated` event should clear zen state.

#### Scenario: Tweet ID extraction across tweet URL shapes
- **WHEN** `tweetIdFromUrl` is called with `/status/<id>`, `/article/<id>`, `/article/<id>/media/<mediaId>`, or `/status/<id>/photo/1` on `x.com`
- **THEN** the function SHALL return the tweet ID as a string

#### Scenario: Non-tweet URLs yield null
- **WHEN** `tweetIdFromUrl` is called with home / profile / search pages, non-`x.com` URLs, or invalid input
- **THEN** the function SHALL return `null`

#### Scenario: SPA lightbox navigation preserves state (regression guard)
- **WHEN** `shouldClearZenState(prev, newUrl)` is called with the same tweet ID in `newUrl` (incl. `/media/` lightbox URLs)
- **THEN** the function SHALL return `false`

#### Scenario: Cross-tweet or off-site navigation clears state
- **WHEN** `shouldClearZenState` is called with a different tweet ID, or a non-tweet / non-x.com URL
- **THEN** the function SHALL return `true`

### Requirement: Image lightbox regression test
The test suite SHALL include Playwright specs that verify image lightbox visibility under zen mode on a real X.com article. The spec SHALL load an article page containing image links, inject `zen-mode.css` and `zen-mode.js`, and then:
- Assert that `#layers` has no dialog and any drawer children are `display: none` before interaction.
- Click the first image link and assert the resulting `[role="dialog"]` inside `#layers` is visible (slot `display` is not `none`, `visibility` is not `hidden`, `opacity` > 0).
- Press Escape and assert state returns (no dialog in `#layers`, drawer children still hidden).

#### Scenario: Lightbox visible under zen mode
- **WHEN** zen mode is injected on an article page and the user clicks an image
- **THEN** the inserted `[role="dialog"]` in `#layers` SHALL be visible

#### Scenario: Drawer slots stay hidden with dialog present
- **WHEN** the lightbox is open and `#layers` contains both drawer and dialog slots
- **THEN** slots without a dialog SHALL remain `display: none`

#### Scenario: State returns after close
- **WHEN** the user presses Escape to close the lightbox
- **THEN** `#layers` SHALL contain no dialog and drawer slots SHALL remain hidden

### Requirement: Test runner separation
The project's npm scripts SHALL expose unit tests and e2e tests independently:
- `npm run test:unit` SHALL run only the Node-based unit tests (`node --test tests/*.test.js`).
- `npm run test:e2e` SHALL run only the Playwright tests.
- `npm test` SHALL run both in order, unit first then e2e.

Playwright configuration SHALL limit `testMatch` to `*.spec.js` so that unit tests (`*.test.js`) are not picked up as Playwright specs.

#### Scenario: Unit tests run without a browser
- **WHEN** a developer runs `npm run test:unit` without Playwright browsers installed
- **THEN** the unit tests SHALL run and pass

#### Scenario: Playwright only sees spec files
- **WHEN** the Playwright runner is invoked
- **THEN** it SHALL execute `*.spec.js` files in `tests/` and SHALL NOT attempt to run `*.test.js` files
