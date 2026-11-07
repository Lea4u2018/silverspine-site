import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { PRIMARY_DISC_LOGO, DISC_LOGO_CANDIDATES } from "@/lib/logo";

const PLATINUM = "#c9ced6";

/** Large disc under the nav bar — not inside the header strip. */
export default function SitePageLogo() {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const isBlog = router.pathname === "/blog";
  const banner = isHome
    ? (
      <>
        Welcome To Silver Spine Studio
        <span className="align-super text-base">™</span>
        {" "}
        Series: The seven-fold chronicle.
      </>
    )
    : isBlog
      ? (
        <>
          Silver Spine Studio
          <span className="align-super text-base">™</span>
          {" "}
          Blog.
        </>
      )
      : null;
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
    <div
      className={`relative z-10 px-3 sm:px-4 pt-2 pb-2 w-full flex pointer-events-none ${
        banner
          ? "flex-col items-center gap-2 min-[769px]:flex-row min-[769px]:items-center min-[769px]:min-h-[6.5rem] min-[769px]:pb-1"
          : "items-center"
      }`}
    >
      <Link
        href="/"
        className="pointer-events-auto relative z-10 inline-block shrink-0 self-start min-[769px]:self-auto"
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
          <span className="text-lg md:text-xl font-bold tracking-widest uppercase" style={{ color: PLATINUM }}>
            Silver Spine Studio™
          </span>
        )}
      </Link>
      {banner ? (
        <p
          className="relative z-[1] w-full flex items-center justify-center pointer-events-none px-1 min-[769px]:absolute min-[769px]:inset-0 min-[769px]:px-28"
        >
          <span
            className="block text-center font-extrabold leading-[1.15] tracking-[0.02em] text-[1.05rem] sm:text-[1.25rem] min-[769px]:text-[2.8rem]"
            style={{ color: PLATINUM, textShadow: "0 2px 12px rgba(0,0,0,.6)" }}
          >
            {banner}
          </span>
        </p>
      ) : null}
    </div>
  );
}
