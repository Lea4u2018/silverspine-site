// /pages/_app.js
import "@/styles/globals.css";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Default footer (all pages)
  let footerNote = null;

  // About + Blog: show Lea's exact footer message
  const isAbout = router.pathname === "/about";
  const isBlog = router.pathname === "/blog" || router.pathname.startsWith("/blog/");

  if (isAbout || isBlog) {
    footerNote = (
      <>
        <p className="mb-2">
          © {new Date().getFullYear()} <span style={{ color: "#a77a23" }}>Silver Spine Studio™</span>. All rights reserved.
        </p>
        <p className="text-gray-300">
          Built from the ground up—line by line in <span style={{ color: "#a77a23" }}>PyCharm</span>, using <span style={{ color: "#a77a23" }}>Next.js</span>, <span style={{ color: "#a77a23" }}>React</span>, and <span style={{ color: "#a77a23" }}>Tailwind&nbsp;CSS</span>. Crafted with precision and attention to detail—no page-builder templates or auto-generators.
        </p>
      </>
    );
  }

  return (
    <Layout footerNote={footerNote}>
      <Component {...pageProps} />
    </Layout>
  );
}
