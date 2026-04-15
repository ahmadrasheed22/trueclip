import type { Metadata } from "next";
import LegalPageLayout, { LegalSection } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service | Trueclip",
  description: "Terms of service for using Trueclip YouTube and TikTok integrations.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Terms of Service"
      description="These Terms govern your use of Trueclip, including YouTube Shorts discovery features and optional TikTok integration features."
      lastUpdated="April 15, 2026"
    >
      <LegalSection title="Acceptance and Eligibility">
        <p>
          By accessing or using Trueclip, you agree to these Terms and all applicable laws,
          platform terms, and community policies.
        </p>
      </LegalSection>

      <LegalSection title="Service Scope">
        <p>
          Trueclip helps users discover and analyze public YouTube Shorts, and can support TikTok
          login and publishing workflows where platform permissions are granted.
        </p>
      </LegalSection>

      <LegalSection title="User Responsibilities">
        <ul className="list-disc space-y-2 pl-5">
          <li>You must only upload or publish content you own or are authorized to use.</li>
          <li>You must comply with TikTok and YouTube platform rules at all times.</li>
          <li>You must not use Trueclip for copyright infringement, abuse, or unlawful activity.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Account and Security">
        <p>
          You are responsible for account access and connected sessions. If you suspect
          unauthorized activity, disconnect your integrations and contact support immediately.
        </p>
      </LegalSection>

      <LegalSection title="Availability and Third-Party Dependencies">
        <p>
          Trueclip relies on third-party services and APIs. Feature availability may change if
          platform policies, API limits, or external systems change.
        </p>
      </LegalSection>

      <LegalSection title="Suspension and Termination">
        <p>
          We may suspend or terminate access for misuse, policy violations, or security concerns.
          You may stop using the service at any time.
        </p>
      </LegalSection>

      <LegalSection title="Changes to These Terms">
        <p>
          We may update these Terms as the service evolves. Continued use after updates means you
          accept the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>For legal or policy questions, contact legal@trueclip.app.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}