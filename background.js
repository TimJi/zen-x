importScripts('zen-state.js');
const { tweetIdFromUrl, shouldClearZenState } = self.zenState;

// value 是進入 zen 時的推文 ID，用來判斷 SPA 導航是否仍在同一則推文脈絡內
const zenTabs = new Map();

// 在 x.com 的推文（/status/）與 X Article（/article/）頁面都啟用 action 按鈕
// —— 涵蓋 lightbox 的 /article/<id>/media/<mediaId> 路徑，讓使用者在 lightbox 中也能切換 zen
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();

  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'x.com', pathContains: '/status/' }
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'x.com', pathContains: '/article/' }
          })
        ],
        actions: [new chrome.declarativeContent.ShowAction()]
      }
    ]);
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  // Reload 會把 injected CSS/JS 整個吹掉，但 zenTabs 不會隨之更新（reload 的 URL 與記錄相同）。
  // 點 icon 前先探 content script 是否還活著，避免第一下按鈕變成無聲 no-op。
  if (zenTabs.has(tab.id)) {
    let alive = false;
    try {
      const [{ result } = {}] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => typeof window.__zenx !== 'undefined'
      });
      alive = !!result;
    } catch {
      alive = false;
    }
    if (!alive) zenTabs.delete(tab.id);
  }

  const target = { tabId: tab.id };
  if (zenTabs.has(tab.id)) {
    zenTabs.delete(tab.id);
    await Promise.all([
      chrome.scripting.executeScript({ target, files: ['zen-restore.js'] }),
      chrome.scripting.removeCSS({ target, files: ['zen-mode.css'] }),
    ]);
  } else {
    await Promise.all([
      chrome.scripting.insertCSS({ target, files: ['zen-mode.css'] }),
      chrome.scripting.executeScript({ target, files: ['zen-mode.js'] }),
    ]);
    zenTabs.set(tab.id, tweetIdFromUrl(tab.url));
  }

  // 若目前在 lightbox 中（URL 含 /media/），自動關閉 lightbox 讓使用者立即看到 zen toggle 的結果
  if (tab.url && tab.url.includes('/media/')) {
    await chrome.scripting.executeScript({
      target,
      func: () => history.back()
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  zenTabs.delete(tabId);
});

// Tab 導航到別則推文（或離開 x.com 推文脈絡）時才清理狀態
// 不清理的情境：點圖開 lightbox、關 lightbox 等 SPA 導航（URL 變，但推文 ID 相同）
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!zenTabs.has(tabId)) return;
  if (shouldClearZenState(zenTabs.get(tabId), changeInfo.url)) {
    zenTabs.delete(tabId);
  }
});
