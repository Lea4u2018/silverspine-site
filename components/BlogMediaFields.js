import { BLOG_FIGURE_KEYS, BLOG_IMG, BLOG_VIDEO_PICKS } from "@/lib/blogImages";

/**
 * Shared media picker — still ↔ live video for pinned + studio posts.
 */
export default function BlogMediaFields({
  form,
  setForm,
  idPrefix,
  onUpload,
  uploading,
  busy,
  showFigure = false,
}) {
  const sid = (name) => `${idPrefix}-${name}`;

  const applyVideoPick = (pickId) => {
    const pick = BLOG_VIDEO_PICKS.find((v) => v.id === pickId);
    if (!pick) return;
    setForm((f) => ({
      ...f,
      mediaType: "video",
      mediaUrl: pick.src,
      mediaPoster: pick.poster || "",
      videoLive: true,
      figureKey: "",
    }));
  };

  const clearMedia = () => {
    setForm((f) => ({
      ...f,
      mediaType: "none",
      mediaUrl: "",
      mediaPoster: "",
      mediaCaption: "",
      figureKey: "",
    }));
  };

  const onMediaTypeChange = (mediaType) => {
    setForm((f) => {
      const next = { ...f, mediaType };
      if (mediaType === "none") {
        next.mediaUrl = "";
        next.mediaPoster = "";
        next.mediaCaption = "";
        next.figureKey = "";
      } else if (mediaType === "figure") {
        next.mediaUrl = "";
        next.mediaPoster = "";
        if (!next.figureKey) next.figureKey = "cover";
      } else if (mediaType === "image") {
        next.figureKey = "";
        next.mediaPoster = "";
      } else if (mediaType === "video") {
        next.figureKey = "";
        if (next.videoLive === undefined) next.videoLive = true;
      }
      return next;
    });
  };

  const hasMedia =
    form.mediaType === "figure"
      ? Boolean(form.figureKey)
      : form.mediaType === "image" || form.mediaType === "video"
        ? Boolean(form.mediaUrl)
        : false;

  return (
    <div className="space-y-4 rounded-xl border border-[#a77a23]/25 bg-black/40 p-4">
      <div>
        <p className="text-sm font-semibold text-[#f5edd7] mb-1">Picture or video</p>
        <p className="text-xs text-gray-500 mb-3">
          Change an existing post from a <strong className="text-gray-400">still</strong> to a{" "}
          <strong className="text-gray-400">live looping video</strong> anytime — pick type below, then
          choose a site clip or paste/upload your own.
        </p>
        <label className="block text-sm mb-1" htmlFor={sid("media-type")}>
          Media type
        </label>
        <select
          id={sid("media-type")}
          value={form.mediaType}
          onChange={(e) => onMediaTypeChange(e.target.value)}
          className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2.5 text-sm"
        >
          <option value="none">No media</option>
          {showFigure ? (
            <option value="figure">Still picture — site gallery (cover, cliffside…)</option>
          ) : null}
          <option value="image">Still picture — custom image path or upload</option>
          <option value="video">Video — live loop or click-to-play</option>
        </select>
        {hasMedia || form.mediaType !== "none" ? (
          <button
            type="button"
            disabled={busy || uploading}
            onClick={clearMedia}
            className="mt-2 text-sm text-red-300 border border-red-400/40 rounded-lg px-3 py-1.5 hover:bg-red-950/30 disabled:opacity-50"
          >
            Remove picture / video
          </button>
        ) : null}
        <p className="text-xs text-gray-500 mt-2">
          To swap media: choose a new type above, or tap Remove, then pick/upload the new file.{" "}
          <strong className="text-gray-400">Save announcement</strong> when done — Cancel only closes the editor.
        </p>
      </div>

      {form.mediaType === "figure" ? (
        <div>
          <label className="block text-sm mb-1" htmlFor={sid("figure")}>
            Gallery still
          </label>
          <select
            id={sid("figure")}
            value={form.figureKey}
            onChange={(e) => setForm((f) => ({ ...f, figureKey: e.target.value }))}
            className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2.5 text-sm"
          >
            {BLOG_FIGURE_KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          {form.figureKey && BLOG_IMG[form.figureKey] ? (
            <figure className="mt-3 rounded-lg overflow-hidden border border-white/10 max-w-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BLOG_IMG[form.figureKey].src} alt="" className="w-full h-auto block" />
            </figure>
          ) : null}
        </div>
      ) : null}

      {form.mediaType === "image" || form.mediaType === "video" ? (
        <>
          {form.mediaType === "video" ? (
            <div>
              <label className="block text-sm mb-1" htmlFor={sid("video-pick")}>
                Quick pick — site live clips
              </label>
              <select
                id={sid("video-pick")}
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) applyVideoPick(e.target.value);
                  e.target.value = "";
                }}
                className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2.5 text-sm"
              >
                <option value="">Choose a live clip…</option>
                {BLOG_VIDEO_PICKS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1" htmlFor={sid("media-url")}>
                {form.mediaType === "video" ? "Video path" : "Image path"}
              </label>
              <input
                id={sid("media-url")}
                value={form.mediaUrl}
                onChange={(e) => setForm((f) => ({ ...f, mediaUrl: e.target.value }))}
                className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2.5 text-sm"
                placeholder={
                  form.mediaType === "video" ? "/covers/my-clip.mp4" : "/blog/my-photo.jpg"
                }
              />
            </div>
            {form.mediaType === "video" ? (
              <div>
                <label className="block text-sm mb-1" htmlFor={sid("poster")}>
                  Poster still (optional)
                </label>
                <input
                  id={sid("poster")}
                  value={form.mediaPoster || ""}
                  onChange={(e) => setForm((f) => ({ ...f, mediaPoster: e.target.value }))}
                  className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2.5 text-sm"
                  placeholder="/covers/poster.png"
                />
              </div>
            ) : null}
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor={sid("caption")}>
              Caption under media (optional)
            </label>
            <input
              id={sid("caption")}
              value={form.mediaCaption || ""}
              onChange={(e) => setForm((f) => ({ ...f, mediaCaption: e.target.value }))}
              className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2.5 text-sm"
            />
          </div>

          {form.mediaType === "video" ? (
            <label className="flex items-start gap-2 text-sm text-gray-200">
              <input
                type="checkbox"
                checked={form.videoLive !== false}
                onChange={(e) => setForm((f) => ({ ...f, videoLive: e.target.checked }))}
                className="rounded border-gray-600 mt-0.5"
              />
              <span>
                <strong className="text-[#f5edd7]">Live autoplay loop</strong> — plays muted like the
                moving cover (recommended). Uncheck for a clip with a play button.
              </span>
            </label>
          ) : null}

          <div>
            <label className="block text-sm mb-1" htmlFor={sid("file")}>
              Or upload {form.mediaType === "video" ? "video" : "image"}
            </label>
            <input
              id={sid("file")}
              type="file"
              accept={form.mediaType === "video" ? "video/mp4,video/webm" : "image/*"}
              disabled={uploading || busy}
              onChange={(e) => onUpload(e.target.files?.[0])}
              className="block w-full text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-[#a77a23] file:px-3 file:py-2 file:text-black file:font-semibold"
            />
            <p className="text-xs text-gray-500 mt-1">~4MB max. Larger files: put in public/ and paste path.</p>
          </div>

          {form.mediaUrl ? (
            <div className="rounded-lg overflow-hidden border border-white/10 bg-black max-w-md">
              {form.mediaType === "video" ? (
                <video
                  src={form.mediaUrl}
                  poster={form.mediaPoster || undefined}
                  controls={form.videoLive === false}
                  autoPlay={form.videoLive !== false}
                  muted
                  loop={form.videoLive !== false}
                  playsInline
                  className="w-full h-auto block"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.mediaUrl} alt="Preview" className="w-full h-auto block" />
              )}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
