// /components/Layout.js
import { useEffect } from "react";
import Footer from "@/components/Footer";
import { CinematicAudioProvider } from "@/components/CinematicAudio";
import PauseMediaWhenHidden from "@/components/PauseMediaWhenHidden";
import TopRightControls from "@/components/TopRightControls";
import { clearGoogTransCookies } from "@/lib/chromeVars";

export default function Layout({ children, footerNote }) {
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
      <div className="bg-black text-white">
        <TopRightControls />
        <main className="relative">{children}</main>
        <Footer note={footerNote} />
      </div>
    </CinematicAudioProvider>
  );
}
