import { useEffect } from "react";

/**
 * On Google’s translate.goog mirror, hide their top toolbar so our Mute/Language
 * aren’t trapped under a “Google Translate” bar — without fighting the DOM
 * (attribute MutationObserver + style writes caused jump loops).
 */
export default function TranslateProxyCleanup() {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (!window.location.hostname.endsWith(".translate.goog")) return undefined;

    document.documentElement.classList.add("sss-on-translate-proxy");
    document.documentElement.dataset.sssTranslateProxy = "1";

    const STYLE_ID = "sss-hide-gt-proxy-chrome";
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        html.sss-on-translate-proxy,
        html.sss-on-translate-proxy body {
          top: 0 !important;
          margin-top: 0 !important;
          position: static !important;
        }
        html.sss-on-translate-proxy .goog-te-banner-frame,
        html.sss-on-translate-proxy .goog-te-balloon-frame,
        html.sss-on-translate-proxy .skiptranslate,
        html.sss-on-translate-proxy iframe.skiptranslate,
        html.sss-on-translate-proxy iframe.goog-te-banner-frame,
        html.sss-on-translate-proxy #goog-gt-tt,
        html.sss-on-translate-proxy .VIpgJd-ZVi9od-ORHb-OEVmcd,
        html.sss-on-translate-proxy .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
        html.sss-on-translate-proxy .VIpgJd-ZVi9od-ORHb,
        html.sss-on-translate-proxy .VIpgJd-yAWNEb-L7O04c,
        html.sss-on-translate-proxy font + .goog-te-spinner-pos,
        html.sss-on-translate-proxy .goog-te-ftab,
        html.sss-on-translate-proxy #gt-nvframe {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          max-height: 0 !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        html.sss-on-translate-proxy .sss-top-right-controls {
          z-index: 2147483646 !important;
        }
      `;
      document.head.appendChild(style);
    }

    let scheduled = false;
    const scrub = () => {
      scheduled = false;
      try {
        // Prefer CSS !important rules — only touch inline styles if Google forced a top offset
        const bodyTop = document.body.style.top;
        const htmlTop = document.documentElement.style.top;
        if (bodyTop && bodyTop !== "0px" && bodyTop !== "0") {
          document.body.style.top = "0px";
        }
        if (htmlTop && htmlTop !== "0px" && htmlTop !== "0") {
          document.documentElement.style.top = "0px";
        }
        document.querySelectorAll(
          [
            ".goog-te-banner-frame",
            "iframe.goog-te-banner-frame",
            "iframe.skiptranslate",
            "body > .skiptranslate",
            ".VIpgJd-ZVi9od-ORHb-OEVmcd",
            ".VIpgJd-ZVi9od-aZ2wEe-wOHMyf",
            "#gt-nvframe",
            ".goog-te-ftab",
          ].join(",")
        ).forEach((el) => {
          if (el.closest?.(".sss-top-right-controls, .sss-lang-switcher")) return;
          if (el.style.display === "none") return;
          el.style.setProperty("display", "none", "important");
          el.style.setProperty("visibility", "hidden", "important");
        });
      } catch {
        /* ignore */
      }
    };

    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      window.setTimeout(scrub, 120);
    };

    scrub();
    const t1 = setTimeout(scrub, 400);
    const t2 = setTimeout(scrub, 1500);

    // childList only — observing attributes + rewriting styles was a jump feedback loop
    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, { childList: true, subtree: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      mo.disconnect();
      try {
        document.documentElement.classList.remove("sss-on-translate-proxy");
        delete document.documentElement.dataset.sssTranslateProxy;
      } catch {
        /* ignore */
      }
    };
  }, []);

  return null;
}
