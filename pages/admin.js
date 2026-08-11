import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StarDisplay } from "@/components/StarRating";
import AdminBlogPanel from "@/components/AdminBlogPanel";
import { SITE_LANGUAGES, languageLabel, normalizeLang } from "@/lib/i18n";

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
  const [adminTab, setAdminTab] = useState("reviews"); // "reviews" | "blog"

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

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session");
      const data = await res.json();
      const ok = Boolean(data.ok);
      setAuthed(ok);
      if (ok) await loadReviews();
    } catch {
      setAuthed(false);
    } finally {
      setChecking(false);
    }
  }, [loadReviews]);

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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
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
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
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
            <div
              className="mb-8 flex gap-2 p-1 rounded-xl border border-[#a77a23]/40 bg-black/60 sticky top-0 z-20"
              role="tablist"
              aria-label="Admin sections"
            >
              <button
                type="button"
                role="tab"
                id="admin-tab-reviews"
                aria-selected={adminTab === "reviews"}
                onClick={() => setAdminTab("reviews")}
                className={`flex-1 rounded-lg px-4 py-3.5 text-base font-extrabold tracking-wide transition-colors ${
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
                className={`flex-1 rounded-lg px-4 py-3.5 text-base font-extrabold tracking-wide transition-colors ${
                  adminTab === "blog"
                    ? "bg-[#a77a23] text-black shadow"
                    : "text-gray-200 hover:bg-white/5"
                }`}
              >
                Blog
              </button>
            </div>

            {adminTab === "blog" ? (
              <AdminBlogPanel />
            ) : (
              <>
                <div className="mb-6 rounded-xl border border-[#a77a23]/45 bg-[#a77a23]/15 px-4 py-3 text-sm">
                  <strong style={{ color: GOLD }}>Pending:</strong> {pending.length}
                  <span className="mx-2 text-gray-500">·</span>
                  <strong className="text-gray-200">Live on site:</strong> {approved.length}
                  {storage ? (
                    <>
                      <span className="mx-2 text-gray-500">·</span>
                      <span className="text-gray-400">Storage: {storage}</span>
                    </>
                  ) : null}
                  {actionMsg ? <p className="mt-2 text-gray-200">{actionMsg}</p> : null}
                </div>

                <section className="mb-10">
                  <h2 className="text-lg font-semibold mb-3" style={{ color: GOLD }}>
                    Waiting for your approval
                  </h2>
                  <p className="text-sm text-gray-400 mb-4">
                    Approve to show on the public Reviews page. Decline to hide.
                  </p>
                  {pending.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No pending reviews right now.</p>
                  ) : (
                    <div className="space-y-4">
                      {pending.map((r) => (
                        <article key={r.id} className="rounded-xl border border-amber-500/30 bg-gray-950 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="font-semibold" style={{ color: GOLD }}>
                              {r.name}
                            </div>
                            <StarDisplay value={r.rating} />
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{formatWhen(r.createdAt)}</p>
                          <p className="text-gray-200 whitespace-pre-wrap mb-4">{r.text}</p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={busyId === r.id}
                              onClick={() => act(r.id, "approve")}
                              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:opacity-90 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={busyId === r.id}
                              onClick={() => act(r.id, "reject")}
                              className="px-4 py-2 rounded-lg border border-red-400/50 text-red-300 hover:bg-red-950/40 disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <section className="mb-10">
                  <h2 className="text-lg font-semibold mb-3" style={{ color: GOLD }}>
                    Already on the site
                  </h2>
                  {approved.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No approved reviews yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {approved.map((r) => (
                        <article key={r.id} className="rounded-xl border border-white/10 bg-gray-950/70 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <div className="font-semibold text-gray-100">{r.name}</div>
                            <StarDisplay value={r.rating} />
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{formatWhen(r.createdAt)}</p>
                          <p className="text-gray-300 whitespace-pre-wrap mb-3">{r.text}</p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={busyId === r.id}
                              onClick={() => act(r.id, "unpublish")}
                              className="px-3 py-1.5 rounded-lg border border-white/20 text-sm hover:border-[#a77a23]/50 disabled:opacity-50"
                            >
                              Unpublish
                            </button>
                            <button
                              type="button"
                              disabled={busyId === r.id}
                              onClick={() => act(r.id, "reject")}
                              className="px-3 py-1.5 rounded-lg border border-red-400/40 text-sm text-red-300 disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <section
                  id="reply-translator"
                  className="rounded-2xl border border-[#a77a23]/40 bg-gray-950/90 p-5 md:p-6"
                >
                  <h2 className="text-lg font-semibold mb-1" style={{ color: GOLD }}>
                    Reply translator
                  </h2>
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                    Write in <strong className="text-gray-200">English</strong>, convert to their language, then copy or open email.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1" htmlFor="reply-lang">
                        Their language
                      </label>
                      <select
                        id="reply-lang"
                        value={replyLang}
                        onChange={(e) => setReplyLang(normalizeLang(e.target.value))}
                        className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2.5 text-sm"
                      >
                        {SITE_LANGUAGES.map((l) => (
                          <option key={l.code} value={l.code}>
                            {l.native} — {l.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1" htmlFor="reply-to">
                        Their email (optional)
                      </label>
                      <input
                        id="reply-to"
                        type="email"
                        value={replyTo}
                        onChange={(e) => setReplyTo(e.target.value)}
                        placeholder="visitor@email.com"
                        className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2.5 text-sm"
                      />
                    </div>
                  </div>
                  <label className="block text-sm text-gray-300 mb-1" htmlFor="reply-en">
                    Your reply in English
                  </label>
                  <textarea
                    id="reply-en"
                    rows={6}
                    value={replyEnglish}
                    onChange={(e) => setReplyEnglish(e.target.value)}
                    placeholder="Type what you want to say in English…"
                    className="w-full rounded-xl border border-gray-700 bg-black px-3 py-3 text-sm mb-3"
                  />
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      type="button"
                      disabled={replyBusy || !replyEnglish.trim()}
                      onClick={translateReply}
                      className="px-4 py-2.5 rounded-lg bg-[#a77a23] text-black font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {replyBusy ? "Translating…" : "Convert to their language"}
                    </button>
                    <button
                      type="button"
                      disabled={!replyOut}
                      onClick={copyReply}
                      className="px-4 py-2.5 rounded-lg border border-white/20 hover:border-[#a77a23]/60 disabled:opacity-40"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      disabled={!replyOut}
                      onClick={openMailtoReply}
                      className="px-4 py-2.5 rounded-lg border border-white/20 hover:border-[#a77a23]/60 disabled:opacity-40"
                    >
                      Open in email
                    </button>
                  </div>
                  {replyMsg ? <p className="text-sm text-gray-300 mb-2">{replyMsg}</p> : null}
                  {replyOut ? (
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Their language version</label>
                      <textarea
                        readOnly
                        rows={6}
                        value={replyOut}
                        className="w-full rounded-xl border border-[#a77a23]/35 bg-black/80 px-3 py-3 text-sm text-[#f5f0e4]"
                      />
                    </div>
                  ) : null}
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
