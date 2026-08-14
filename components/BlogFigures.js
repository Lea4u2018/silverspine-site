/**
 * Still images or short videos for a blog post.
 * Put files in /public/blog/, then pass:
 *   [{ src: "/blog/my-photo.jpg", alt: "…", caption: "…" }]
 *   [{ src: "/blog/my-clip.mp4", alt: "…", caption: "…" }]
 * Optional: type: "video" | "image" (auto-detected from extension if omitted)
 */
function isVideoSrc(img) {
  if (img?.type === "video") return true;
  if (img?.type === "image") return false;
  return /\.(mp4|webm|mov)(\?|$)/i.test(String(img?.src || ""));
}

export default function BlogFigures({ images = [] }) {
  if (!Array.isArray(images) || images.length === 0) return null;

  return (
    <div className="mt-4 space-y-4">
      {images.map((img) => {
        if (!img?.src) return null;
        const video = isVideoSrc(img);
        return (
          <figure
            key={img.src}
            className="overflow-hidden rounded-lg border border-white/10 bg-black/50"
          >
            {video ? (
              <video
                src={img.src}
                className="block w-full h-auto max-h-[420px] object-cover object-center bg-black"
                controls
                playsInline
                muted
                loop
                preload="metadata"
                aria-label={img.alt || "Blog video"}
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={img.src}
                alt={img.alt || ""}
                loading="lazy"
                draggable="false"
                className="block w-full h-auto max-h-[420px] object-cover object-center"
              />
            )}
            {img.caption ? (
              <figcaption className="px-3 py-2 text-xs text-gray-300 border-t border-white/10 leading-relaxed">
                {img.caption}
              </figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}
