import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lute and Loot",
  description: "Manage your D&D sessions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased m-0 p-0 overflow-hidden">
        {children}
        <Analytics />
        <Script
          src="https://storage.ko-fi.com/cdn/widget/Widget_2.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
