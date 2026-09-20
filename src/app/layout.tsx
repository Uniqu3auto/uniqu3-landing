import type { Metadata, Viewport } from "next";

import "./globals.css";

const jakarta = { variable: "font-jakarta" };

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
