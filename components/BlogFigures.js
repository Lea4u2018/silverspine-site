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
            className="overflow-hidden rounded-lg border border-[#dfcfb5]/40 bg-black flex flex-col items-center"
          >
            {video ? (
              <video
                src={img.src}
                className="block w-full max-w-[420px] h-auto max-h-[min(72vh,760px)] object-contain bg-black"
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
                className="block w-full max-w-[420px] h-auto max-h-[min(72vh,720px)] object-contain bg-black"
              />
            )}
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
