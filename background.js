// 追蹤哪些 tab 處於 zen mode
const zenTabs = new Set();

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
    // 離開 zen：reload 頁面
    zenTabs.delete(tab.id);
    chrome.tabs.reload(tab.id);
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
    zenTabs.add(tab.id);
  }
});

// Tab 關閉時清理狀態
chrome.tabs.onRemoved.addListener((tabId) => {
  zenTabs.delete(tabId);
});

// 頁面 reload 或導航時清理狀態
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    zenTabs.delete(tabId);
  }
});
