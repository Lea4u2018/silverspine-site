/** Blog / announcement video — sized like production: 420px wide, full picture, not cropped. */
export default function BlogVideo({ src, poster, caption, label }) {
  if (!src) return null;
  return (
    <figure className="my-4 overflow-hidden rounded-xl border border-[#dfcfb5]/40 bg-black flex flex-col items-center">
      <video
        className="w-full max-w-[420px] h-auto max-h-[min(72vh,760px)] object-contain block mx-auto bg-black"
        src={src}
        poster={poster || undefined}
        controls
        playsInline
        preload="metadata"
        controlsList="nodownload"
        aria-label={label || caption || "Blog video"}
      />
      {caption ? (
        <figcaption className="w-full text-center text-xs uppercase tracking-[0.16em] text-gray-400 py-2.5 px-3">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
