import type { Metadata } from "next";
import { Vazirmatn, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ژرفا | Zharfa",
  description: "پلتفرم آموزش شخصی ژرفا",
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
            "--zharfa-font-persian": "var(--font-vazirmatn), Vazirmatn, Tahoma, sans-serif",
            "--zharfa-font-code":
              "var(--font-jetbrains), JetBrains Mono, ui-monospace, monospace",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
