import { useEffect, useState } from "react";
import { StarDisplay } from "@/components/StarRating";
import { SITE_LANGUAGES, normalizeLang } from "@/lib/i18n";

const GOLD = "#a77a23";

function ReviewCard({ review, formatWhen, busyId, onAct, variant = "pending" }) {
  const isPending = variant === "pending";
  return (
    <article
      className={`rounded-xl border p-4 ${
        isPending ? "border-amber-500/30 bg-gray-950" : "border-white/10 bg-gray-950/70"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="font-semibold" style={{ color: isPending ? GOLD : undefined }}>
          {review.name}
        </div>
        <StarDisplay value={review.rating} />
      </div>
      <p className="text-xs text-gray-500 mb-2">{formatWhen(review.createdAt)}</p>
      <p className={`whitespace-pre-wrap mb-4 ${isPending ? "text-gray-200" : "text-gray-300"}`}>
        {review.text}
      </p>
      <div className="flex flex-wrap gap-2">
        {isPending ? (
          <>
            <button
              type="button"
              disabled={busyId === review.id}
              onClick={() => onAct(review.id, "approve")}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:opacity-90 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={busyId === review.id}
              onClick={() => onAct(review.id, "reject")}
              className="px-4 py-2 rounded-lg border border-red-400/50 text-red-300 hover:bg-red-950/40 disabled:opacity-50"
            >
              Decline
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={busyId === review.id}
              onClick={() => onAct(review.id, "unpublish")}
              className="px-3 py-1.5 rounded-lg border border-white/20 text-sm hover:border-[#a77a23]/50 disabled:opacity-50"
            >
              Unpublish
            </button>
            <button
              type="button"
              disabled={busyId === review.id}
              onClick={() => onAct(review.id, "reject")}
              className="px-3 py-1.5 rounded-lg border border-red-400/40 text-sm text-red-300 disabled:opacity-50"
            >
              Decline
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function ReplyTranslator({
  replyLang,
  setReplyLang,
  replyTo,
  setReplyTo,
  replyEnglish,
  setReplyEnglish,
  replyOut,
  replyBusy,
  replyMsg,
  onTranslate,
  onCopy,
  onMailto,
  compact = false,
  idSuffix = "",
}) {
  const rows = compact ? 5 : 8;
  const sid = (base) => `${base}${idSuffix}`;
  return (
    <section
      id="reply-translator"
      className="rounded-2xl border border-[#a77a23]/40 bg-gray-950/90 p-4 md:p-5 lg:p-4 xl:p-5"
    >
      <h2 className="text-lg font-semibold mb-1" style={{ color: GOLD }}>
        Reply translator
      </h2>
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        Write in <strong className="text-gray-200">English</strong>, convert to their language, then copy or open email.
        <span className="hidden lg:inline"> Stays visible while you work the queue.</span>
      </p>
      <div className={`grid gap-3 mb-3 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
        <div>
          <label className="block text-sm text-gray-300 mb-1" htmlFor={sid("reply-lang")}>
            Their language
          </label>
          <select
            id={sid("reply-lang")}
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
          <label className="block text-sm text-gray-300 mb-1" htmlFor={sid("reply-to")}>
            Their email (optional)
          </label>
          <input
            id={sid("reply-to")}
            type="email"
            value={replyTo}
            onChange={(e) => setReplyTo(e.target.value)}
            placeholder="visitor@email.com"
            className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2.5 text-sm"
          />
        </div>
      </div>
      <label className="block text-sm text-gray-300 mb-1" htmlFor={sid("reply-en")}>
        Your reply in English
      </label>
      <textarea
        id={sid("reply-en")}
        rows={rows}
        value={replyEnglish}
        onChange={(e) => setReplyEnglish(e.target.value)}
        placeholder="Type what you want to say in English…"
        className="w-full rounded-xl border border-gray-700 bg-black px-3 py-3 text-sm mb-3"
      />
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          disabled={replyBusy || !replyEnglish.trim()}
          onClick={onTranslate}
          className="px-4 py-2.5 rounded-lg bg-[#a77a23] text-black font-semibold hover:opacity-90 disabled:opacity-50 text-sm"
        >
          {replyBusy ? "Translating…" : "Convert"}
        </button>
        <button
          type="button"
          disabled={!replyOut}
          onClick={onCopy}
          className="px-4 py-2.5 rounded-lg border border-white/20 hover:border-[#a77a23]/60 disabled:opacity-40 text-sm"
        >
          Copy
        </button>
        <button
          type="button"
          disabled={!replyOut}
          onClick={onMailto}
          className="px-4 py-2.5 rounded-lg border border-white/20 hover:border-[#a77a23]/60 disabled:opacity-40 text-sm"
        >
          Email
        </button>
      </div>
      {replyMsg ? <p className="text-sm text-gray-300 mb-2">{replyMsg}</p> : null}
      {replyOut ? (
        <div>
          <label className="block text-sm text-gray-300 mb-1">Their language version</label>
          <textarea
            readOnly
            rows={rows}
            value={replyOut}
            className="w-full rounded-xl border border-[#a77a23]/35 bg-black/80 px-3 py-3 text-sm text-[#f5f0e4]"
          />
        </div>
      ) : null}
    </section>
  );
}

function TabBar({ tabs, reviewsView, setReviewsView }) {
  return (
    <div
      className="flex flex-wrap gap-2 p-1 rounded-xl border border-white/15 bg-black/50"
      role="tablist"
      aria-label="Reviews sections"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={reviewsView === tab.id}
          onClick={() => setReviewsView(tab.id)}
          className={`flex-1 min-w-[28%] rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
            reviewsView === tab.id
              ? "bg-white/10 text-white border border-[#a77a23]/50"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
          }`}
        >
          {tab.label}
          {tab.count != null && tab.count > 0 ? (
            <span className="ml-1.5 text-[#a77a23]">({tab.count})</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

function ReviewListSection({ reviewsView, pending, approved, formatWhen, busyId, onAct }) {
  if (reviewsView === "queue") {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-2" style={{ color: GOLD }}>
          Waiting for your approval
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Approve to show on the public Reviews page. Decline to hide.
        </p>
        {pending.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No pending reviews right now.</p>
        ) : (
          <div className="space-y-4 max-h-[min(70vh,720px)] lg:max-h-[calc(100vh-11rem)] overflow-y-auto pr-1">
            {pending.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                formatWhen={formatWhen}
                busyId={busyId}
                onAct={onAct}
                variant="pending"
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-2" style={{ color: GOLD }}>
        Already on the site
      </h2>
      {approved.length === 0 ? (
        <p className="text-gray-400 text-sm italic">No approved reviews yet.</p>
      ) : (
        <div className="space-y-3 max-h-[min(70vh,720px)] lg:max-h-[calc(100vh-11rem)] overflow-y-auto pr-1">
          {approved.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              formatWhen={formatWhen}
              busyId={busyId}
              onAct={onAct}
              variant="live"
            />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Reviews tab — phone: Queue / On site / Reply tabs.
 * lg+ (iPad landscape / desktop): split — list left, sticky reply right.
 */
export default function AdminReviewsPanel({
  pending,
  approved,
  storage,
  actionMsg,
  busyId,
  onAct,
  formatWhen,
  replyLang,
  setReplyLang,
  replyTo,
  setReplyTo,
  replyEnglish,
  setReplyEnglish,
  replyOut,
  replyBusy,
  replyMsg,
  onTranslate,
  onCopy,
  onMailto,
  openReplyTab = false,
}) {
  const [reviewsView, setReviewsView] = useState(openReplyTab ? "reply" : "queue");

  useEffect(() => {
    if (openReplyTab) setReviewsView("reply");
  }, [openReplyTab]);

  // On split layout, Reply is always visible — keep list tab active
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      if (mq.matches && reviewsView === "reply") setReviewsView("queue");
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [reviewsView]);

  const replyProps = {
    replyLang,
    setReplyLang,
    replyTo,
    setReplyTo,
    replyEnglish,
    setReplyEnglish,
    replyOut,
    replyBusy,
    replyMsg,
    onTranslate,
    onCopy,
    onMailto,
  };

  const listTabs = [
    { id: "queue", label: "Queue", count: pending.length },
    { id: "live", label: "On site", count: approved.length },
  ];
  const mobileTabs = [...listTabs, { id: "reply", label: "Reply", count: null }];

  const listView = reviewsView === "live" ? "live" : "queue";

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#a77a23]/45 bg-[#a77a23]/15 px-4 py-3 text-sm">
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

      {/* Phone / narrow: three tabs, one panel */}
      <div className="lg:hidden space-y-4">
        <TabBar tabs={mobileTabs} reviewsView={reviewsView} setReviewsView={setReviewsView} />
        {reviewsView === "reply" ? (
          <ReplyTranslator {...replyProps} idSuffix="-mobile" />
        ) : (
          <ReviewListSection
            reviewsView={reviewsView}
            pending={pending}
            approved={approved}
            formatWhen={formatWhen}
            busyId={busyId}
            onAct={onAct}
          />
        )}
      </div>

      {/* iPad / desktop: split — reply always visible */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_min(420px,38%)] lg:gap-6 lg:items-start">
        <div className="min-w-0 space-y-4">
          <TabBar tabs={listTabs} reviewsView={listView} setReviewsView={setReviewsView} />
          <ReviewListSection
            reviewsView={listView}
            pending={pending}
            approved={approved}
            formatWhen={formatWhen}
            busyId={busyId}
            onAct={onAct}
          />
        </div>
        <div className="sticky top-[4.75rem] max-h-[calc(100vh-6rem)] overflow-y-auto">
          <ReplyTranslator {...replyProps} compact idSuffix="-side" />
        </div>
      </div>
    </div>
  );
}
