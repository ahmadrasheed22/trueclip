import type { Metadata } from "next";
import LegalPageLayout, { LegalSection } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Trueclip",
  description: "Privacy policy for Trueclip YouTube and TikTok integrations.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Privacy"
      title="Privacy Policy"
      description="This policy explains what information Trueclip processes, why it is processed, and the controls available to users."
      lastUpdated="April 15, 2026"
    >
      <LegalSection title="What We Collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            TikTok account profile data returned by TikTok Login Kit (for example: open ID,
            username, display name, and avatar URL).
          </li>
          <li>Public YouTube channel and Shorts analytics data requested by your search actions.</li>
          <li>Basic usage telemetry needed for reliability, debugging, and abuse prevention.</li>
        </ul>
      </LegalSection>

      <LegalSection title="How We Use Information">
        <ul className="list-disc space-y-2 pl-5">
          <li>To authenticate your TikTok account and show connected account details.</li>
          <li>To process explicit publish actions you initiate from the Trueclip interface.</li>
          <li>To provide channel discovery, performance views, and product improvements.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Session and Token Handling">
        <p>
          OAuth tokens are stored in encrypted HTTP-only cookies. Trueclip does not expose tokens
          in the browser URL and does not maintain a long-term user token database by default.
        </p>
      </LegalSection>

      <LegalSection title="Third-Party Services">
        <p>
          Trueclip communicates with official TikTok and YouTube APIs only for authentication,
          publishing, and analytics features you choose to use.
        </p>
      </LegalSection>

      <LegalSection title="Data Retention and Control">
        <p>
          You can disconnect TikTok at any time from the Trueclip interface. We also support
          reasonable deletion requests where required by law.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>For privacy requests, contact privacy@trueclip.app.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}