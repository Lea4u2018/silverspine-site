// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#000000" />
        <meta name="author" content="Leameso James" />
        <meta property="og:site_name" content="Silver Spine Studio™" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/Final_Silver_Spine_Circular_Logo_With_Words_Transparant.png" />
        {/* Official Gumroad Overlay Engine Setup */}
        <script src="https://gumroad.com" async></script>
      </Head>
      <body className="bg-black text-gray-100">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
