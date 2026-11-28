import Head from "next/head";
import Link from "next/link";
import StormAtmosphere from "@/components/StormAtmosphere";
import StoreHub from "@/components/StoreHub";
import { SAME_AS_STUDIO, SAME_AS_AUTHOR } from "@/lib/socials";

export default function TheBeautifulBeast() {
  // SEO data for this specific book
  const title = "The Beautiful Beast | Silver Spine Studio™";
  const description =
    "A storm-soaked thriller set against the Million-Dollar Highway, dragging secrets into the light. A novel by Leameso James.";
  const url = "https://www.silverspinestudio.com/books/the-beautiful-beast";
  const ogImage = "https://www.silverspinestudio.com/covers/1-the-beautiful-beast-full-tagged.png";

  const bookJsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: "The Beautiful Beast",
    author: {
      "@type": "Person",
      name: "Leameso James",
      sameAs: SAME_AS_AUTHOR,
    },
    publisher: {
      "@type": "Organization",
      name: "Silver Spine Studio™",
      url: "https://www.silverspinestudio.com/",
      logo: {
        "@type": "ImageObject",
        url: "https://www.silverspinestudio.com/google-brand-logo.png",
        width: 512,
        height: 512,
      },
      sameAs: SAME_AS_STUDIO,
    },
    image: ogImage,
    description: description,
  };

  return (
    <div className="text-gray-100 min-h-screen flex flex-col relative z-10">
      <StormAtmosphere mood="noir" />
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />

        {/* Open Graph */}
        <meta property="og:type" content="book" />
        <meta property="og:site_name" content="Silver Spine Studio" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={ogImage} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />

        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
        />
      </Head>

      {/* Main Content */}
      <main className="flex-1 px-6 py-10 text-center max-w-3xl mx-auto">
        <div className="relative w-full max-w-[320px] mx-auto aspect-[2/3] mb-6 overflow-hidden rounded-lg shadow-lg">
          <video
            src="/covers/1-the-beautiful-beast-motion.mp4"
            poster="/covers/1-the-beautiful-beast-full-tagged.png"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="The Beautiful Beast live cover"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-yellow-400">
          The Beautiful Beast
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          A storm-soaked thriller set against the Million-Dollar Highway,
          dragging secrets into the light. A novel by <b>Leameso James</b>.
        </p>

        <div className="space-y-3 mb-8 max-w-md mx-auto text-left">
          <StoreHub variant="compact" liveOnly />
          <Link
            href="/shop"
            className="w-full inline-flex items-center justify-center gap-2 font-semibold tracking-wide text-[#dfcfb5] border border-[#dfcfb5]/45 hover:bg-[#dfcfb5]/10 transition-all duration-200 text-center py-3 px-6 rounded-xl text-sm"
          >
            Full store hub · coming soon doors
          </Link>
        </div>

        <Link
          href="/books"
          className="inline-block mt-2 px-6 py-3 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition"
        >
          ← Back to All Books
        </Link>
      </main>
    </div>
  );
}
