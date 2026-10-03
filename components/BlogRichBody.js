const HEADING_CLASS =
  "text-violet-300 font-extrabold tracking-[0.14em] uppercase text-[12px] sm:text-[13px] mt-4 mb-1.5 first:mt-0 drop-shadow-[0_0_10px_rgba(196,181,253,0.75)] [text-shadow:0_0_14px_rgba(167,139,250,0.85)]";

const LINK_CLASS =
  "text-[#d4a84b] font-semibold underline underline-offset-[3px] decoration-[#d4a84b]/70 break-all transition-colors duration-150 hover:text-[#d0f0ed] hover:decoration-[#d0f0ed] hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a77a23]/50 rounded-sm";

function isSectionHeading(line) {
  const t = String(line || "").trim();
  if (!t || t.length > 90) return false;
  if (/^https?:\/\//i.test(t)) return false;
  if (/@/.test(t) && t.includes(".")) return false;
  if (!/^[A-Z0-9][A-Z0-9\s&/|—–\-:',.™()+]+$/.test(t)) return false;
  if (!/[A-Z]{3,}/.test(t)) return false;
  if (t.split(/\s+/).length > 14) return false;
  return true;
}

function linkifyLine(text) {
  return String(text).split(/(https?:\/\/[^\s]+|contact@silverspinestudio\.com)/gi).map((part, i) => {
    if (/^https?:\/\//i.test(part)) {
      const href = part.replace(/[.,);]+$/, "");
      const tail = part.slice(href.length);
      return (
        <span key={i}>
          <a href={href} className={LINK_CLASS} target="_blank" rel="noopener noreferrer">
            {href}
          </a>
          {tail}
        </span>
      );
    }
    if (/^contact@silverspinestudio\.com$/i.test(part)) {
      return (
        <a key={i} href="mailto:contact@silverspinestudio.com" className={LINK_CLASS}>
          contact@silverspinestudio.com
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/** Live blog body: purple section titles + gold links that go mint on hover. */
export default function BlogRichBody({ body, className = "text-gray-300 text-sm" }) {
  if (!body?.trim()) return null;
  const blocks = body.split(/\n\n+/).filter(Boolean);

  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        if (lines.length === 1 && isSectionHeading(lines[0])) {
          return (
            <p key={bi} className={HEADING_CLASS} role="heading" aria-level={4}>
              {lines[0].trim()}
            </p>
          );
        }
        return (
          <div key={bi} className="space-y-1.5">
            {lines.map((line, li) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              if (isSectionHeading(trimmed)) {
                return (
                  <p key={li} className={HEADING_CLASS} role="heading" aria-level={4}>
                    {trimmed}
                  </p>
                );
              }
              return (
                <p key={li} className="whitespace-pre-wrap leading-relaxed">
                  {linkifyLine(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
