import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Trueclip",
  description: "Terms governing the use of Trueclip.",
};

export default function TermsOfServicePage() {
  return (
    <main className="legal-page">
      <div className="page-container">
        <article className="legal-card">
          <p className="legal-kicker">Legal</p>
          <h1 className="legal-title heading-font">Terms of Service</h1>
          <p className="legal-updated">Effective date: April 13, 2026</p>

          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Trueclip, you agree to these Terms of Service and all applicable
              laws and platform policies.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Account Responsibility</h2>
            <p>
              You are responsible for activity under your connected accounts and must keep your
              credentials and connected sessions secure.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Acceptable Use</h2>
            <p>
              You agree not to misuse the service, violate third-party rights, post unlawful content,
              or attempt to bypass security controls.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Third-Party Platforms</h2>
            <p>
              Trueclip integrates with third-party services such as TikTok. Your use of those services
              is also governed by their terms and policies.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Service Availability</h2>
            <p>
              We may modify, suspend, or discontinue features at any time. We do not guarantee
              uninterrupted or error-free operation.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Limitation of Liability</h2>
            <p>
              To the extent permitted by law, Trueclip is not liable for indirect, incidental, or
              consequential damages arising from use of the service.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use after updates means you accept
              the revised terms.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
