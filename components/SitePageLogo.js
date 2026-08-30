import Link from "next/link";
import { useEffect, useState } from "react";
import { PRIMARY_DISC_LOGO, DISC_LOGO_CANDIDATES } from "@/lib/logo";

/** Large disc under the nav bar — not inside the header strip. */
export default function SitePageLogo() {
  const [logoSrc, setLogoSrc] = useState(PRIMARY_DISC_LOGO);
  const [useTextLogo, setUseTextLogo] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const tryLoad = (i = 0) => {
      if (i >= DISC_LOGO_CANDIDATES.length) {
        if (!cancelled) setUseTextLogo(true);
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (!cancelled) {
          setLogoSrc(DISC_LOGO_CANDIDATES[i]);
          setUseTextLogo(false);
        }
      };
      img.onerror = () => tryLoad(i + 1);
      img.src = DISC_LOGO_CANDIDATES[i];
    };
    tryLoad();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative z-10 px-3 sm:px-4 pt-2 pb-1 w-max pointer-events-none">
      <Link
        href="/"
        className="pointer-events-auto inline-block"
        aria-label="Silver Spine Studio — Home"
      >
        {logoSrc && !useTextLogo ? (
          <img
            src={logoSrc}
            alt="Silver Spine Studio logo"
            className="h-12 w-auto sm:h-16 md:h-20 lg:h-24 select-none drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)]"
            draggable="false"
          />
        ) : (
          <span className="text-lg md:text-xl font-bold tracking-widest uppercase" style={{ color: "#dfcfb5" }}>
            Silver Spine Studio™
          </span>
        )}
      </Link>
    </div>
  );
}
