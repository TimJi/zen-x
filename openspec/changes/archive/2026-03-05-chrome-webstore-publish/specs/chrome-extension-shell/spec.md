## MODIFIED Requirements

### Requirement: Extension manifest uses Manifest V3
Extension SHALL use Chrome Manifest V3 format with the following configuration:
- `manifest_version`: 3
- `permissions`: `activeTab`, `scripting`, `declarativeContent`
- `action`: 定義 browser action 按鈕與圖示
- `background`: 指定 service worker
- `homepage_url`: 指向 GitHub repository URL

#### Scenario: Valid manifest structure
- **WHEN** manifest.json is loaded by Chrome
- **THEN** Chrome SHALL recognize it as a valid Manifest V3 extension with action button, service worker, and homepage URL
