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

// 點擊 action 按鈕時注入 CSS 和 JS
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ['zen-mode.css']
  });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['zen-mode.js']
  });
});
