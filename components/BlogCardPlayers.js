import { useEffect, useRef } from "react";

function spotifyEmbedSrc(url) {
  const m = String(url || "").match(/open\.spotify\.com\/episode\/([a-zA-Z0-9]+)/i);
  return m ? `https://open.spotify.com/embed/episode/${m[1]}?theme=0` : "";
}

/** Native + Spotify players that stop when this blog post leaves the feed. */
export default function BlogCardPlayers({ audioUrl, spotifyUrl, title }) {
  const boxRef = useRef(null);
  const audioRef = useRef(null);
  const frameRef = useRef(null);
  const embed = spotifyEmbedSrc(spotifyUrl);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;
    const card = box.closest("article") || box;
    const feed = card.closest(".blog-feed");

    const stop = () => {
      const a = audioRef.current;
      if (a) {
        try {
          a.pause();
        } catch {
          /* ignore */
        }
      }
      const frame = frameRef.current;
      if (frame?.contentWindow) {
        try {
          frame.contentWindow.postMessage({ command: "pause" }, "*");
        } catch {
          /* ignore */
        }
      }
      if (frame?.src && embed) {
        frame.src = embed;
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) stop();
        });
      },
      { root: feed || null, threshold: 0.18 }
    );
    io.observe(card);

    const onHidden = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", onHidden);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [embed]);

  if (!audioUrl && !embed) return null;

  return (
    <div ref={boxRef}>
      {embed ? (
        <iframe
          ref={frameRef}
          className="w-full my-3 rounded-xl"
          style={{ border: 0, minHeight: 152 }}
          src={embed}
          title={`${title} on Spotify`}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      ) : audioUrl ? (
        <audio
          ref={audioRef}
          className="w-full my-3"
          src={audioUrl}
          controls
          preload="metadata"
          controlsList="nodownload"
          aria-label={`${title} audio`}
        />
      ) : null}
    </div>
  );
}
