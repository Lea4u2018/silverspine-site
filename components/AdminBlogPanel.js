import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const GOLD = "#a77a23";

const EMPTY_FORM = {
  id: "",
  title: "",
  body: "",
  mediaType: "none",
  mediaUrl: "",
  mediaCaption: "",
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

export default function AdminBlogPanel() {
  const [posts, setPosts] = useState([]);
  const [storage, setStorage] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);

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
    setStorage(data.storage || "");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => setForm(EMPTY_FORM);

  const editPost = (p) => {
    setForm({
      id: p.id,
      title: p.title || "",
      body: p.body || "",
      mediaType: p.mediaType || "none",
      mediaUrl: p.mediaUrl || "",
      mediaCaption: p.mediaCaption || "",
      published: p.published !== false,
    });
    setMsg(`Editing “${p.title}”.`);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const action = form.id ? "update" : "create";
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          id: form.id || undefined,
          title: form.title,
          body: form.body,
          mediaType: form.mediaType,
          mediaUrl: form.mediaUrl,
          mediaCaption: form.mediaCaption,
          published: form.published,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data.error || "Save failed.");
        return;
      }
      setMsg(form.id ? "Post updated." : "New post published to the Blog page.");
      resetForm();
      await load();
    } catch {
      setMsg("Network error.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id, title) => {
    if (!window.confirm(`Remove “${title}” from the Blog? This cannot be undone.`)) return;
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
      if (form.id === id) resetForm();
      setMsg("Post removed.");
      await load();
    } catch {
      setMsg("Network error.");
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async (p) => {
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

  const onFile = async (file) => {
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
        setMsg(
          isVideo
            ? "Video too large for upload (~4MB max). Put it in public/blog/ and paste the path (example: /blog/my-clip.mp4)."
            : "Image too large (~3.5MB max). Compress it, or paste a path under /blog/."
        );
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
      setForm((f) => ({
        ...f,
        mediaType: isVideo ? "video" : "image",
        mediaUrl: data.url,
      }));
      setMsg(`Uploaded — ${data.url}`);
    } catch (err) {
      setMsg(err?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#a77a23]/35 bg-gray-950/90 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-extrabold" style={{ color: GOLD }}>
              {form.id ? "Edit blog post" : "Create new blog post"}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Posts you publish appear at the top of{" "}
              <Link href="/blog" className="text-[#a77a23] hover:underline">
                /blog
              </Link>
              . Add a still picture or a video clip.
            </p>
          </div>
          <Link
            href="/blog"
            className="text-sm text-gray-300 hover:text-white underline-offset-2 hover:underline"
          >
            View Blog page →
          </Link>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="blog-title">
              Title
            </label>
            <input
              id="blog-title"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 focus:outline-none focus:border-[#a77a23]"
              placeholder="Your post title"
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
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 focus:outline-none focus:border-[#a77a23]"
              placeholder="Write your announcement or update…"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1" htmlFor="blog-media-type">
                Media
              </label>
              <select
                id="blog-media-type"
                value={form.mediaType}
                onChange={(e) => setForm((f) => ({ ...f, mediaType: e.target.value }))}
                className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2.5 text-sm"
              >
                <option value="none">No media</option>
                <option value="image">Still picture</option>
                <option value="video">Video clip</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="blog-caption">
                Media caption (optional)
              </label>
              <input
                id="blog-caption"
                value={form.mediaCaption}
                onChange={(e) => setForm((f) => ({ ...f, mediaCaption: e.target.value }))}
                className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2.5 text-sm"
                placeholder="Short caption under the media"
              />
            </div>
          </div>

          {form.mediaType !== "none" ? (
            <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
              <div>
                <label className="block text-sm mb-1" htmlFor="blog-media-url">
                  Media path or URL
                </label>
                <input
                  id="blog-media-url"
                  value={form.mediaUrl}
                  onChange={(e) => setForm((f) => ({ ...f, mediaUrl: e.target.value }))}
                  className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2.5 text-sm"
                  placeholder={
                    form.mediaType === "video"
                      ? "/blog/my-clip.mp4 or https://…"
                      : "/blog/my-photo.jpg or https://…"
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: files already on the site work as paths like{" "}
                  <code className="text-gray-400">/blog/cliffside-snow.jpg</code> or{" "}
                  <code className="text-gray-400">/covers/seven-spines-noir-window.mp4</code>.
                </p>
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="blog-file">
                  Or upload a file
                </label>
                <input
                  id="blog-file"
                  type="file"
                  accept={form.mediaType === "video" ? "video/mp4,video/webm" : "image/*"}
                  disabled={uploading || busy}
                  onChange={(e) => onFile(e.target.files?.[0])}
                  className="block w-full text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-[#a77a23] file:px-3 file:py-2 file:text-black file:font-semibold"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload limit ~4MB (phone clips / compressed photos). Larger videos: ask me to place the file, then paste the path.
                </p>
              </div>
              {form.mediaUrl ? (
                <div className="rounded-lg overflow-hidden border border-white/10 bg-black max-w-md">
                  {form.mediaType === "video" ? (
                    <video src={form.mediaUrl} controls playsInline className="w-full h-auto block" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.mediaUrl} alt="Preview" className="w-full h-auto block" />
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          <label className="flex items-center gap-2 text-sm text-gray-200">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              className="rounded border-gray-600"
            />
            Show on public Blog page
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy || uploading || !form.title.trim() || !form.body.trim()}
              className="px-5 py-2.5 rounded-lg bg-[#a77a23] text-black font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Saving…" : form.id ? "Save changes" : "Publish post"}
            </button>
            {form.id ? (
              <button
                type="button"
                disabled={busy}
                onClick={resetForm}
                className="px-4 py-2.5 rounded-lg border border-white/20 hover:border-[#a77a23]/60"
              >
                Cancel edit / new post
              </button>
            ) : null}
          </div>
          {msg ? <p className="text-sm text-gray-300">{msg}</p> : null}
          {storage ? (
            <p className="text-xs text-gray-500">Storage: {storage}</p>
          ) : null}
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3" style={{ color: GOLD }}>
          Your posts ({posts.length})
        </h2>
        {posts.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No posts yet — create your first one above.</p>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <article
                key={p.id}
                className="rounded-xl border border-white/10 bg-gray-950/80 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-100">{p.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.published ? (
                        <span className="text-emerald-400">Live on Blog</span>
                      ) : (
                        <span className="text-amber-400">Hidden</span>
                      )}
                      {" · "}
                      {p.mediaType !== "none" ? `${p.mediaType} · ` : ""}
                      Updated {formatWhen(p.updatedAt || p.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-3 whitespace-pre-wrap">
                  {p.body}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => editPost(p)}
                    className="px-3 py-1.5 rounded-lg border border-white/20 text-sm hover:border-[#a77a23]/50 disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => togglePublish(p)}
                    className="px-3 py-1.5 rounded-lg border border-white/20 text-sm hover:border-[#a77a23]/50 disabled:opacity-50"
                  >
                    {p.published ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => remove(p.id, p.title)}
                    className="px-3 py-1.5 rounded-lg border border-red-400/40 text-sm text-red-300 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
