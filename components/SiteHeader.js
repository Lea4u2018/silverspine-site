import { useEffect, useRef } from "react";
import SiteNav from "@/components/SiteNav";
import FixedMusicControl from "@/components/FixedMusicControl";
import { bindChromeVars } from "@/lib/chromeVars";

/** Slim locked nav bar — mute lives here so it never covers Shop. */
export default function SiteHeader() {
  const headerRef = useRef(null);
  useEffect(() => bindChromeVars(headerRef.current), []);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 min-h-12 bg-black border-b border-[#dfcfb5]/25"
    >
      <div className="max-w-[1400px] mx-auto h-full flex items-start md:items-center justify-end gap-2 sm:gap-3 px-3 sm:px-4 min-w-0 py-2">
        <SiteNav className="flex-1" />
        <div className="shrink-0 pt-0.5">
          <FixedMusicControl embedded />
        </div>
      </div>
    </header>
  );
}
