import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminBannerClock from "@/components/AdminBannerClock";
import AdminBlogPanel from "@/components/AdminBlogPanel";
import AdminLaunchPanel from "@/components/AdminLaunchPanel";
import AdminNeighborsPanel from "@/components/AdminNeighborsPanel";
import AdminNextUpPanel from "@/components/AdminNextUpPanel";
import AdminReviewsPanel from "@/components/AdminReviewsPanel";
import AdminSearchMonitorPanel from "@/components/AdminSearchMonitorPanel";
import { languageLabel, normalizeLang } from "@/lib/i18n";

const GOLD = "#a77a23";

function formatWhen(createdAt) {
  try {
    if (!createdAt) return "—";
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  } catch {
    return "—";
  }
}

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [storage, setStorage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [adminTab, setAdminTab] = useState("reviews"); // "reviews" | "blog" | "launch" | "next" | "neighbors" | "search"
  const [visits, setVisits] = useState(null);

  const [replyLang, setReplyLang] = useState("es");
  const [replyTo, setReplyTo] = useState("");
  const [replyEnglish, setReplyEnglish] = useState("");
  const [replyOut, setReplyOut] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);
  const [replyMsg, setReplyMsg] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    const lang = normalizeLang(String(router.query.replyLang || ""));
    if (lang) setReplyLang(lang);
    const to = String(router.query.to || "").trim();
    if (to) setReplyTo(to);
  }, [router.isReady, router.query.replyLang, router.query.to]);

  const loadReviews = useCallback(async () => {
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    if (res.ok && data.ok) {
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      setStorage(data.storage || "");
    } else if (res.status === 401) {
      setAuthed(false);
    } else {
      setActionMsg(data.error || "Could not load reviews.");
    }
  }, []);

  const loadVisits = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/visits");
      const data = await res.json();
      if (res.ok && data.ok) setVisits(data);
    } catch {
      /* ignore */
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session");
      const data = await res.json();
      const ok = Boolean(data.ok);
      setAuthed(ok);
      if (ok) {
        await loadReviews();
        await loadVisits();
      }
    } catch {
      setAuthed(false);
    } finally {
      setChecking(false);
    }
  }, [loadReviews, loadVisits]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const pending = useMemo(
    () => reviews.filter((r) => !r.approved && !r.rejected),
    [reviews]
  );
  const approved = useMemo(
    () => reviews.filter((r) => r.approved && !r.rejected),
    [reviews]
  );

  const login = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setPassword("");
        setAuthed(true);
        setAdminTab("reviews");
        await loadReviews();
        await loadVisits();
      } else {
        setLoginError(data.error || "Login failed.");
      }
    } catch {
      setLoginError("Network error. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setReviews([]);
  };

  const translateReply = async () => {
    setReplyBusy(true);
    setReplyMsg("");
    setReplyOut("");
    try {
      const res = await fetch("/api/admin/translate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: replyEnglish, lang: replyLang, direction: "out" }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setReplyMsg(data.error || "Translation failed.");
        return;
      }
      setReplyOut(data.text || "");
      if (!data.translated) {
        setReplyMsg(
          data.note ||
            "Could not translate yet — add DEEPL_AUTH_KEY or GOOGLE_TRANSLATE_API_KEY in Vercel for reliable replies."
        );
      } else {
        setReplyMsg(`Translated to ${data.languageLabel || languageLabel(replyLang)} (${data.provider || "ok"}).`);
      }
    } catch {
      setReplyMsg("Network error.");
    } finally {
      setReplyBusy(false);
    }
  };

  const copyReply = async () => {
    if (!replyOut) return;
    try {
      await navigator.clipboard.writeText(replyOut);
      setReplyMsg("Copied — paste into your email reply.");
    } catch {
      setReplyMsg("Could not copy — select the text and copy manually.");
    }
  };

  const openMailtoReply = () => {
    if (!replyOut) return;
    const to = replyTo || "";
    const subject = "Re: Silver Spine Studio™";
    const href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(replyOut)}`;
    if (href.length > 1800) {
      copyReply();
      setReplyMsg("Reply is long — copied to clipboard. Paste into your email to " + (to || "the visitor") + ".");
      return;
    }
    window.location.href = href;
  };

  const act = async (id, action) => {
    if (action === "reject") {
      if (!window.confirm("Decline this review? It will be hidden from your queue.")) return;
    }
    setBusyId(id);
    setActionMsg("");
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setActionMsg(data.error || "Action failed.");
      } else {
        setActionMsg(
          action === "approve"
            ? "Review approved — it now shows on the public Reviews page."
            : action === "reject"
              ? "Review declined and hidden."
              : "Review unpublished (back to pending)."
        );
        await loadReviews();
      }
    } catch {
      setActionMsg("Network error.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Head>
        <title>Studio Admin | Silver Spine Studio™</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <header className="border-b border-[#a77a23]/30 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest" style={{ color: GOLD }}>
                Private · password required
              </p>
              <h1 className="text-xl md:text-2xl font-extrabold">Studio Admin</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-sm flex-wrap justify-end">
              <Link href="/" className="text-gray-400 hover:text-white underline-offset-2 hover:underline">
                Site
              </Link>
              {authed ? (
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg border border-white/20 hover:border-[#a77a23]/60"
                >
                  Log out
                </button>
              ) : null}
            </div>
          </div>
          <AdminBannerClock />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 pb-24">
        {checking ? (
          <p className="text-gray-400">Checking session…</p>
        ) : !authed ? (
          <div className="max-w-md mx-auto rounded-2xl border border-white/10 bg-gray-950/80 p-6">
            <h2 className="text-lg font-semibold mb-2" style={{ color: GOLD }}>
              Admin login
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              Customers do not see this page in the site menu. Bookmark{" "}
              <span className="text-gray-200">silverspinestudio.com/admin</span>.
            </p>
            <form onSubmit={login} className="space-y-4" autoComplete="on">
              <div>
                <label htmlFor="admin-user" className="block text-sm mb-1">
                  Username <span className="text-gray-500 font-normal">(for Keychain / Touch ID)</span>
                </label>
                <input
                  id="admin-user"
                  name="username"
                  type="text"
                  autoComplete="username"
                  defaultValue="admin"
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 focus:outline-none focus:border-[#a77a23]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use <strong className="text-gray-300">admin</strong> when Keychain asks. The site only checks your password.
                </p>
              </div>
              <div>
                <label htmlFor="admin-pass" className="block text-sm mb-1">
                  Password
                </label>
                <input
                  id="admin-pass"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 focus:outline-none focus:border-[#a77a23]"
                  required
                />
              </div>
              {loginError ? <p className="text-sm text-red-400">{loginError}</p> : null}
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full rounded-xl bg-[#a77a23] text-black font-semibold py-3 hover:opacity-90 disabled:opacity-60"
              >
                {loggingIn ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-xl border border-[#a77a23]/45 bg-[#a77a23]/10 px-4 py-4">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: GOLD }}>
                Visitors · not you
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white">{visits ? visits.todayPeople : "—"}</p>
                  <p className="text-xs text-gray-400 mt-1">Today</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white">{visits ? visits.weekPeople : "—"}</p>
                  <p className="text-xs text-gray-400 mt-1">Last 7 days</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white">{visits ? visits.allPeople : "—"}</p>
                  <p className="text-xs text-gray-400 mt-1">All time</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                People who opened the site (Mountain time). Your computer is skipped after you sign in here once — even
                after you log out. Numbers start from today forward.
              </p>
            </div>
            <div
              className="mb-8 flex flex-wrap gap-2 p-1 rounded-xl border border-[#a77a23]/40 bg-black/60 sticky top-0 z-20"
              role="tablist"
              aria-label="Admin sections"
            >
              <button
                type="button"
                role="tab"
                id="admin-tab-reviews"
                aria-selected={adminTab === "reviews"}
                onClick={() => setAdminTab("reviews")}
                className={`flex-1 min-w-[30%] rounded-lg px-3 py-3.5 text-sm sm:text-base font-extrabold tracking-wide transition-colors ${
                  adminTab === "reviews"
                    ? "bg-[#a77a23] text-black shadow"
                    : "text-gray-200 hover:bg-white/5"
                }`}
              >
                Reviews
              </button>
              <button
                type="button"
                role="tab"
                id="admin-tab-blog"
                aria-selected={adminTab === "blog"}
                onClick={() => setAdminTab("blog")}
                className={`flex-1 min-w-[30%] rounded-lg px-3 py-3.5 text-sm sm:text-base font-extrabold tracking-wide transition-colors ${
                  adminTab === "blog"
                    ? "bg-[#a77a23] text-black shadow"
                    : "text-gray-200 hover:bg-white/5"
                }`}
              >
                Blog
              </button>
              <button
                type="button"
                role="tab"
                id="admin-tab-launch"
                aria-selected={adminTab === "launch"}
                onClick={() => setAdminTab("launch")}
                className={`flex-1 min-w-[22%] rounded-lg px-3 py-3.5 text-sm sm:text-base font-extrabold tracking-wide transition-colors ${
                  adminTab === "launch"
                    ? "bg-[#a77a23] text-black shadow"
                    : "text-gray-200 hover:bg-white/5"
                }`}
              >
                Launch
              </button>
              <button
                type="button"
                role="tab"
                id="admin-tab-next"
                aria-selected={adminTab === "next"}
                onClick={() => setAdminTab("next")}
                className={`flex-1 min-w-[22%] rounded-lg px-3 py-3.5 text-sm sm:text-base font-extrabold tracking-wide transition-colors ${
                  adminTab === "next"
                    ? "bg-[#a77a23] text-black shadow"
                    : "text-gray-200 hover:bg-white/5"
                }`}
              >
                Next Up
              </button>
              <button
                type="button"
                role="tab"
                id="admin-tab-neighbors"
                aria-selected={adminTab === "neighbors"}
                onClick={() => setAdminTab("neighbors")}
                className={`flex-1 min-w-[22%] rounded-lg px-3 py-3.5 text-sm sm:text-base font-extrabold tracking-wide transition-colors ${
                  adminTab === "neighbors"
                    ? "bg-[#a77a23] text-black shadow"
                    : "text-gray-200 hover:bg-white/5"
                }`}
              >
                Community
              </button>
              <button
                type="button"
                role="tab"
                id="admin-tab-search"
                aria-selected={adminTab === "search"}
                onClick={() => setAdminTab("search")}
                className={`flex-1 min-w-[22%] rounded-lg px-3 py-3.5 text-sm sm:text-base font-extrabold tracking-wide transition-colors ${
                  adminTab === "search"
                    ? "bg-[#a77a23] text-black shadow"
                    : "text-gray-200 hover:bg-white/5"
                }`}
              >
                Search
              </button>
            </div>

            {adminTab === "blog" ? (
              <AdminBlogPanel />
            ) : adminTab === "launch" ? (
              <AdminLaunchPanel />
            ) : adminTab === "next" ? (
              <AdminNextUpPanel />
            ) : adminTab === "neighbors" ? (
              <AdminNeighborsPanel />
            ) : adminTab === "search" ? (
              <AdminSearchMonitorPanel visits={visits} />
            ) : (
              <AdminReviewsPanel
                pending={pending}
                approved={approved}
                storage={storage}
                actionMsg={actionMsg}
                busyId={busyId}
                onAct={act}
                formatWhen={formatWhen}
                replyLang={replyLang}
                setReplyLang={setReplyLang}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                replyEnglish={replyEnglish}
                setReplyEnglish={setReplyEnglish}
                replyOut={replyOut}
                replyBusy={replyBusy}
                replyMsg={replyMsg}
                onTranslate={translateReply}
                onCopy={copyReply}
                onMailto={openMailtoReply}
                openReplyTab={Boolean(replyTo)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
