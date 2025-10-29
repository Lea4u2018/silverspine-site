// /components/Layout.js
import Footer from "@/components/Footer";

export default function Layout({ children, footerNote }) {
  return (
    <div className="bg-black text-white">
      <main>{children}</main>
      <Footer note={footerNote} />
    </div>
  );
}
