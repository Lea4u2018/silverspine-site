import Link from "next/link";
import { useState } from "react";
import BlogFigures from "@/components/BlogFigures";
import BlogVideo from "@/components/BlogVideo";
import ConfettiBurst from "@/components/ConfettiBurst";
import { BLOG_IMG } from "@/lib/blogImages";

const GOLD = "#dfcfb5";
const REQUEST_EMAIL = "contact@silverspinestudio.com";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { label: iso, attr: iso };
    return {
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      attr: iso.slice(0, 10),
    };
  } catch {
    return { label: iso, attr: iso };
  }
}

function ExpandBlock({ body, id, openLabel = "View details", closeLabel = "Hide details" }) {
  const [open, setOpen] = useState(false);
  if (!body?.trim()) return null;

  const blocks = body.split(/\n\n+/).filter(Boolean);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-block px-3 py-2 rounded-lg bg-[#dfcfb5] text-black text-sm font-semibold hover:opacity-90 transition"
        aria-expanded={open}
        aria-controls={id}
      >
        {open ? closeLabel : openLabel}
      </button>
      <div
        id={id}
        className={`disclosure mt-3 ${open ? "open" : ""}`}
        style={{
          maxHeight: open ? 4000 : 0,
          opacity: open ? 1 : 0,
          transition: "max-height 260ms ease, opacity 220ms ease",
        }}
      >
        <div className="rounded-lg border border-[#dfcfb5]/45 p-4 bg-black/40 text-sm text-gray-200 space-y-3">
          {blocks.map((block, i) => {
            const lines = block.split("\n").filter(Boolean);
            const isList = lines.every((l) => /^[\d]+\.|^•/.test(l.trim()));
            if (isList) {
              return (
                <ul key={i} className="list-disc ml-5 space-y-2">
                  {lines.map((line, j) => (
                    <li key={j}>{line.replace(/^[\d]+\.\s*|^•\s*/, "")}</li>
                  ))}
                </ul>
              );
            }
            if (lines.length === 1 && !block.includes("\n")) {
              return (
                <h4 key={i} className="text-lg font-semibold" style={{ color: GOLD }}>
                  {block}
                </h4>
              );
            }
            return (
              <p key={i} className="whitespace-pre-wrap">
                {block}
              </p>
            );
          })}
        </div>
      </div>
    </>
  );
}

/**
 * Renders one pinned announcement from Admin-editable storage.
 */
export default function PinnedBlogCard({ post, onLaunchList, onArc, onPress }) {
  const date = formatDate(post.dateISO);
  const actions = Array.isArray(post.actions) ? post.actions : [];
  const figure = post.figureKey && BLOG_IMG[post.figureKey] ? BLOG_IMG[post.figureKey] : null;

  const actionButtons = [];

  if (actions.includes("contact-sites")) {
    actionButtons.push(
      <Link
        key="contact-sites"
        href="/contact?topic=sites"
        className="inline-block px-3 py-2 rounded-lg bg-[#dfcfb5] text-black text-sm font-semibold hover:opacity-90 transition"
      >
        Contact — website inquiries
      </Link>
    );
  }
  if (actions.includes("books")) {
    actionButtons.push(
      <Link
        key="books"
        href="/books"
        className={`inline-block px-3 py-2 rounded-lg text-sm font-semibold transition ${
          actionButtons.length === 0
            ? "bg-[#dfcfb5] text-black hover:opacity-90"
            : "border border-[#dfcfb5]/60 text-[#dfcfb5] hover:bg-[#dfcfb5]/10"
        }`}
      >
        {actions.includes("contact-sites") ? "Back to Books" : "Explore the Books"}
      </Link>
    );
  }
  if (actions.includes("shop")) {
    actionButtons.push(
      <Link
        key="shop"
        href="/shop"
        className="inline-block px-3 py-2 rounded-lg border border-[#dfcfb5]/60 text-[#dfcfb5] text-sm font-semibold hover:bg-[#dfcfb5]/10 transition"
      >
        Visit the Shop
      </Link>
    );
  }
  if (actions.includes("launch-list")) {
    actionButtons.push(
      <button
        key="launch-list"
        type="button"
        onClick={onLaunchList}
        className={`inline-block px-3 py-2 rounded-lg text-sm font-semibold transition ${
          actionButtons.length === 0
            ? "bg-[#dfcfb5] text-black hover:opacity-90"
            : "border border-[#dfcfb5]/60 text-[#dfcfb5] hover:bg-[#dfcfb5]/10"
        }`}
      >
        Join the launch list
      </button>
    );
  }
  if (actions.includes("arc")) {
    actionButtons.push(
      <button
        key="arc"
        type="button"
        onClick={onArc}
        className="inline-block px-3 py-2 rounded-lg border border-[#dfcfb5]/60 text-[#dfcfb5] text-sm font-semibold hover:bg-[#dfcfb5]/10 transition"
      >
        Request early-release ARC
      </button>
    );
  }
  if (actions.includes("press")) {
    actionButtons.push(
      <button
        key="press"
        type="button"
        onClick={onPress}
        className="inline-block px-3 py-2 rounded-lg border border-[#dfcfb5]/60 text-[#dfcfb5] text-sm font-semibold hover:bg-[#dfcfb5]/10 transition"
      >
        Request press kit
      </button>
    );
  }

  const hasTimelineToggle = actions.includes("timeline-toggle");
  const hasBrandToggle = actions.includes("brand-notes-toggle");
  const showConfetti = post.id === "pinned-arc-lucky-sleuthers" || post.confetti === true;

  const bodyBlock = (
    <>
      {post.body
        ? post.body.split(/\n\n+/).map((para, i) => (
            <p key={i} className="text-gray-200 mb-3 text-base leading-relaxed whitespace-pre-wrap">
              {para.includes("contact@") ? (
                <>
                  {para.split("contact@silverspinestudio.com")[0]}
                  <a
                    href={`mailto:${REQUEST_EMAIL}`}
                    className="text-[#dfcfb5] font-semibold hover:underline"
                  >
                    {REQUEST_EMAIL}
                  </a>
                  {para.split("contact@silverspinestudio.com")[1] || ""}
                </>
              ) : para.includes("silverspinestudio.com/contact") ? (
                <>
                  {para.split("silverspinestudio.com/contact?topic=sites")[0]}
                  <Link href="/contact?topic=sites" className="text-[#dfcfb5] font-semibold hover:underline">
                    silverspinestudio.com/contact?topic=sites
                  </Link>
                  {para.split("silverspinestudio.com/contact?topic=sites")[1] || ""}
                </>
              ) : (
                para
              )}
            </p>
          ))
        : null}
      {post.bullets?.length ? (
        <ul className="text-gray-200 text-base list-disc ml-5 mb-1 space-y-1.5">
          {post.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      ) : null}
    </>
  );

  return (
    <article className="relative overflow-visible rounded-xl bg-black/75 border border-[#dfcfb5]/55 p-5 hover:border-[#dfcfb5] transition backdrop-blur-[1px]">
      {showConfetti ? <ConfettiBurst whenVisible delayMs={350} durationMs={11000} /> : null}
      <div className="relative z-[1]">
      <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
        <span className="uppercase tracking-wide">{post.category || "Announcement"}</span>
        {date.label ? <time dateTime={date.attr}>{date.label}</time> : null}
      </div>
      <h3 className="text-2xl font-semibold mb-3 leading-snug" style={{ color: GOLD }}>
        {post.title}
      </h3>

      {post.mediaType === "video" && post.mediaUrl ? (
        <BlogVideo
          src={post.mediaUrl}
          poster={post.mediaPoster}
          caption={post.mediaCaption}
          label={post.title}
        />
      ) : null}

      {post.mediaType === "figure" && figure ? <BlogFigures images={[figure]} /> : null}

      {post.mediaType === "image" && post.mediaUrl ? (
        <figure className="my-4 overflow-hidden rounded-xl border border-[#dfcfb5]/40 bg-black flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.mediaUrl}
            alt={post.mediaCaption || post.title}
            className="w-full max-w-[420px] h-auto max-h-[min(72vh,720px)] object-contain block mx-auto"
          />
          {post.mediaCaption ? (
            <figcaption className="text-center text-[11px] uppercase tracking-[0.16em] text-gray-400 py-2.5 px-3">
              {post.mediaCaption}
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      {post.body || post.bullets?.length ? <div className="pinned-copy-scroll">{bodyBlock}</div> : null}

      <div className="flex flex-wrap gap-3 mt-4">
        {hasTimelineToggle && post.expandBody ? (
          <ExpandBlock
            body={post.expandBody}
            id={`expand-${post.id}`}
            openLabel={post.expandLabel || "View timeline"}
            closeLabel="Hide timeline"
          />
        ) : null}
        {hasBrandToggle && post.expandBody ? (
          <ExpandBlock
            body={post.expandBody}
            id={`expand-${post.id}`}
            openLabel={post.expandLabel || "View notes"}
            closeLabel="Hide notes"
          />
        ) : null}
        {actionButtons}
      </div>

      <p className="text-gray-400 text-xs mt-4 italic">Happy Sleuthing.</p>
      </div>
    </article>
  );
}
