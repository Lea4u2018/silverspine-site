// pages/_app.js
import "@/styles/globals.css";
import { Inter, Oswald } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${inter.variable} ${oswald.variable} font-sans`}>
      <Component {...pageProps} />
    </div>
  );
}
