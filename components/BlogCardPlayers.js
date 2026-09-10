import { useEffect, useRef } from "react";

function spotifyEmbedSrc(url) {
  const m = String(url || "").match(/open\.spotify\.com\/episode\/([a-zA-Z0-9]+)/i);
  return m ? `https://open.spotify.com/embed/episode/${m[1]}?theme=0` : "";
}

export function pauseBlogCardMedia(card) {
  if (!card || card.dataset.sssMediaOff === "1") return;
  card.dataset.sssMediaOff = "1";
  card.querySelectorAll("video, audio").forEach((el) => {
    try {
      el.pause();
    } catch {
      /* ignore */
    }
  });
  card.querySelectorAll("iframe").forEach((frame) => {
    try {
      frame.contentWindow?.postMessage({ command: "pause" }, "*");
    } catch {
      /* ignore */
    }
    const src = frame.getAttribute("src") || "";
    if (/spotify\.com|youtube\.com|youtube-nocookie|vimeo\.com/i.test(src)) {
      frame.src = src;
    }
  });
  card.dispatchEvent(new CustomEvent("sss-stop-card-media"));
}

function feedIsScrollRoot(feed) {
  if (!feed) return false;
  const oy = window.getComputedStyle(feed).overflowY;
  return oy === "auto" || oy === "scroll";
}

/** Only the card in view keeps sound/video. Others stop. */
export function useBlogFeedSoloMedia(feedRef, extraKey) {
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return undefined;

    const ratios = new Map();

    const apply = () => {
      let best = null;
      let bestR = 0;
      ratios.forEach((r, el) => {
        if (r > bestR) {
          bestR = r;
          best = el;
        }
      });
      feed.querySelectorAll("article").forEach((card) => {
        if (card === best && bestR >= 0.22) {
          card.dataset.sssMediaOff = "";
          return;
        }
        pauseBlogCardMedia(card);
      });
    };

    let io;
    const connect = () => {
      io?.disconnect();
      ratios.clear();
      const root = feedIsScrollRoot(feed) ? feed : null;
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            ratios.set(entry.target, entry.intersectionRatio);
          });
          apply();
        },
        { root, threshold: [0, 0.08, 0.18, 0.3, 0.45, 0.6, 0.8, 1] }
      );
      feed.querySelectorAll("article").forEach((article) => io.observe(article));
    };

    connect();
    const mo = new MutationObserver(() => connect());
    mo.observe(feed, { childList: true });
    window.addEventListener("resize", connect);
    const onHidden = () => {
      if (document.hidden) {
        feed.querySelectorAll("article").forEach(pauseBlogCardMedia);
      }
    };
    document.addEventListener("visibilitychange", onHidden);

    return () => {
      io?.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", connect);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [feedRef, extraKey]);
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

    const stop = () => pauseBlogCardMedia(card);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) stop();
        });
      },
      { root: feedIsScrollRoot(feed) ? feed : null, threshold: 0.22 }
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
