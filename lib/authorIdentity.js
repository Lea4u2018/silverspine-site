import { SAME_AS_STUDIO, SAME_AS_AUTHOR } from "@/lib/socials";

export const SITE_ORIGIN = "https://www.silverspinestudio.com";
export const PUBLIC_AUTHOR_NAME = "Leameso James";
export const STUDIO_NAME = "Silver Spine Studio";

/** Public author @id — use everywhere Person schema appears. */
export const AUTHOR_ID = `${SITE_ORIGIN}/#author`;
export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

/**
 * Single public author identity for the live site, stores, and schema.
 * Do NOT add former legal names here — that would teach Google to link them.
 */
export function authorPersonSchema(extra = {}) {
  return {
    "@type": "Person",
    "@id": AUTHOR_ID,
    name: PUBLIC_AUTHOR_NAME,
    givenName: "Leameso",
    familyName: "James",
    jobTitle: "Author",
    url: `${SITE_ORIGIN}/about`,
    image: `${SITE_ORIGIN}/author-full-length.jpg`,
    worksFor: { "@id": ORGANIZATION_ID },
    sameAs: SAME_AS_AUTHOR,
    ...extra,
  };
}

export function organizationSchema(extra = {}) {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: STUDIO_NAME,
    alternateName: ["Silver Spine Studio™", "SilverSpineStudio"],
    url: `${SITE_ORIGIN}/`,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_ORIGIN}/google-brand-logo.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_ORIGIN}/google-brand-logo.png`,
    email: "contact@silverspinestudio.com",
    sameAs: SAME_AS_STUDIO,
    founder: { "@id": AUTHOR_ID },
    ...extra,
  };
}

/** Homepage @graph — tells Google the author is Leameso James at this site only. */
export function buildHomeSchemaGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      authorPersonSchema(),
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: STUDIO_NAME,
        url: `${SITE_ORIGIN}/`,
        publisher: { "@id": ORGANIZATION_ID },
        author: { "@id": AUTHOR_ID },
      },
      {
        "@type": "Book",
        name: "The Beautiful Beast",
        author: { "@id": AUTHOR_ID },
        publisher: { "@id": ORGANIZATION_ID },
        url: `${SITE_ORIGIN}/books/the-beautiful-beast`,
        image: `${SITE_ORIGIN}/covers/1-the-beautiful-beast-full-tagged.png`,
        genre: ["Thriller", "Crime", "Rural Noir"],
      },
    ],
  };
}

/** About page — Person is the main entity. */
export function buildAboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      authorPersonSchema({
        mainEntityOfPage: `${SITE_ORIGIN}/about`,
        description:
          "Author of The Beautiful Beast and the Seven-Fold Chronicle. Publishes as Leameso James through Silver Spine Studio™.",
      }),
      {
        "@type": "ProfilePage",
        "@id": `${SITE_ORIGIN}/about#profile`,
        url: `${SITE_ORIGIN}/about`,
        name: `About ${PUBLIC_AUTHOR_NAME}`,
        mainEntity: { "@id": AUTHOR_ID },
        isPartOf: { "@id": WEBSITE_ID },
      },
    ],
  };
}
