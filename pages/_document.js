// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Keep only site-wide meta — no <title> here */}
        <meta
          name="description"
          content="Silver Spine Studio™ — Thrillers that cut deep, starting with The Beautiful Beast."
        />
      </Head>
      <body className="bg-black text-gray-100">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
