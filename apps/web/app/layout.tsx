import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono, Orbitron, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { buildPageMetadata, siteMetadataBase } from "../lib/seo";
import "./globals.css";

const iranSans = localFont({
  src: [
    {
      path: "./fonts/IRANSansWeb_UltraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/IRANSansWeb_Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/IRANSansWeb.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/IRANSansWeb_Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/IRANSansWeb_Medium.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/IRANSansWeb_Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/IRANSansWeb_Bold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/IRANSansWeb_Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-iransans",
  display: "swap",
  preload: true,
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

/** Brand wordmark / Latin display — Knowledge Portal identity. */
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-dx-brand",
  display: "swap",
  preload: false,
  weight: ["500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  preload: false,
  weight: ["500", "600", "700", "800"],
});

/** Code + tech kickers / overlines. */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: siteMetadataBase.title,
    description: siteMetadataBase.description,
    path: "/",
  }),
  title: {
    default: siteMetadataBase.title,
    template: "%s | DXCode",
  },
};

const persianStack =
  "var(--font-iransans), IRANSans, IRANSansWeb, Tahoma, sans-serif";
const brandStack =
  "var(--font-dx-brand), Orbitron, var(--font-plus-jakarta), sans-serif";
const latinStack =
  "var(--font-plus-jakarta), Plus Jakarta Sans, var(--font-iransans), Tahoma, sans-serif";
const techStack =
  "var(--font-jetbrains), JetBrains Mono, ui-monospace, monospace";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      data-theme="dark"
      className={`${iranSans.variable} ${iranSans.className} ${orbitron.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        style={
          {
            "--zharfa-font-persian": persianStack,
            "--zharfa-font-latin": latinStack,
            "--zharfa-font-code": techStack,
            "--dx-font-brand": brandStack,
            "--dx-font-tech": techStack,
          } as React.CSSProperties
        }
      >
        <Script id="zharfa-theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("zharfa-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
