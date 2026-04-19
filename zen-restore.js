(() => {
  const state = window.__zenx;
  if (!state) return;

  // 反向還原：setProperty 是 stack-like 疊加，必須 LIFO 才能正確還原到最初值
  for (let i = state.savedStyles.length - 1; i >= 0; i--) {
    const { el, prop, oldValue, oldPriority } = state.savedStyles[i];
    if (oldValue) {
      el.style.setProperty(prop, oldValue, oldPriority);
    } else {
      el.style.removeProperty(prop);
    }
  }

  if (state.observer) {
    state.observer.disconnect();
  }

  window.scrollTo(0, 0);

  delete window.__zenx;
})();
