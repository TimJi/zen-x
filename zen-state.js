// 純函式集，供 background.js（service worker, 經 importScripts）與 Node 測試共用
(function (exports) {
  // 從 x.com URL 抽出推文 ID；非推文頁（首頁、profile 等）回傳 null
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

  // 根據 tabs.onUpdated 的 changeInfo.url，判斷是否該清除 zen 狀態
  // - 沒有 URL 變化 → 不清（忽略純 status 變化如 loading/complete）
  // - URL 變到同一則推文（含 /media/ lightbox）→ 不清
  // - URL 變到別則推文或離開 x.com 推文脈絡 → 清
  function shouldClearZenState(prevTweetId, changeInfoUrl) {
    if (!changeInfoUrl) return false;
    const newId = tweetIdFromUrl(changeInfoUrl);
    return newId !== prevTweetId;
  }

  exports.tweetIdFromUrl = tweetIdFromUrl;
  exports.shouldClearZenState = shouldClearZenState;
})(typeof module !== 'undefined' ? module.exports : ((typeof self !== 'undefined' ? self : this).zenState = {}));
