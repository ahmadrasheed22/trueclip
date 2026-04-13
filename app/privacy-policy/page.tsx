import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Trueclip",
  description: "How Trueclip collects, uses, and protects user data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] py-10">
      <div className="mx-auto w-full max-w-4xl px-6">
        <article className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 text-zinc-200 md:p-10">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="mb-4">Last updated: April 13, 2026</p>
          <p>Trueclip (Shortshub) respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website and TikTok integration features.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>TikTok account information (username, avatar, access token) when you log in using TikTok Login Kit</li>
            <li>Short video clips you create or upload</li>
            <li>Usage data and analytics</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>To enable seamless TikTok login, display your current account, and allow logout</li>
            <li>To post your short videos directly to TikTok with auto-generated captions and trending hashtags</li>
            <li>To improve our service</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Sharing with Third Parties</h2>
          <p>We only share your TikTok access token with TikTok’s official APIs to perform login and posting on your behalf. We do not sell your personal data.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>If you have any questions, contact us at support@trueclip.com</p>
        </article>
      </div>
    </main>
  );
}
