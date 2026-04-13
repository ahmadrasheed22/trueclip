import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-container site-footer-inner">
        <p className="site-footer-brand heading-font">Trueclip</p>

        <nav className="site-footer-legal" aria-label="Legal links">
          <Link href="/privacy-policy" className="site-footer-legal-link">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="site-footer-legal-link">
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
