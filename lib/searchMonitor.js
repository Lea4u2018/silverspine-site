/** Search & traffic monitor — quick links for admin (no API keys required). */

export const SITE_ORIGIN = "https://www.silverspinestudio.com";

export const SEARCH_MONITOR = {
  googleVerificationFile: "googlec8ad01620994b74b.html",
  sitemapUrl: `${SITE_ORIGIN}/sitemap.xml`,
  robotsUrl: `${SITE_ORIGIN}/robots.txt`,
};

export const SEARCH_DASHBOARDS = [
  {
    key: "gsc",
    title: "Google Search Console",
    subtitle: "Clicks, impressions, queries, indexing — your main scoreboard",
    href: "https://search.google.com/search-console?resource_id=https%3A%2F%2Fwww.silverspinestudio.com%2F",
    accent: "primary",
    note: "Verification file is on your site. Open this to confirm the property shows Verified.",
  },
  {
    key: "bing",
    title: "Bing Webmaster Tools",
    subtitle: "Bing search performance + URL inspection",
    href: "https://www.bing.com/webmasters/home",
    accent: "secondary",
    note: "Site uses msvalidate meta tag in the page head for Bing.",
  },
  {
    key: "vercel",
    title: "Vercel Analytics",
    subtitle: "Page views and traffic on silverspine-site",
    href: "https://vercel.com/leameso-james-projects/silverspine-site/analytics",
    accent: "secondary",
    note: "Complements Search Console — shows visits, not search queries.",
  },
];

/** Google Trends — topic interest, not your site rank. */
export const TRENDS_QUERIES = [
  { label: "The Beautiful Beast", q: "The Beautiful Beast book" },
  { label: "Silver Spine Studio", q: "Silver Spine Studio" },
  { label: "Leameso James", q: "Leameso James" },
  { label: "Colorado thriller", q: "Colorado thriller" },
];

export function trendsExploreUrl(query, geo = "US") {
  const params = new URLSearchParams({ q: query, geo });
  return `https://trends.google.com/trends/explore?${params.toString()}`;
}

export const WEEKLY_SEARCH_CHECKLIST = [
  "Search Console → Performance: note clicks & top queries (last 28 days).",
  "Search Console → Pages: confirm /, /shop, /books get impressions.",
  "Search Console → Indexing: no new errors or excluded pages.",
  "Bing Webmaster → check crawl stats if you use Bing.",
  "Compare with admin visitor counts above (site opens vs Google clicks).",
];
