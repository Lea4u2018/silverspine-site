// /components/Layout.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import SitePageLogo from "@/components/SitePageLogo";
import PageBackdrop from "@/components/PageBackdrop";
import { CinematicAudioProvider } from "@/components/CinematicAudio";
import PauseMediaWhenHidden from "@/components/PauseMediaWhenHidden";
import TopRightControls from "@/components/TopRightControls";
import { clearGoogTransCookies } from "@/lib/chromeVars";

export default function Layout({ children, footerNote }) {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith("/admin");

  useEffect(() => {
    try {
      const path = window.location.pathname || "";
      if (path.startsWith("/admin")) return;
      if (sessionStorage.getItem("sss-visit-sent") === "1") return;
      sessionStorage.setItem("sss-visit-sent", "1");
      fetch("/api/visit", { method: "POST", credentials: "same-origin", keepalive: true }).catch(() => {});
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    clearGoogTransCookies();
      try {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        document.body.style.top = "0px";
        document.documentElement.style.top = "0px";
      document.documentElement.classList.remove("translated-ltr", "translated-rtl");
      document.body.classList.remove("translated-ltr", "translated-rtl");
      try {
        localStorage.setItem("sss-lang", "en");
        document.cookie = "sss-lang=en; path=/; max-age=31536000; SameSite=Lax";
      } catch {
        /* ignore */
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <CinematicAudioProvider>
      <PauseMediaWhenHidden />
      <div className="min-h-screen flex flex-col bg-black text-white">
        {!isAdmin ? (
          <PageBackdrop overlayClassName={router.pathname === "/about" ? "bg-black/32" : "bg-black/62"} />
        ) : null}
        <TopRightControls />
        {!isAdmin ? <SiteHeader /> : null}
        <div className="relative z-10 flex-1 min-w-0 pt-[var(--header-h,3.5rem)] pb-[var(--footer-h,5.75rem)]">
          {!isAdmin ? <SitePageLogo /> : null}
          {children}
        </div>
        {!isAdmin ? <Footer note={footerNote} /> : null}
      </div>
    </CinematicAudioProvider>
  );
}
