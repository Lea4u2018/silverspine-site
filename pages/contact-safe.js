// /pages/contact-safe.js
// Parallel, safe contact page that talks to /api/contact-safe
// This does NOT replace your existing /contact page.
// Visit it locally at http://localhost:3000/contact-safe

import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import FormFieldLabel, { FormRequiredNote } from "@/components/FormFieldLabel";

export default function ContactSafe() {
  const GOLD = "#a77a23";

  // Track when the form first rendered (for time-to-submit check)
  const startedAt = useMemo(() => Date.now(), []);
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState(null); // null | true | false
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "", hp: "" });

  // Client-side validators
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  const canSubmit =
    form.name.trim().length >= 2 &&
    isEmail(form.email) &&
    form.message.trim().length >= 10 &&
    !submitting;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setOk(false);
      setMsg("Please complete the form before submitting.");
      return;
    }
    setSubmitting(true);
    setOk(null);
    setMsg("");

    try {
      const res = await fetch("/api/contact-safe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "contact",
          name: form.name,
          email: form.email,
          message: form.message,
          hp: form.hp, // honeypot
          startedAt,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setOk(true);
        setMsg(data.message || "Thanks! Your message has been sent.");
        setForm({ name: "", email: "", message: "", hp: "" });
      } else {
        setOk(false);
        setMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setOk(false);
      setMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Head>
        <title>Contact (Safe) | Silver Spine Studio™</title>
        <meta name="description" content="Secure, vendor-free contact form." />
        <style>{`
          html, body, #__next { background: #000; }
          .heading { text-align:center; color:${GOLD}; font-size:2rem; font-weight:800; margin-top:1.25rem; }
          .subheading { text-align:center; color:#f3e2b8; font-size: .95rem; margin-top:.25rem; }
          .card { max-width: 740px; margin: 1rem auto; background: rgba(15,15,15,0.72); border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 20px 48px rgba(0,0,0,.5), inset 0 0 0 1px rgba(255,255,255,.03); }
          .card-body { padding: 20px 18px; }
          .label { display:block; font-size:.9rem; margin-bottom:.35rem; color:#e5e7eb; }
          .input, .textarea {
            width:100%; background: rgba(0,0,0,0.65); border:1px solid rgba(167,122,35,0.35);
            border-radius:12px; padding:.65rem .9rem; color:#f3f4f6; outline:none;
          }
          .input:focus, .textarea:focus { border-color:${GOLD}; box-shadow: 0 0 0 2px rgba(167,122,35,0.25); }
          .textarea { min-height: 160px; resize: vertical; }
          .btn {
            display:inline-flex; align-items:center; justify-content:center; gap:.5rem;
            padding:.7rem 1.1rem; border-radius:999px; font-weight:600;
            background: ${GOLD}; color:#0a0a0a; border:1px solid rgba(167,122,35,0.85);
            box-shadow: 0 8px 24px rgba(167,122,35,0.35);
          }
          .btn[disabled] { opacity:.55; cursor:not-allowed; }
          .status { text-align:center; margin-top:.75rem; }
          .status.ok { color:#a7f3d0; }   /* green-200 */
          .status.err { color:#fecaca; }  /* red-200  */
          /* Honeypot */
          .hp-wrap { position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden; }
          .note { text-align:center; font-size:.85rem; color:#9ca3af; margin-top:.5rem; }
          .link { color:#e5e7eb; }
          .link:hover { color:${GOLD}; }
        `}</style>
      </Head>

      {/* Simple local header to avoid touching your global layout */}
      <header className="border-b border-[#a77a23]/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="link font-semibold">
            ← Home
          </Link>
          <div className="text-sm text-gray-400">Safe contact (dev only)</div>
        </div>
      </header>

      <main className="px-4">
        <h1 className="heading">Contact Silver Spine Studio<span className="align-super text-xs">™</span></h1>
        <p className="subheading">This private test page posts to a secure API route—no third-party vendors.</p>

        <div className="card">
          <div className="card-body">
            <form onSubmit={onSubmit} className="space-y-5 text-left" noValidate>
              <FormRequiredNote className="text-xs text-gray-500 mb-2" />
              {/* Honeypot field (bots will fill this; humans never see it) */}
              <div className="hp-wrap" aria-hidden="true">
                <label htmlFor="hp">Leave this field empty</label>
                <input id="hp" name="hp" type="text" autoComplete="off" value={form.hp} onChange={onChange} />
              </div>

              <div>
                <FormFieldLabel htmlFor="name" className="label" required>
                  Your name
                </FormFieldLabel>
                <input
                  id="name"
                  name="name"
                  className="input"
                  type="text"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Jane Doe"
                  minLength={2}
                  required
                />
              </div>

              <div>
                <FormFieldLabel htmlFor="email" className="label" required>
                  Email address
                </FormFieldLabel>
                <input
                  id="email"
                  name="email"
                  className="input"
                  type="email"
                  inputMode="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="contact@silverspinestudio.com"
                  required
                />
              </div>

              <div>
                <FormFieldLabel htmlFor="message" className="label" required>
                  Message
                </FormFieldLabel>
                <textarea
                  id="message"
                  name="message"
                  className="textarea"
                  value={form.message}
                  onChange={onChange}
                  placeholder="How can we help?"
                  minLength={10}
                  required
                />
              </div>

              <div className="flex items-center justify-center pt-1">
                <button className="btn" type="submit" disabled={!canSubmit}>
                  {submitting ? "Sending…" : "Send message"}
                </button>
              </div>

              {ok === true && <div className="status ok">{msg}</div>}
              {ok === false && <div className="status err">{msg}</div>}
              {ok === null && (
                <div className="note">
                  Tip: if you submit instantly, the bot check may ask you to try again.
                </div>
              )}
            </form>
          </div>
        </div>

        <p className="note">
          When you’re happy with this flow, we can swap it in for your real contact page.
        </p>
      </main>
    </div>
  );
}
