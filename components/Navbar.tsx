"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TikTokLogin from "@/components/TikTokLogin";

type NavbarProps = {
  syneFont: string;
};

export default function Navbar({ syneFont }: NavbarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <header className="navbar">
        <div className="page-container navbar-inner">
          <div className="navbar-brand-wrap">
            <button
              type="button"
              className="menu-btn"
              aria-label="Open menu"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>

            <Link href="/" className={`logo flex items-center gap-2 ${syneFont}`} aria-label="Trueclip home">
              <Image 
                src="/trueclip_icon_1024x1024.png" 
                alt="Trueclip Icon" 
                width={32} 
                height={32} 
                className="rounded-lg"
              />
              <div>
                <span className="logo-true">true</span>
                <span className="logo-clip">clip</span>
              </div>
            </Link>
          </div>

          <nav className="navbar-links" aria-label="Primary">
            <Link href="/">Home</Link>
            <Link href="/generate">AI Clips</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <TikTokLogin />
          </nav>
        </div>
      </header>
    </>
  );
}
