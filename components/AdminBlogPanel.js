import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import BlogMediaFields from "@/components/BlogMediaFields";

const GOLD = "#a77a23";

const EMPTY_STUDIO = {
  id: "",
  title: "",
  body: "",
  mediaType: "none",
  mediaUrl: "",
  mediaPoster: "",
  mediaCaption: "",
  videoLive: true,
  published: true,
};

const EMPTY_PINNED = {
  id: "",
  category: "Announcement",
  dateISO: "",
  title: "",
  body: "",
  bulletsText: "",
  mediaType: "figure",
  mediaUrl: "",
  mediaPoster: "",
  mediaCaption: "",
  figureKey: "cover",
  expandBody: "",
  expandLabel: "View details",
  videoLive: true,
  published: true,
};

function formatWhen(iso) {
  try {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  } catch {
    return "—";
  }
}

function formatDisplayDate(iso) {
  try {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function AdminBlogPanel() {
  const [blogTab, setBlogTab] = useState("pinned");
  const [posts, setPosts] = useState([]);
  const [pinned, setPinned] = useState([]);
  const [storage, setStorage] = useState("");
  const [pinnedStorage, setPinnedStorage] = useState("");
  const [studioForm, setStudioForm] = useState(EMPTY_STUDIO);
  const [pinnedForm, setPinnedForm] = useState(EMPTY_PINNED);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [pinnedSnapshot, setPinnedSnapshot] = useState(null);
  const [studioSnapshot, setStudioSnapshot] = useState(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/blog");
    const data = await res.json();
    if (res.status === 401) {
      setMsg("Session expired — log in again.");
      return;
    }
    if (!res.ok || !data.ok) {
      setMsg(data.error || "Could not load blog posts.");
      return;
    }
    setPosts(Array.isArray(data.posts) ? data.posts : []);
    setPinned(Array.isArray(data.pinned) ? data.pinned : []);
    setStorage(data.storage || "");
    setPinnedStorage(data.pinnedStorage || "");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetStudio = () => {
    setStudioForm(EMPTY_STUDIO);
    setStudioSnapshot(null);
    setMsg("Editor closed. Your posts on the blog are unchanged.");
  };

  const resetPinned = () => {
    setPinnedForm(EMPTY_PINNED);
    setPinnedSnapshot(null);
    setMsg("Editor closed. Your announcements are still on the blog — nothing was deleted.");
  };

  const cancelPinnedEdit = () => {
    if (pinnedSnapshot) {
      setPinnedForm(pinnedSnapshot);
      setPinnedSnapshot(null);
      setMsg("Changes discarded — reloaded the last saved version.");
    } else {
      resetPinned();
    }
  };

  const cancelStudioEdit = () => {
    if (studioSnapshot) {
      setStudioForm(studioSnapshot);
      setStudioSnapshot(null);
      setMsg("Changes discarded.");
    } else {
      resetStudio();
    }
  };

  const editStudio = (p) => {
    setBlogTab("new");
    const loaded = {
      id: p.id,
      title: p.title || "",
      body: p.body || "",
      mediaType: p.mediaType || "none",
      mediaUrl: p.mediaUrl || "",
      mediaPoster: p.mediaPoster || "",
      mediaCaption: p.mediaCaption || "",
      videoLive: p.videoLive !== false,
      published: p.published !== false,
    };
    setStudioForm(loaded);
    setStudioSnapshot(loaded);
    setMsg(`Editing studio post: “${p.title}”.`);
    document.getElementById("blog-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const editPinned = (p) => {
    setBlogTab("pinned");
    const loaded = {
      id: p.id,
      category: p.category || "Announcement",
      dateISO: p.dateISO || "",
      title: p.title || "",
      body: p.body || "",
      bulletsText: Array.isArray(p.bullets) ? p.bullets.join("\n") : "",
      mediaType: p.mediaType || "figure",
      mediaUrl: p.mediaUrl || "",
      mediaPoster: p.mediaPoster || "",
      mediaCaption: p.mediaCaption || "",
      figureKey: p.figureKey || "cover",
      expandBody: p.expandBody || "",
      expandLabel: p.expandLabel || "View details",
      videoLive: p.videoLive !== false,
      published: p.published !== false,
    };
    setPinnedForm(loaded);
    setPinnedSnapshot(loaded);
    setMsg(`Editing announcement: “${p.title}”.`);
    document.getElementById("blog-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const saveStudio = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const action = studioForm.id ? "update" : "create";
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          id: studioForm.id || undefined,
          title: studioForm.title,
          body: studioForm.body,
          mediaType: studioForm.mediaType,
          mediaUrl: studioForm.mediaUrl,
          mediaPoster: studioForm.mediaPoster,
          mediaCaption: studioForm.mediaCaption,
          videoLive: studioForm.videoLive,
          published: studioForm.published,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data.error || "Save failed.");
        return;
      }
      setMsg(studioForm.id ? "Studio post updated." : "New post published to the Blog page.");
      resetStudio();
      await load();
    } catch {
      setMsg("Network error.");
    } finally {
      setBusy(false);
    }
  };

  const savePinned = async (e) => {
    e.preventDefault();
    if (!pinnedForm.id) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-pinned",
          id: pinnedForm.id,
          category: pinnedForm.category,
          dateISO: pinnedForm.dateISO,
          title: pinnedForm.title,
          body: pinnedForm.body,
          bulletsText: pinnedForm.bulletsText,
          mediaType: pinnedForm.mediaType,
          mediaUrl: pinnedForm.mediaUrl,
          mediaPoster: pinnedForm.mediaPoster,
          mediaCaption: pinnedForm.mediaCaption,
          videoLive: pinnedForm.videoLive,
          figureKey: pinnedForm.figureKey,
          expandBody: pinnedForm.expandBody,
          expandLabel: pinnedForm.expandLabel,
          published: pinnedForm.published,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data.error || "Save failed.");
        return;
      }
      setMsg("Announcement updated on the Blog page.");
      await load();
    } catch {
      setMsg("Network error.");
    } finally {
      setBusy(false);
    }
  };

  const removeStudio = async (id, title) => {
    if (
      !window.confirm(
        `Permanently delete “${title}” from the Blog?\n\nThis only affects New posts — not the main announcements. Cannot be undone.`
      )
    )
      return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data.error || "Delete failed.");
        return;
      }
      if (studioForm.id === id) resetStudio();
      setMsg("Post removed.");
      await load();
    } catch {
      setMsg("Network error.");
    } finally {
      setBusy(false);
    }
  };

  const togglePinnedPublish = async (p) => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: p.published ? "unpublish-pinned" : "publish-pinned",
          id: p.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data.error || "Could not update publish status.");
        return;
      }
      setMsg(p.published ? "Announcement hidden from Blog." : "Announcement shown on Blog.");
      await load();
    } catch {
      setMsg("Network error.");
    } finally {
      setBusy(false);
    }
  };

  const toggleStudioPublish = async (p) => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: p.published ? "unpublish" : "publish",
          id: p.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data.error || "Could not update publish status.");
        return;
      }
      setMsg(p.published ? "Post hidden from Blog." : "Post shown on Blog.");
      await load();
    } catch {
      setMsg("Network error.");
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (file, target) => {
    if (!file) return;
    setUploading(true);
    setMsg("");
    try {
      const mimeType = file.type || "";
      const isVideo = mimeType.startsWith("video/");
      const isImage = mimeType.startsWith("image/");
      if (!isVideo && !isImage) {
        setMsg("Choose an image (JPG/PNG/WEBP) or video (MP4/WEBM).");
        return;
      }
      if (file.size > 4.2 * 1024 * 1024) {
        setMsg("File too large for upload. Put it in public/blog/ and paste the path.");
        return;
      }
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upload",
          filename: file.name,
          mimeType,
          base64,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data.error || "Upload failed.");
        return;
      }
      const setter = target === "pinned" ? setPinnedForm : setStudioForm;
      setter((f) => ({
        ...f,
        mediaType: isVideo ? "video" : "image",
        mediaUrl: data.url,
        videoLive: isVideo,
      }));
      setMsg(`Uploaded — ${data.url}`);
    } catch (err) {
      setMsg(err?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="flex flex-wrap gap-2 p-1 rounded-xl border border-white/15 bg-black/50"
        role="tablist"
        aria-label="Blog admin sections"
      >
        {[
          { id: "pinned", label: "On Blog page", count: pinned.length },
          { id: "new", label: "New posts", count: posts.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={blogTab === tab.id}
            onClick={() => setBlogTab(tab.id)}
            className={`flex-1 min-w-[40%] rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
              blogTab === tab.id
                ? "bg-white/10 text-white border border-[#a77a23]/50"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            }`}
          >
            {tab.label}
            {tab.count > 0 ? <span className="ml-1.5 text-[#a77a23]">({tab.count})</span> : null}
          </button>
        ))}
      </div>

      {blogTab === "pinned" ? (
        <section>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: GOLD }}>
                Announcements on the Blog page ({pinned.length})
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                These are the full posts visitors see on{" "}
                <Link href="/blog" className="text-[#a77a23] hover:underline">
                  /blog
                </Link>
                . Click <strong className="text-gray-200">Edit</strong> to load one into the editor below.
              </p>
            </div>
          </div>
          {pinned.length === 0 ? (
            <p className="text-gray-400 text-sm italic">Loading announcements…</p>
          ) : (
            <div className="space-y-4 max-h-[min(55vh,520px)] overflow-y-auto pr-1 mb-6">
              {pinned.map((p) => (
                <article
                  key={p.id}
                  className={`rounded-xl border p-4 cursor-pointer transition-colors ${
                    pinnedForm.id === p.id
                      ? "border-[#a77a23]/60 bg-[#a77a23]/10"
                      : "border-white/10 bg-gray-950/80 hover:border-[#a77a23]/35"
                  }`}
                  onClick={() => editPinned(p)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      editPinned(p);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500">
                        {p.category} · {formatDisplayDate(p.dateISO)}
                        {p.mediaType !== "none" ? (
                          <>
                            {" · "}
                            {p.mediaType === "video"
                              ? p.videoLive !== false
                                ? "Live video"
                                : "Video"
                              : p.mediaType === "figure"
                                ? `Still (${p.figureKey})`
                                : "Still image"}
                          </>
                        ) : null}
                      </p>
                      <h3 className="font-semibold text-gray-100 leading-snug">{p.title}</h3>
                    </div>
                    <span className="text-xs shrink-0">
                      {p.published ? (
                        <span className="text-emerald-400">Live</span>
                      ) : (
                        <span className="text-amber-400">Hidden</span>
                      )}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto rounded-lg bg-black/30 p-3 border border-white/5">
                    {p.body}
                    {p.bullets?.length ? (
                      <>
                        {"\n\n"}
                        {p.bullets.map((b) => `• ${b}`).join("\n")}
                      </>
                    ) : null}
                    {p.expandBody ? (
                      <>
                        {"\n\n— Expandable section —\n"}
                        {p.expandBody}
                      </>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => editPinned(p)}
                      className="px-3 py-1.5 rounded-lg bg-[#a77a23] text-black text-sm font-semibold disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => togglePinnedPublish(p)}
                      className="px-3 py-1.5 rounded-lg border border-white/20 text-sm hover:border-[#a77a23]/50 disabled:opacity-50"
                    >
                      {p.published ? "Hide" : "Show"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: GOLD }}>
            New studio posts ({posts.length})
          </h2>
          {posts.length === 0 ? (
            <p className="text-gray-400 text-sm italic mb-6">
              No extra posts yet — use the editor below to add one. It appears above the announcements on /blog.
            </p>
          ) : (
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 mb-6">
              {posts.map((p) => (
                <article key={p.id} className="rounded-xl border border-white/10 bg-gray-950/80 p-4">
                  <h3 className="font-semibold text-gray-100">{p.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 mb-2">
                    {p.published ? "Live" : "Hidden"} · Updated {formatWhen(p.updatedAt || p.createdAt)}
                  </p>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap mb-3">{p.body}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => editStudio(p)}
                      className="px-3 py-1.5 rounded-lg border border-white/20 text-sm hover:border-[#a77a23]/50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => toggleStudioPublish(p)}
                      className="px-3 py-1.5 rounded-lg border border-white/20 text-sm"
                    >
                      {p.published ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => removeStudio(p.id, p.title)}
                      className="px-3 py-1.5 rounded-lg border border-red-400/40 text-sm text-red-300"
                    >
                      Delete permanently
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <section
        id="blog-editor"
        className="rounded-2xl border border-[#a77a23]/35 bg-gray-950/90 p-5 md:p-6"
      >
        {blogTab === "pinned" ? (
          <>
            <h2 className="text-xl font-extrabold mb-1" style={{ color: GOLD }}>
              {pinnedForm.id ? "Edit announcement" : "Select a post above to edit"}
            </h2>
            {!pinnedForm.id ? (
              <p className="text-sm text-gray-400">
                Click any announcement in the list to load its full text here.
              </p>
            ) : (
              <form onSubmit={savePinned} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1" htmlFor="pinned-category">
                      Category label
                    </label>
                    <input
                      id="pinned-category"
                      value={pinnedForm.category}
                      onChange={(e) => setPinnedForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" htmlFor="pinned-date">
                      Date on card
                    </label>
                    <input
                      id="pinned-date"
                      type="date"
                      value={pinnedForm.dateISO?.slice(0, 10) || ""}
                      onChange={(e) => setPinnedForm((f) => ({ ...f, dateISO: e.target.value }))}
                      className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1" htmlFor="pinned-title">
                    Title
                  </label>
                  <input
                    id="pinned-title"
                    required
                    value={pinnedForm.title}
                    onChange={(e) => setPinnedForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1" htmlFor="pinned-body">
                    Main text (blank line = new paragraph)
                  </label>
                  <textarea
                    id="pinned-body"
                    required
                    rows={8}
                    value={pinnedForm.body}
                    onChange={(e) => setPinnedForm((f) => ({ ...f, body: e.target.value }))}
                    className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1" htmlFor="pinned-bullets">
                    Bullet list (one per line, optional)
                  </label>
                  <textarea
                    id="pinned-bullets"
                    rows={4}
                    value={pinnedForm.bulletsText}
                    onChange={(e) => setPinnedForm((f) => ({ ...f, bulletsText: e.target.value }))}
                    className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1" htmlFor="pinned-expand">
                    Expandable section (timeline / notes — optional)
                  </label>
                  <textarea
                    id="pinned-expand"
                    rows={6}
                    value={pinnedForm.expandBody}
                    onChange={(e) => setPinnedForm((f) => ({ ...f, expandBody: e.target.value }))}
                    className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm"
                    placeholder="Shown when visitor clicks View timeline / View notes"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1" htmlFor="pinned-expand-label">
                    Expand button label
                  </label>
                  <input
                    id="pinned-expand-label"
                    value={pinnedForm.expandLabel}
                    onChange={(e) => setPinnedForm((f) => ({ ...f, expandLabel: e.target.value }))}
                    className="w-full max-w-md rounded-xl border border-gray-700 bg-black px-3 py-2.5 text-sm"
                  />
                </div>
                <BlogMediaFields
                  form={pinnedForm}
                  setForm={setPinnedForm}
                  idPrefix="pinned"
                  showFigure
                  onUpload={(file) => onFile(file, "pinned")}
                  uploading={uploading}
                  busy={busy}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={pinnedForm.published}
                    onChange={(e) => setPinnedForm((f) => ({ ...f, published: e.target.checked }))}
                    className="rounded border-gray-600"
                  />
                  Show on public Blog page
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    type="submit"
                    disabled={busy || uploading}
                    className="px-5 py-2.5 rounded-lg bg-[#a77a23] text-black font-semibold disabled:opacity-50"
                  >
                    {busy ? "Saving…" : "Save announcement"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={cancelPinnedEdit}
                    className="px-4 py-2.5 rounded-lg border border-white/20"
                  >
                    Close editor (don&apos;t save)
                  </button>
                  <span className="text-xs text-gray-500 w-full sm:w-auto">
                    Closing does not delete announcements — only &quot;Delete permanently&quot; on New posts removes a post.
                  </span>
                </div>
              </form>
            )}
          </>
        ) : (
          <>
            <h2 className="text-xl font-extrabold mb-1" style={{ color: GOLD }}>
              {studioForm.id ? "Edit new post" : "Create new post"}
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Appears at the very top of /blog — above the main announcements.
            </p>
            <form onSubmit={saveStudio} className="space-y-4">
              <div>
                <label className="block text-sm mb-1" htmlFor="blog-title">
                  Title
                </label>
                <input
                  id="blog-title"
                  required
                  value={studioForm.title}
                  onChange={(e) => setStudioForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="blog-body">
                  Post text
                </label>
                <textarea
                  id="blog-body"
                  required
                  rows={7}
                  value={studioForm.body}
                  onChange={(e) => setStudioForm((f) => ({ ...f, body: e.target.value }))}
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3"
                />
              </div>
              <BlogMediaFields
                form={studioForm}
                setForm={setStudioForm}
                idPrefix="studio"
                onUpload={(file) => onFile(file, "studio")}
                uploading={uploading}
                busy={busy}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={studioForm.published}
                  onChange={(e) => setStudioForm((f) => ({ ...f, published: e.target.checked }))}
                  className="rounded border-gray-600"
                />
                Show on public Blog page
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="submit"
                  disabled={busy || uploading || !studioForm.title.trim() || !studioForm.body.trim()}
                  className="px-5 py-2.5 rounded-lg bg-[#a77a23] text-black font-semibold disabled:opacity-50"
                >
                  {busy ? "Saving…" : studioForm.id ? "Save changes" : "Publish post"}
                </button>
                {studioForm.id ? (
                  <button
                    type="button"
                    onClick={cancelStudioEdit}
                    className="px-4 py-2.5 rounded-lg border border-white/20"
                  >
                    Close editor (don&apos;t save)
                  </button>
                ) : null}
              </div>
            </form>
          </>
        )}
        {msg ? <p className="text-sm text-gray-300 mt-4">{msg}</p> : null}
        {storage || pinnedStorage ? (
          <p className="text-xs text-gray-500 mt-2">
            Storage: posts={storage || "—"} · announcements={pinnedStorage || "—"}
          </p>
        ) : null}
      </section>
    </div>
  );
}
