import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Trueclip",
  description: "How Trueclip collects, uses, and protects user data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="legal-page">
      <div className="page-container">
        <article className="legal-card">
          <p className="legal-kicker">Legal</p>
          <h1 className="legal-title heading-font">Privacy Policy</h1>
          <p className="legal-updated">Effective date: April 13, 2026</p>

          <section className="legal-section">
            <h2>1. Information We Collect</h2>
            <p>
              We collect only the information needed to provide and improve Trueclip features,
              including account details from connected providers, usage analytics, and technical
              logs necessary for security and reliability.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. How We Use Information</h2>
            <p>
              Data is used to authenticate users, support publishing flows, improve product
              performance, and prevent abuse. We do not sell personal information.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. TikTok Integration Data</h2>
            <p>
              When you connect TikTok, we securely process authorization tokens and basic profile
              data (such as username and avatar) to enable login and content posting actions on your
              behalf.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Data Security</h2>
            <p>
              Sensitive tokens are stored in secure HTTP-only sessions. We apply reasonable technical
              and organizational safeguards to protect data from unauthorized access.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Retention</h2>
            <p>
              We keep data only for as long as necessary to operate the service, satisfy legal
              obligations, and resolve disputes.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Your Rights</h2>
            <p>
              Depending on your location, you may have rights to access, correct, or delete personal
              data. You can also disconnect third-party accounts at any time.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Contact</h2>
            <p>
              For privacy-related requests, contact the Trueclip support team. You can replace this
              section with your official legal contact details later.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
