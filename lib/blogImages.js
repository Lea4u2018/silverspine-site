/** Shared blog hero / figure assets for pinned posts and the Blog page. */
export const BLOG_IMG = {
  cover: {
    src: "/blog/beautiful-beast-cover.jpg",
    alt: "The Beautiful Beast cover art",
    caption: "The Beautiful Beast — Book One of the Seven-Fold Chronicle.",
  },
  arcQuote: {
    src: "/blog/quote-arc-week.jpg",
    alt: "ARC week announcement on a snow mountain road",
    caption: "ARC week is open — full novel November 1, 2026.",
  },
  cliffside: {
    src: "/blog/cliffside-snow.jpg",
    alt: "Lone figure on a snowy cliff overlooking a mountain valley",
    caption: "Cliffside — where the storm begins.",
  },
  highway: {
    src: "/blog/highway-night-banner.jpg",
    alt: "Cinematic night highway through a Colorado canyon",
    caption: "Colorado highway night — the chronicle’s road.",
  },
  snowRoad: {
    src: "/blog/snow-mountain-road.jpg",
    alt: "Wet mountain highway at night with taillights in the snow",
    caption: "Million-Dollar Highway atmosphere — wet asphalt, snow, and debt.",
  },
};

export const BLOG_FIGURE_KEYS = Object.keys(BLOG_IMG);

/** Ready-made motion clips on the site — pick in Admin → Blog. */
export const BLOG_VIDEO_PICKS = [
  {
    id: "seven-spines",
    label: "Seven spines in storm window",
    src: "/covers/seven-spines-noir-window.mp4",
    poster: "/covers/seven-spines-noir-window.png",
  },
  {
    id: "beast-cover",
    label: "Beautiful Beast live cover",
    src: "/covers/1-the-beautiful-beast-motion.mp4",
    poster: "/covers/1-the-beautiful-beast-full-tagged.png",
  },
];
