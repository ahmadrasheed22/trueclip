import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Trueclip",
  description: "Terms of service for using Trueclip YouTube and TikTok features.",
};

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              These terms govern your use of Trueclip, including YouTube Shorts tracking and
              TikTok cross-posting features.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Acceptance of Terms</h2>
            <p className="text-sm leading-7 text-zinc-300">
              By using Trueclip, you agree to these Terms of Service and all applicable laws and
              platform rules.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold text-white">Service Description</h2>
            <p className="text-sm leading-7 text-zinc-300">
              Trueclip provides YouTube Shorts tracking and analytics tools and allows eligible
              cross-posting to TikTok through supported API integrations.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold text-white">User Responsibilities</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-zinc-300">
              <li>You must own or have rights to any content you post.</li>
              <li>You must comply with TikTok Terms of Service and YouTube Terms of Service.</li>
              <li>You must not upload or post content that violates copyright laws.</li>
            </ul>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold text-white">Content</h2>
            <p className="text-sm leading-7 text-zinc-300">
              Trueclip does not store your videos. The service facilitates posting via URLs and API
              handoff only.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold text-white">Account Security</h2>
            <p className="text-sm leading-7 text-zinc-300">
              You are responsible for maintaining the security of your connected accounts and
              authorized sessions.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold text-white">Termination</h2>
            <p className="text-sm leading-7 text-zinc-300">
              You may disconnect accounts at any time. Trueclip may suspend or terminate access for
              policy violations or abuse.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold text-white">Limitation of Liability</h2>
            <p className="text-sm leading-7 text-zinc-300">
              Trueclip is not responsible for TikTok API changes, account bans, posting failures,
              or third-party platform outages beyond our control.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold text-white">Changes to Terms</h2>
            <p className="text-sm leading-7 text-zinc-300">
              We may update these terms periodically. Continued use of Trueclip after updates means
              you accept the revised terms.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold text-white">Governing Law</h2>
            <p className="text-sm leading-7 text-zinc-300">
              These terms are governed by applicable local laws where the service operator is
              established.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-2xl font-semibold text-white">Contact</h2>
            <p className="text-sm leading-7 text-zinc-300">For legal inquiries, contact legal@trueclip.app.</p>
          </section>

          <footer className="mt-10 border-t border-zinc-800 pt-5 text-sm text-zinc-400">
            Last updated: April 14, 2026
          </footer>
        </article>
      </div>
    </main>
  );
}