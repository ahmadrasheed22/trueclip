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
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/trueclip_icon_1024x1024.png",
  },
  other: {
    "tiktok-developers-site-verification": "WBEkGL12zExpGgfUqlhy5QdIEH0htJZH",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="icon" type="image/png" href="/trueclip_icon_1024x1024.png" />
        <link rel="apple-touch-icon" href="/trueclip_icon_1024x1024.png" />
      </head>
      <body className={`${dmSans.className} ${dmSans.variable} ${syne.variable}`}>
        <Navbar syneFont={syne.className} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
