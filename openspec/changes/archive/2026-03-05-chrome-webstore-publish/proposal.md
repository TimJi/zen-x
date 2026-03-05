## Why

ZenX Extension 功能已完成，需要上架 Chrome Web Store 讓使用者能直接安裝。目前缺少上架所需的隱私權政策、商店素材、以及 manifest 補充欄位。

## What Changes

- 新增 `PRIVACY.md` 隱私權政策文件（聲明不收集任何使用者資料）
- 新增商店截圖素材（before/after 對比截圖說明）
- manifest.json 補充 `homepage_url` 欄位
- 準備商店上架所需的描述文字（中英文）

## Capabilities

### New Capabilities
- `store-listing`: Chrome Web Store 上架所需的所有素材與文件（隱私權政策、商店描述、截圖指引）

### Modified Capabilities
- `chrome-extension-shell`: manifest.json 新增 `homepage_url` 欄位

## Impact

- 新增 PRIVACY.md 檔案
- 修改 manifest.json（新增欄位）
- 新增 store/ 目錄存放商店素材與描述文字
- 不影響 Extension 功能本身
