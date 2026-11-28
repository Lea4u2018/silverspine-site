/**
 * Measure sticky header/footer once — only write CSS vars when values change.
 * Prevents scrollbar/hero feedback loops that make the page jump forever.
 *
 * Important: only observe the HEADER with ResizeObserver.
 * Observing the footer (whose size feeds page min-height) caused continuous jump loops.
 */
export function syncChromeVars(headerEl) {
  if (typeof document === "undefined") return;
  const header = headerEl || document.querySelector("header");
  const footer = document.getElementById("site-footer");
  const hH = header ? Math.round(header.getBoundingClientRect().height) : 140;
  const fH = footer ? Math.round(footer.getBoundingClientRect().height) : 72;
  const root = document.documentElement;
  const prevH = root.style.getPropertyValue("--header-h");
  const prevF = root.style.getPropertyValue("--footer-h");
  const nextH = `${hH}px`;
  const nextF = `${fH}px`;
  if (prevH !== nextH) root.style.setProperty("--header-h", nextH);
  if (prevF !== nextF) root.style.setProperty("--footer-h", nextF);
}

/**
 * Wire header-only ResizeObserver + window resize. Returns a cleanup fn.
 */
export function bindChromeVars(headerEl) {
  if (typeof window === "undefined") return () => {};
  let debounceId = null;
  const setVars = () => {
    if (debounceId) window.clearTimeout(debounceId);
    debounceId = window.setTimeout(() => {
      debounceId = null;
      syncChromeVars(headerEl);
    }, 80);
  };
  syncChromeVars(headerEl);

  let ro = null;
  if (typeof ResizeObserver !== "undefined" && headerEl) {
    ro = new ResizeObserver(setVars);
    ro.observe(headerEl);
  }

  window.addEventListener("load", setVars);
  window.addEventListener("resize", setVars);

  return () => {
    if (debounceId) window.clearTimeout(debounceId);
    if (ro) ro.disconnect();
    window.removeEventListener("load", setVars);
    window.removeEventListener("resize", setVars);
  };
}

/** Clear Google Website Translator cookies left from older builds (they cause jump loops). */
export function clearGoogTransCookies() {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const clear = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = clear;
  try {
    document.cookie = `${clear} domain=${host};`;
    if (host.includes(".")) document.cookie = `${clear} domain=.${host};`;
  } catch {
    /* ignore */
  }
}
