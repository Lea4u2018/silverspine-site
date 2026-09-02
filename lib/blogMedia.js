/** Named heights for blog picture/video ribbons. Unset = natural size. */
export const MEDIA_FRAME_BY_ID = {
  "20260901-house-facelift": "reel",
  "20260821-teaser-trailer-2": "reelLite",
  "20260823-about-my-book-journey": "podcast",
  "20260821-where-to-find-us": "cover",
  "pinned-arc-lucky-sleuthers": "cover",
  "pinned-website-inquiries": "window",
  "pinned-site-live": "cover",
  "pinned-launch-timeline": "quote",
  "pinned-brand-look": "scenic",
  "pinned-chronicle-begins": "scenic",
};

export function frameForPost(post) {
  if (!post) return "";
  const fromId = MEDIA_FRAME_BY_ID[post.id] || "";
  const raw = String(post.mediaFrame || "").trim();
  if (raw === "coverTight") return fromId || "cover";
  return fromId || raw;
}

export function mediaCardClass(frame, extra = "") {
  const base = "blog-media-card";
  const frameClass = frame ? ` blog-media-frame-${frame}` : "";
  const more = extra ? ` ${extra}` : "";
  return `${base}${frameClass}${more}`;
}
