import type { Metadata } from "next";
import Image from "next/image";
import LegalPageLayout, {
  LegalNumberedSection,
  legalLinkClassName,
} from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service | Trueclip",
  description: "Terms of Service for Trueclip.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      siteLabel="Trueclip"
      lastUpdated="May 7, 2026"
      contactEmail="ahmad22rasheed22@gmail.com"
    >
      <div className="flex justify-center mb-8">
        <Image src="/trueclip_icon_1024x1024.png" alt="Trueclip" width={80} height={80} />
      </div>
      <LegalNumberedSection index={1}>
        <strong>Welcome to Trueclip:</strong> Trueclip is a service that provides YouTube Shorts discovery features 
        and TikTok integrations for workflows. By accessing or using our service, you agree to be bound by these 
        Terms of Service.
      </LegalNumberedSection>

      <LegalNumberedSection index={2}>
        <strong>Content Ownership and Rights:</strong> You must own or have the explicit rights to any and all content 
        you post, share, or process using Trueclip. We do not claim ownership over the content you submit.
      </LegalNumberedSection>

      <LegalNumberedSection index={3}>
        <strong>Prohibited Content:</strong> You agree not to use Trueclip to upload, post, or distribute any illegal 
        content, including but not limited to content that is defamatory, infringing, unlawful, or violates the rights 
        of any third party.
      </LegalNumberedSection>

      <LegalNumberedSection index={4}>
        <strong>Third-Party Outages:</strong> Trueclip relies on the TikTok API and YouTube Data API. We are not 
        responsible or liable for any outages, interruptions, or issues caused by TikTok, YouTube, or any other 
        third-party platform.
      </LegalNumberedSection>

      <LegalNumberedSection index={5}>
        <strong>Account Suspension:</strong> We reserve the right to suspend or terminate your account and access to 
        the service at our sole discretion, without notice or liability, for any reason, including if you violate 
        these Terms of Service.
      </LegalNumberedSection>

      <LegalNumberedSection index={6}>
        <strong>Limitation of Liability:</strong> In no event shall Trueclip, nor its directors, employees, partners, 
        agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive 
        damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting 
        from your access to or use of or inability to access or use the service.
      </LegalNumberedSection>

      <LegalNumberedSection index={7}>
        <strong>Governing Law:</strong> These Terms shall be governed and construed in accordance with the laws, 
        without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms 
        will not be considered a waiver of those rights.
      </LegalNumberedSection>

      <LegalNumberedSection index={8}>
        <strong>Contact Us:</strong> If you have any questions about these Terms, please contact us at{" "}
        <a href="mailto:ahmad22rasheed22@gmail.com" className={legalLinkClassName}>
          ahmad22rasheed22@gmail.com
        </a>
        .
      </LegalNumberedSection>
    </LegalPageLayout>
  );
}