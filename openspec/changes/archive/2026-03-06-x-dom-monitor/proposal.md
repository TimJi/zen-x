## Why

X.com 隨時可能改動 DOM 結構，導致 ZenX Extension 依賴的 CSS selector 失效、功能壞掉，而開發者無法即時察覺。需要一套自動化監控機制，每天檢查 X.com 頁面結構是否仍相容，並在發生破壞性變更時主動通知。

## What Changes

- 新增 Playwright 測試腳本，分兩層：
  1. Selector 存在性檢查（快速驗證所有依賴的 DOM selector 是否存在）
  2. 完整注入測試（注入 zen-mode.css/js 後驗證效果）
- 新增 GitHub Action workflow，每天定時執行測試
- 測試失敗時自動開 Issue（不重複）並加 comment；恢復正常時自動關閉 Issue
- 先不登入 X.com，用公開文章頁面測試

## Capabilities

### New Capabilities
- `dom-test-suite`: Playwright 測試腳本（selector 檢查 + 注入測試）
- `ci-monitor`: GitHub Action workflow（每日排程 + Issue 通知機制）

### Modified Capabilities
<!-- 無 -->

## Impact

- 新增 `tests/` 目錄存放測試腳本
- 新增 `.github/workflows/` 目錄存放 CI 設定
- 新增 `package.json` 管理 Playwright 依賴
- 不影響 Extension 功能本身
