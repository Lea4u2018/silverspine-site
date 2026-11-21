import { mediaCardClass } from "@/lib/blogMedia";

/** Picture fills the gold frame. Height comes from mediaFrame — never a thin ribbon. */
export default function BlogVideo({ src, poster, caption, label, frame }) {
  if (!src) return null;
  return (
    <figure className={mediaCardClass(frame, "my-4")}>
      <div className="blog-media-stage">
        <video
          className="blog-media-fill"
          src={src}
          poster={poster || undefined}
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload"
          aria-label={label || caption || "Blog video"}
        />
      </div>
      {caption ? (
        <figcaption className="w-full text-center text-xs uppercase tracking-[0.16em] text-gray-400 py-2.5 px-3">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
