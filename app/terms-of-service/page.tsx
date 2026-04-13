import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Trueclip",
  description: "Terms governing the use of Trueclip.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-[calc(100vh-64px)] py-10">
      <div className="mx-auto w-full max-w-4xl px-6">
        <article className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 text-zinc-200 md:p-10">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <p className="mb-4">Last updated: April 13, 2026</p>
          <p>Welcome to Trueclip (Shortshub). By using our service you agree to these Terms.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Service Description</h2>
          <p>Trueclip lets users create short videos and post them directly to their TikTok account with one click, including smart captions and trending hashtags.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. TikTok Integration</h2>
          <p>We use official TikTok Login Kit and Content Posting API. When you click “Post to TikTok”, you authorize us to post the video to your TikTok account.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>You may only post content you own or have rights to use</li>
            <li>You are responsible for following TikTok’s Community Guidelines</li>
            <li>You can log out or switch accounts anytime</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Account Display</h2>
          <p>After logging in, we clearly show your current TikTok username and avatar. A Logout button is always available.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>support@trueclip.com</p>
        </article>
      </div>
    </main>
  );
}
