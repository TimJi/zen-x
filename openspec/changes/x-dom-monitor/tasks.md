## 1. 專案設定

- [x] 1.1 建立 package.json，加入 Playwright 依賴
- [x] 1.2 在 .gitignore 加入 node_modules/、test-results/

## 2. 測試腳本

- [x] 2.1 建立 tests/selectors.spec.js（Layer 1：selector 存在性檢查，含 fallback URL 機制）
- [x] 2.2 建立 tests/injection.spec.js（Layer 2：注入 zen-mode.css/js 後驗證效果）

## 3. GitHub Action

- [x] 3.1 建立 .github/workflows/dom-monitor.yml（每日 cron + workflow_dispatch + Playwright 安裝執行）
- [x] 3.2 在 workflow 中加入 Issue 去重邏輯（失敗開 Issue/加 comment，恢復關閉 Issue）
