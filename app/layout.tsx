import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "Trueclip - YouTube Shorts Tracker",
  description:
    "Search any YouTube channel and instantly browse and download their Shorts.",
  other: {
    "tiktok-domain-verification": "tjvBdCa1YkL9GehhP80jrLgulH2sbFhz",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${dmSans.className} ${dmSans.variable} ${syne.variable}`}>
        <Navbar syneFont={syne.className} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
