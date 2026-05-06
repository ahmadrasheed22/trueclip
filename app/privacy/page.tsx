import type { Metadata } from "next";
import LegalPageLayout, {
  LegalNumberedSection,
  legalLinkClassName,
  LegalParagraph,
} from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Trueclip",
  description: "Privacy policy for Trueclip.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      siteLabel="Trueclip (trueclip.vercel.app)"
      lastUpdated="May 5, 2026"
      contactEmail="ahmad22rasheed22@gmail.com"
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <img src="/favicon.ico" alt="Trueclip Logo" width={80} height={80} />
      </div>
      <LegalNumberedSection index={1}>
        <strong>Information We Collect:</strong> We collect specific information to provide our services. 
        When you connect your TikTok account, we collect your TikTok username, avatar, open ID, and access tokens. 
        This is collected to enable TikTok integrations and functionalities within the Trueclip app.
      </LegalNumberedSection>

      <LegalNumberedSection index={2}>
        <strong>How We Store Your Data:</strong> Your data is stored securely using encrypted HTTP-only cookies. 
        We take data security seriously and implement industry standard measures to protect your information. 
        We <strong>never</strong> sell your personal data to any third parties.
      </LegalNumberedSection>

      <LegalNumberedSection index={3}>
        <strong>Third-Party Services:</strong> Our service relies on third-party APIs to function, 
        specifically the TikTok API and the YouTube Data API. When you use Trueclip, data may be processed 
        by these third-party services in accordance with their respective privacy policies.
      </LegalNumberedSection>

      <LegalNumberedSection index={4}>
        <strong>Cookie Usage:</strong> We use cookies to store your session data and ensure the proper 
        functioning of our application. Specifically, we use encrypted HTTP-only cookies to securely maintain 
        your authentication state. You can manage or delete cookies through your browser settings.
      </LegalNumberedSection>

      <LegalNumberedSection index={5}>
        <strong>Your Rights (GDPR and CCPA):</strong> If you are located in regions covered by GDPR or CCPA, 
        you have the right to access, rectify, or erase your personal data. You have the right to request 
        data deletion at any time. To exercise these rights or request deletion of your data, please contact 
        us at{" "}
        <a href="mailto:ahmad22rasheed22@gmail.com" className={legalLinkClassName}>
          ahmad22rasheed22@gmail.com
        </a>
        .
      </LegalNumberedSection>

      <LegalNumberedSection index={6}>
        <strong>Children's Privacy:</strong> Trueclip is not intended for use by children under the age of 13. 
        We do not knowingly collect personal information from children under 13. If you are under 13, 
        you are not allowed to use our services. If we discover that we have collected information from a child 
        under 13, we will delete it immediately.
      </LegalNumberedSection>

      <LegalNumberedSection index={7}>
        <strong>Changes to this Policy:</strong> We may update this Privacy Policy from time to time. 
        We will notify you of any changes by posting the new Privacy Policy on this page and updating the 
        "Last updated" date.
      </LegalNumberedSection>
    </LegalPageLayout>
  );
}