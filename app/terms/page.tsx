import type { Metadata } from "next";
import LegalPageLayout, {
  LegalNumberedSection,
  legalLinkClassName,
  LegalParagraph,
} from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service | Trueclip",
  description: "Terms of service for using Trueclip YouTube and TikTok integrations.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      siteLabel="www.trueclip.vercel.app"
      lastUpdated="April 15, 2026"
      contactEmail="legal@trueclip.app"
    >
      <LegalNumberedSection index={1}>
        By using Trueclip, you agree to these Terms of Service and all applicable laws and
        platform rules.
      </LegalNumberedSection>

      <LegalNumberedSection index={2}>
        Trueclip provides YouTube Shorts discovery features and TikTok Login Kit integration for
        supported workflows.
      </LegalNumberedSection>

      <LegalNumberedSection index={3}>
        You must only upload or share content you own or are authorized to use.
      </LegalNumberedSection>

      <LegalNumberedSection index={4}>
        You must comply with TikTok Terms, YouTube Terms, and all community guidelines while using
        this service.
      </LegalNumberedSection>

      <LegalNumberedSection index={5}>
        Account sessions are your responsibility. If you suspect unauthorized access, disconnect
        linked services and contact support promptly.
      </LegalNumberedSection>

      <LegalNumberedSection index={6}>
        Feature availability may change due to third-party API limits, policy updates, or service
        interruptions outside our control.
      </LegalNumberedSection>

      <LegalNumberedSection index={7}>
        We may update these Terms as the product evolves. Continued use after changes means you
        accept the revised Terms.
      </LegalNumberedSection>

      <LegalNumberedSection index={8}>
        For legal or policy questions, contact{" "}
        <a href="mailto:legal@trueclip.app" className={legalLinkClassName}>
          legal@trueclip.app
        </a>
        .
        <LegalParagraph>
          These terms are governed by applicable laws in the jurisdiction where the service is
          operated.
        </LegalParagraph>
      </LegalNumberedSection>
    </LegalPageLayout>
  );
}