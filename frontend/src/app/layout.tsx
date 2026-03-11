import type { Metadata } from "next";
import { Sora, Space_Mono } from "next/font/google";
import Script from "next/script";

import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Telegram Mini App",
  description: "Production-ready Telegram Mini App frontend built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${spaceMono.variable} antialiased`}>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_#fce7f3_0,_transparent_45%),radial-gradient(circle_at_bottom_right,_#cffafe_0,_transparent_35%),linear-gradient(145deg,_#f8fafc_0%,_#fff7ed_50%,_#eef2ff_100%)]" />
        {children}
      </body>
    </html>
  );
}
