// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#000000" />
        <meta name="msvalidate.01" content="48B013F26A102482A50819DF2467BA5D" />
        <meta name="p:domain_verify" content="ceb17d7fd65f938f3187d8c5397c1f91" />
        <meta name="author" content="Leameso James" />
        <meta property="og:site_name" content="Silver Spine Studio™" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        {/* Google Search wants a crawlable square favicon (multiple of 48px). Absolute URLs help. */}
        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href="https://www.silverspinestudio.com/favicon-48.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="https://www.silverspinestudio.com/favicon-96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="https://www.silverspinestudio.com/favicon-192.png"
        />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="mask-icon" href="/favicon-192.png" color="#000000" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .skiptranslate, .goog-te-banner-frame, iframe.skiptranslate, iframe.goog-te-banner-frame,
              #goog-gt-tt, .goog-te-balloon-frame, .goog-te-ftab, #gt-nvframe,
              .VIpgJd-ZVi9od-ORHb-OEVmcd, .VIpgJd-ZVi9od-aZ2wEe-wOHMyf, .VIpgJd-ZVi9od-ORHb {
                display:none!important;visibility:hidden!important;height:0!important;width:0!important;
                opacity:0!important;pointer-events:none!important;position:absolute!important;
                left:-9999px!important;top:-9999px!important;overflow:hidden!important;border:0!important;
              }
              html,body{top:0!important;margin-top:0!important;}
            `,
          }}
        />
        {/* Rescue: if someone is stuck on an old translate.goog bookmark, send them home */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(!/\\.translate\\.goog$/.test(location.hostname))return;try{localStorage.setItem("sss-lang","en");}catch(e){}document.cookie="sss-lang=en;path=/;max-age=31536000;SameSite=Lax";location.replace("https://www.silverspinestudio.com"+(location.pathname||"/")+(location.hash||""));}catch(e){}})();`,
          }}
        />
        <script src="https://gumroad.com" async></script>
      </Head>
      <body className="bg-black text-gray-100">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.cookie="googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";document.cookie="googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain="+location.hostname+";";try{localStorage.setItem("sss-lang","en");}catch(e){}document.cookie="sss-lang=en;path=/;max-age=31536000;SameSite=Lax";document.documentElement.classList.remove("translated-ltr","translated-rtl");document.documentElement.style.top="0";if(document.body)document.body.style.top="0";}catch(e){}})();`,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
