(() => {
  window.__zenx = { savedStyles: [], observer: null };

  function saveAndSet(el, prop, value, priority) {
    window.__zenx.savedStyles.push({
      el,
      prop,
      oldValue: el.style.getPropertyValue(prop),
      oldPriority: el.style.getPropertyPriority(prop)
    });
    if (priority) {
      el.style.setProperty(prop, value, priority);
    } else {
      el.style.setProperty(prop, value);
    }
  }

  // 文章欄位的父容器也要放寬，讓 primaryColumn 的 margin auto 能置中
  const primary = document.querySelector('[data-testid="primaryColumn"]');
  if (primary) {
    let p = primary.parentElement;
    while (p && p !== document.body) {
      saveAndSet(p, 'max-width', '100%');
      saveAndSet(p, 'width', '100%');
      p = p.parentElement;
    }
  }

  document.querySelectorAll('img.css-9pa8cd').forEach(img => {
    saveAndSet(img, 'opacity', '1');
    saveAndSet(img, 'position', 'static');
    saveAndSet(img, 'width', '100%');
    saveAndSet(img, 'height', 'auto');
    const parent = img.parentElement;
    if (parent) {
      saveAndSet(parent, 'position', 'relative');
      saveAndSet(parent, 'overflow', 'visible');
      saveAndSet(parent, 'display', 'block');
      Array.from(parent.children).forEach(sib => {
        if (sib !== img && getComputedStyle(sib).backgroundImage !== 'none') {
          saveAndSet(sib, 'display', 'none');
        }
      });
    }
  });

  // 隱藏「← 文章」置頂導航列（sticky/fixed）
  const backBtn = document.querySelector('[data-testid="app-bar-back"]');
  if (backBtn) {
    let el = backBtn;
    while (el && el !== document.body) {
      const s = getComputedStyle(el);
      if (s.position === 'sticky' || s.position === 'fixed') {
        saveAndSet(el, 'display', 'none', 'important');
        break;
      }
      el = el.parentElement;
    }
  }

  document.querySelectorAll('[role="status"]').forEach(el => {
    if (/premium|升級|upgrade/i.test(el.textContent)) {
      saveAndSet(el, 'display', 'none', 'important');
    }
  });

  // 隱藏「相關」+「查看引用」
  const quotesLink = document.querySelector('a[href*="/quotes"]');
  if (quotesLink) {
    let el = quotesLink;
    while (el && el !== document.body) {
      el = el.parentElement;
      if (el && el.querySelector('a[href*="/quotes"]') && el.querySelector('button')) {
        saveAndSet(el, 'display', 'none', 'important');
        break;
      }
    }
  }

  // 隱藏右上角 Grok 和「...」按鈕
  const caretBtn = document.querySelector('[data-testid="caret"]');
  if (caretBtn) {
    let el = caretBtn.parentElement;
    while (el && el !== document.body) {
      if (el.children.length === 2) {
        saveAndSet(el, 'display', 'none', 'important');
        break;
      }
      el = el.parentElement;
    }
  }

  // MutationObserver：持續清理動態插入的 Premium 橫幅
  const observer = new MutationObserver(() => {
    document.querySelectorAll('[role="status"]').forEach(el => {
      if (/premium|升級|upgrade/i.test(el.textContent) && getComputedStyle(el).display !== 'none') {
        saveAndSet(el, 'display', 'none', 'important');
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.__zenx.observer = observer;

  window.scrollTo(0, 0);
})();
