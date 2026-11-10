import type { Metadata } from "next";
import { Vazirmatn, JetBrains_Mono } from "next/font/google";
import { buildPageMetadata, siteMetadataBase } from "../lib/seo";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
  preload: true,
});

/** Code samples only — not preloaded so Persian LCP stays light. */
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
    template: "%s | ژرفا",
  },
};

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
      className={`${vazirmatn.variable} ${jetbrainsMono.variable}`}
    >
      <body
        style={
          {
            "--zharfa-font-persian":
              "var(--font-vazirmatn), Vazirmatn, Tahoma, sans-serif",
            "--zharfa-font-latin":
              "var(--font-vazirmatn), Vazirmatn, Tahoma, sans-serif",
            "--zharfa-font-code":
              "var(--font-jetbrains), ui-monospace, monospace",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
