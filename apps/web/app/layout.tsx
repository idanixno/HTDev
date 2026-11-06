import type { Metadata } from "next";
import { Vazirmatn, Inter, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import { SiteHeader } from "../components/site-header";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ژرفا | اطلس یادگیری عمیق",
  description:
    "اطلس یادگیریِ آرمان راد؛ از اولین مسئله تا تصمیم‌های معماری. مسیرت را با پیش‌نیاز روشن و تمرین واقعی بساز.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

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
        <div className={isAdmin ? "shell shell--admin" : "shell"}>
          {isAdmin ? null : <SiteHeader />}
          <main className="shell__main">{children}</main>
        </div>
      </body>
    </html>
  );
}
