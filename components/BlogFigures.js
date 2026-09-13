import { mediaCardClass } from "@/lib/blogMedia";

function isVideoSrc(img) {
  if (img?.type === "video") return true;
  if (img?.type === "image") return false;
  return /\.(mp4|webm|mov)(\?|$)/i.test(String(img?.src || ""));
}

export default function BlogFigures({ images = [], frame }) {
  if (!Array.isArray(images) || images.length === 0) return null;

  return (
    <div className="mt-4 space-y-4">
      {images.map((img) => {
        if (!img?.src) return null;
        const video = isVideoSrc(img);
        return (
          <figure key={img.src} className={mediaCardClass(frame)}>
            <div className="blog-media-stage">
              {video ? (
                <video
                  src={img.src}
                  className="blog-media-fill"
                  controls
                  playsInline
                  preload="metadata"
                  controlsList="nodownload"
                  aria-label={img.alt || "Blog video"}
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={img.src}
                  alt={img.alt || ""}
                  loading="lazy"
                  draggable="false"
                  className="blog-media-fill"
                />
              )}
            </div>
            {img.caption ? (
              <figcaption className="w-full px-3 py-2.5 text-sm text-gray-300 border-t border-[#dfcfb5]/25 leading-relaxed text-center">
                {img.caption}
              </figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}
