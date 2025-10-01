import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

export default function TheBeautifulBeast() {
  // SEO data for this specific book
  const title = "The Beautiful Beast | Silver Spine Studio™";
  const description =
    "A storm-soaked thriller set against the Million-Dollar Highway, dragging secrets into the light. A novel by Leameso James.";
  const url = "https://www.silverspinestudio.com/books/the-beautiful-beast";
  const ogImage = "https://www.silverspinestudio.com/covers/beautiful-beast.jpg";

  const bookJsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": "The Beautiful Beast",
    "author": {
      "@type": "Person",
      "name": "Leameso James",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Silver Spine Studio™",
    },
    "image": ogImage,
    "description": description,
  };

  return (
    <div className="bg-black text-gray-100 min-h-screen flex flex-col">
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
        <div className="relative w-full h-[500px] mb-6">
          <Image
            src="/covers/beautiful-beast.jpg"
            alt="The Beautiful Beast cover"
            layout="fill"
            objectFit="contain"
            className="rounded-lg shadow-lg"
          />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-yellow-400">
          The Beautiful Beast
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          A storm-soaked thriller set against the Million-Dollar Highway,
          dragging secrets into the light. A novel by <b>Leameso James</b>.
        </p>

        {/* Back to Books */}
        <Link
          href="/books"
          className="inline-block mt-4 px-6 py-3 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition"
        >
          ← Back to All Books
        </Link>
      </main>
    </div>
  );
}
