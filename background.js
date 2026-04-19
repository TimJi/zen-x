// 追蹤哪些 tab 處於 zen mode，以及進入 zen 時的推文 ID
// （value 是推文 ID；用來判斷 SPA 導航是否仍在同一則推文脈絡內）
const zenTabs = new Map();

// 從 x.com URL 抽出推文 ID；非推文頁回傳 null
function tweetIdFromUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    if (!u.hostname.endsWith('x.com')) return null;
    const m = u.pathname.match(/\/(?:status|article)\/(\d+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

// 僅在 x.com/*/status/* 文章頁面啟用 action 按鈕
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();

  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'x.com', pathContains: '/status/' }
          })
        ],
        actions: [new chrome.declarativeContent.ShowAction()]
      }
    ]);
  });
});

// 點擊 action 按鈕時 toggle zen mode
chrome.action.onClicked.addListener(async (tab) => {
  if (zenTabs.has(tab.id)) {
    // 離開 zen：執行 restore 腳本並移除 CSS
    zenTabs.delete(tab.id);
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['zen-restore.js']
    });
    await chrome.scripting.removeCSS({
      target: { tabId: tab.id },
      files: ['zen-mode.css']
    });
  } else {
    // 進入 zen：注入 CSS + JS
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['zen-mode.css']
    });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['zen-mode.js']
    });
    zenTabs.set(tab.id, tweetIdFromUrl(tab.url));
  }
});

// Tab 關閉時清理狀態
chrome.tabs.onRemoved.addListener((tabId) => {
  zenTabs.delete(tabId);
});

// Tab 導航到別則推文（或離開 x.com 推文脈絡）時才清理狀態
// 不清理的情境：點圖開 lightbox、關 lightbox 等 SPA 導航（URL 變，但推文 ID 相同）
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!zenTabs.has(tabId)) return;
  if (!changeInfo.url) return;
  const currentId = zenTabs.get(tabId);
  const newId = tweetIdFromUrl(changeInfo.url);
  if (newId !== currentId) {
    zenTabs.delete(tabId);
  }
});
