// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-black text-gray-100">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
