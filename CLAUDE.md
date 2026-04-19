# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ZenX — a Chrome extension (Manifest V3) that provides a distraction-free reader mode for X.com (Twitter) article pages (`x.com/*/status/*`). Clicking the toolbar icon toggles Zen mode on the current tab by injecting CSS/JS; clicking again restores the original layout.

## Architecture

- `manifest.json` — MV3 manifest. Uses `activeTab`, `scripting`, `declarativeContent`; the action is only enabled on `x.com` status URLs.
- `background.js` — service worker. Tracks per-tab zen state in a `Set`, toggles via `chrome.scripting.insertCSS` / `executeScript`, cleans up on tab close or navigation.
- `zen-mode.css` + `zen-mode.js` — injected to enter Zen mode.
- `zen-restore.js` — injected to restore the page when leaving Zen mode.
- `icons/` — 16/48/128 px PNGs with transparent background.
- `store/` — Chrome Web Store assets (screenshots, description).

## Testing

Playwright-based DOM compatibility tests live in `tests/` (`selectors.spec.js`, `injection.spec.js`). They guard against X.com DOM changes breaking the extension.

- Run locally: `npm test` (uses `.x-auth.json` for storage state if present).
- Install browsers: `npm run test:install`.
- CI: `.github/workflows/dom-monitor.yml` runs on push/PR and on a daily 08:00 UTC cron. On failure it opens/comments on a `[ZenX Monitor] DOM compatibility check failed` issue; on recovery it closes it.

## Release

- `manifest.json` version is the source of truth; bump it before packaging.
- Release artifacts: `zenx-vX.Y.Z.zip` (built for Chrome Web Store upload).

## Repository

- Remote: git@github.com:TimJi/zen-x.git
- Branch: main
- License: MIT
