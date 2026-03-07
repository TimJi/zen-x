// ZenX — 復原 DOM 狀態（由 background.js 在關閉 zen mode 時執行）
(() => {
  const state = window.__zenx;
  if (!state) return;

  // 反向還原所有 inline style 變更
  for (let i = state.savedStyles.length - 1; i >= 0; i--) {
    const { el, prop, oldValue, oldPriority } = state.savedStyles[i];
    if (oldValue) {
      el.style.setProperty(prop, oldValue, oldPriority);
    } else {
      el.style.removeProperty(prop);
    }
  }

  // 斷開 MutationObserver
  if (state.observer) {
    state.observer.disconnect();
  }

  // 回到頁面頂部
  window.scrollTo(0, 0);

  // 清理
  delete window.__zenx;
})();
