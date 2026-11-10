import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { FloatingNav } from "@/components/FloatingNav";
import { SiteFooter } from "@/components/SiteFooter";

/** Self-hosted fonts: avoids next/font/google build-time fetches that Turbopack
 *  reports as Module not found on Vercel when fonts.gstatic.com flakes. */
const sans = localFont({
  src: "../fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "400 800",
  display: "swap",
});

const mono = localFont({
  src: [
    {
      path: "../fonts/ibm-plex-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/ibm-plex-mono-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mihira Murthy",
    template: "%s · Mihira Murthy",
  },
  description:
    "Portfolio of Mihira Murthy, UMD CS and Engineering AI/ML student. Software engineering, applied AI, and selected runnable demos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        {children}
        <SiteFooter />
        <FloatingNav />
      </body>
    </html>
  );
}
