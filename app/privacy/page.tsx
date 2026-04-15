import type { Metadata } from "next";
import LegalPageLayout, {
  LegalNumberedSection,
  legalLinkClassName,
  LegalParagraph,
} from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Trueclip",
  description: "Privacy policy for Trueclip YouTube and TikTok integrations.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      siteLabel="www.trueclip.vercel.app"
      lastUpdated="April 15, 2026"
      contactEmail="privacy@trueclip.app"
    >
      <LegalNumberedSection index={1}>
        By using Trueclip, you agree to this Privacy Policy and the data handling practices
        described on this page.
      </LegalNumberedSection>

      <LegalNumberedSection index={2}>
        We only collect information required to run the service, connect TikTok with Login Kit,
        and provide requested analytics features.
      </LegalNumberedSection>

      <LegalNumberedSection index={3}>
        TikTok Login Kit returns basic profile fields such as open_id, username, display_name,
        and avatar_url after your consent.
      </LegalNumberedSection>

      <LegalNumberedSection index={4}>
        We use technical cookies and reliability logs to keep the website stable, secure, and
        responsive.
        <LegalParagraph>
          These signals help us maintain service quality, troubleshoot failures, and improve user
          experience over time.
        </LegalParagraph>
      </LegalNumberedSection>

      <LegalNumberedSection index={5}>
        We do not sell your personal data. Data may be shared only with official platform APIs
        when required to complete the features you request.
      </LegalNumberedSection>

      <LegalNumberedSection index={6}>
        Third-party services linked from Trueclip operate under their own policies. We recommend
        reviewing those policies before using external services.
      </LegalNumberedSection>

      <LegalNumberedSection index={7}>
        We may update this Privacy Policy when features or legal requirements change.
        <LegalParagraph>
          For privacy requests, contact{" "}
          <a href="mailto:privacy@trueclip.app" className={legalLinkClassName}>
            privacy@trueclip.app
          </a>
          .
        </LegalParagraph>
      </LegalNumberedSection>
    </LegalPageLayout>
  );
}