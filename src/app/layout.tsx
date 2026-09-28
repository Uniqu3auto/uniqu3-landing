import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

// Fetched at build time and served from our own origin — no runtime request to
// Google, no layout shift. Consumed by --font-sans in globals.css.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UNIQU3 — Professional Auto Repair. Wherever You Are.",
  description:
    "UNIQU3 connects vehicle owners with professional mobile mechanics who come to you. Join the waitlist before launch.",
};

export const viewport: Viewport = {
  themeColor: "#060B16",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}