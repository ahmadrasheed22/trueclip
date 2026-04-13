import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Trueclip",
  description: "Privacy policy for Trueclip TikTok and YouTube integrations.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-black py-10 text-zinc-100">
      <div className="mx-auto w-full max-w-[800px] px-6">
        <article className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 md:p-10">
          <header className="mb-8 border-b border-zinc-800 pb-6">
            <Link
              href="/"
              className="text-sm font-semibold uppercase tracking-[0.08em] text-indigo-300 transition hover:text-indigo-200"
            >
              Back to Home
            </Link>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white md:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              Trueclip is a YouTube Shorts analytics and cross-posting platform. This Privacy
              Policy explains what data we collect and how we use it when you use Trueclip,
              including TikTok integration features.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Introduction</h2>
            <p className="text-sm leading-7 text-zinc-300">
              Trueclip provides tools for browsing YouTube Shorts performance and posting eligible
              content to TikTok through official APIs. This page is publicly accessible and does
              not require login.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold text-white">Data We Collect</h2>
            <h3 className="text-base font-semibold text-zinc-100">TikTok account data</h3>
            <p className="text-sm leading-7 text-zinc-300">
              Profile details such as avatar and display name, plus OAuth access tokens required
              for TikTok login and posting.
            </p>
            <h3 className="text-base font-semibold text-zinc-100">YouTube data</h3>
            <p className="text-sm leading-7 text-zinc-300">
              Public channel and video analytics, including channel metadata and Shorts statistics.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold text-white">How We Use Data</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-zinc-300">
              <li>Cross-posting videos to TikTok when you explicitly request publishing.</li>
              <li>Displaying connected account information inside the Trueclip interface.</li>
              <li>Showing YouTube analytics and related channel insights.</li>
            </ul>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold text-white">Data Storage</h2>
            <p className="text-sm leading-7 text-zinc-300">
              Tokens are stored in encrypted localStorage and are not persisted in a server
              database. Trueclip does not maintain a long-term token database for user accounts.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold text-white">Third Parties</h2>
            <p className="text-sm leading-7 text-zinc-300">
              Trueclip integrates only with TikTok API and YouTube API for authentication,
              publishing, and analytics.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold text-white">User Rights</h2>
            <p className="text-sm leading-7 text-zinc-300">
              You can disconnect linked accounts at any time and request data deletion. Disconnect
              actions revoke future posting access from Trueclip.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold text-white">Security</h2>
            <p className="text-sm leading-7 text-zinc-300">
              Trueclip uses AES-256 encryption for token handling and follows standard transport
              security practices for API communication.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold text-white">Contact</h2>
            <p className="text-sm leading-7 text-zinc-300">
              For privacy questions, contact privacy@trueclip.app.
            </p>
          </section>

          <footer className="mt-10 border-t border-zinc-800 pt-5 text-sm text-zinc-400">
            Last updated: April 14, 2026
          </footer>
        </article>
      </div>
    </main>
  );
}