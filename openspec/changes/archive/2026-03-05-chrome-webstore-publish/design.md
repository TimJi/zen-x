## Context

ZenX Extension 已開發完成並通過測試。需要補充 Chrome Web Store 上架所需的素材和文件，包含隱私權政策、商店描述、截圖指引等。Extension 不收集任何使用者資料，僅在使用者點擊時注入 CSS/JS 修改頁面外觀。

## Goals / Non-Goals

**Goals:**
- 準備所有 Chrome Web Store 上架所需的文件和素材
- 建立隱私權政策頁面
- 補充 manifest.json 缺少的欄位

**Non-Goals:**
- 不修改 Extension 功能
- 不建立自動化上架 CI/CD
- 不做多語言商店頁面（v1 先用英文為主）

## Decisions

### 1. 隱私權政策放在 repo 內，中英雙語

**選擇**: 建立 `PRIVACY.md` 放在 repo 根目錄，中英雙語撰寫，上架時填入 GitHub raw URL 作為隱私權政策連結。

**理由**: 不需要額外架設網站，GitHub 原生就能瀏覽 Markdown。中英雙語照顧華語使用者也符合審核需求。

**替代方案**:
- GitHub Pages — 多一個設定步驟，目前不必要
- 純英文 — 審核通過但中文使用者體驗差

### 2. 商店素材放在 store/ 目錄

**選擇**: 建立 `store/` 目錄存放商店描述文字和截圖指引。截圖本身由使用者手動擷取。

**理由**: 截圖需要真實的 X.com 頁面內容，無法自動生成。提供指引文件說明需要哪些截圖和規格。

### 3. 商店描述以英文為主

**選擇**: 主要描述使用英文，面向國際使用者。

**理由**: Chrome Web Store 的主要受眾是全球使用者，英文描述覆蓋面最廣。

### 4. manifest.json description 改為英文

**選擇**: 將 `description` 從中文改為英文 "One-click zen reading mode for X.com articles"。

**理由**: 提高國際搜尋能見度，與商店描述語言一致。

## Risks / Trade-offs

- **隱私權政策 URL** → 使用 GitHub raw URL，如果 repo 設為 private 則無法存取。確保 repo 為 public。
- **截圖內容** → 需要手動擷取真實 X.com 頁面，包含 before/after 對比。不能自動化。
