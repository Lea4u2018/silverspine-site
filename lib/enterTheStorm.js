/**
 * Enter The Storm — Book One candle line (The Beautiful Beast).
 * Shown on Studio Shop as a second tab. Checkout stays off until sales go live.
 * Do not list Books 2–7 titles or covers here.
 */
export const ENTER_THE_STORM_SALES = false;

/** Page and shop tab are visible. Hidden Clue is local-only until she turns it on for the live site. */
export const ENTER_THE_STORM_PUBLIC = true;
export const ENTER_THE_STORM_CLUE_LIVE = process.env.NODE_ENV !== "production";

export const ENTER_THE_STORM = {
  brand: "Enter The Storm",
  studio: "Silver Spine Studio™",
  book: "The Beautiful Beast",
  bookLine: "Book One",
  firstScent: "Hidden Rage",
  netWeight: "Net wt. at pour",
  vessel: "8 oz amber  |  _ hrs",
  coverSrc: "/covers/1-the-beautiful-beast-hardcover.png",
  labelSrc: "/enter-the-storm/hidden-rage-wrap.jpg",
  jarSrc: "/enter-the-storm/jar-hero.jpg?v=clue-box",
  wrapSrc: "/enter-the-storm/hidden-rage-wrap.jpg",
  clueLines: ["22:48", "The file still open."],
  clueKeys: ["22:48 the file still open.", "22:48 the file still open", "2248 the file still open"],
  // Percent of jar-hero.jpg — Hidden Clue under the black bar
  slot: { left: "34.63%", top: "67.00%", width: "30.65%", height: "2.83%" },
  fileUnlock: [
    "22:48 is not a bedtime. It is not a shift change. It is the stamp in the corner of a page that was touched after the building should have been empty.",
    "The hall clock said one thing. This stamp said another. Twelve minutes before the hour, someone still had the folder open. A file that was supposed to be put away was not. That is what makes the minute special. Who kept it open — and what they saw — stays in the book.",
  ],
};

export function featuredStormCandle() {
  return ENTER_THE_STORM_CANDLES.find((c) => c.featured) || ENTER_THE_STORM_CANDLES[0];
}

/**
 * First collection. Scent names for the jar; chapter # is for her notes.
 * Chapter titles that match later-book names are not used as public scent names.
 */
export const ENTER_THE_STORM_CANDLES = [
  {
    slug: "hidden-rage",
    scent: "Hidden Rage",
    chapter: 3,
    featured: true,
    notes: "First scent. Deep, close, not a smile.",
    story:
      "The first jar is Hidden Rage. Amber glass. Every scent reveals a new mystery...",
  },
  {
    slug: "hanging-silence",
    scent: "Hanging Silence",
    chapter: 1,
    notes: "Cold room. Held breath.",
  },
  {
    slug: "holiday-echoes",
    scent: "Holiday Echoes",
    chapter: 2,
    notes: "Warm spice over something that will not stay.",
  },
  {
    slug: "fractured-echoes",
    scent: "Fractured Echoes",
    chapter: 4,
    notes: "Smoke and glass.",
  },
  {
    slug: "ghost-in-the-file",
    scent: "Ghost in the File",
    chapter: 5,
    notes: "Paper, ink, night.",
  },
  {
    slug: "whispers-in-the-dark",
    scent: "Whispers in the Dark",
    chapter: 6,
    notes: "Bar neon. Untouched glass.",
  },
  {
    slug: "blood-in-the-water",
    scent: "Blood in the Water",
    chapter: 9,
    notes: "Iron and rain.",
  },
  {
    slug: "storm-glass",
    scent: "Storm Glass",
    chapter: 21,
    notes: "Ozone before the break.",
  },
];
