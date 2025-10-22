import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "D&D Manager",
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
      </body>
    </html>
  );
}
