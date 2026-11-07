// /components/LogoHub.js
import { useEffect, useMemo, useRef } from "react";
import { GOLD } from "@/lib/socials";

export default function LogoHub({ open, onClose, items }) {
  const panelRef = useRef(null);

  // Close on ESC + simple focus trap
  useEffect(() => {
    if (!open) return;
    const el = panelRef.current;
    const prev = document.activeElement;
    el?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Tab") {
        const focusable = el?.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])') || [];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [open, onClose]);

  const groups = useMemo(() => {
    const map = {};
    (items || []).forEach((s) => {
      map[s.category] = map[s.category] || [];
      map[s.category].push(s);
    });
    return map;
  }, [items]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Logo Hub"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div ref={panelRef} tabIndex={-1} className="w-full max-w-4xl outline-none">
        <div className="rounded-2xl bg-gray-950 border border-gray-800 shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold tracking-wide" style={{ color: GOLD }}>
              Logo Hub — Silver Spine Studio™
            </h2>
            <button
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-sm border border-gray-700 hover:bg-gray-900 transition"
            >
              Close
            </button>
          </div>

          <div className="max-h-[70vh] overflow-auto p-6 space-y-8">
            {Object.entries(groups).map(([cat, list]) => (
              <section key={cat}>
                <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-3">{cat}</h3>
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {list.map((s) => (
                    <li key={s.key}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-xl border border-gray-800 p-3 hover:bg-gray-900 transition"
                        aria-label={s.label}
                      >
                        <s.icon className="text-2xl" style={{ color: GOLD }} />
                        <span className="text-sm text-gray-300 group-hover:text-white">{s.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
