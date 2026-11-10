import type { Metadata } from "next";
import { Vazirmatn, Inter, JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { SiteShell } from "../components/site-shell";
import { buildPageMetadata, siteMetadataBase } from "../lib/seo";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
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
      className={`${vazirmatn.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body
        style={
          {
            "--zharfa-font-persian":
              "var(--font-vazirmatn), Vazirmatn, Tahoma, sans-serif",
            "--zharfa-font-latin":
              "var(--font-inter), Inter, var(--font-vazirmatn), sans-serif",
            "--zharfa-font-code":
              "var(--font-jetbrains), JetBrains Mono, ui-monospace, monospace",
          } as React.CSSProperties
        }
      >
        <SiteShell header={<SiteHeader />} footer={<SiteFooter />}>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
