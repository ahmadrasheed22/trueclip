import Link from "next/link";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const legalLinkClassName =
  "text-blue-600 underline underline-offset-2 transition-colors hover:text-blue-700 dark:text-blue-400";

type LegalPageLayoutProps = {
  title: string;
  siteLabel: string;
  lastUpdated: string;
  contactEmail: string;
  children: ReactNode;
};

type LegalNumberedSectionProps = {
  index: number;
  children: ReactNode;
};

export function LegalNumberedSection({ index, children }: LegalNumberedSectionProps) {
  return (
    <li className="rounded-lg px-1 py-1 text-[0.96rem] leading-7 text-gray-800 dark:text-gray-200 md:px-2 md:py-2 md:text-[1.03rem] md:leading-8">
      <span className="font-medium text-gray-900 dark:text-white">{index}. </span>
      <span>{children}</span>
    </li>
  );
}

export function LegalParagraph({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[0.95rem] leading-7 text-gray-800 dark:text-gray-200 md:text-[1rem] md:leading-8">{children}</p>;
}

export default function LegalPageLayout({
  title,
  siteLabel,
  lastUpdated,
  contactEmail,
  children,
}: LegalPageLayoutProps) {
  return (
    <main className={`${inter.className} min-h-[calc(100vh-64px)] bg-gray-50 text-gray-900 dark:bg-[#030712] dark:text-gray-100`}>
      <div className="mx-auto w-full px-4 py-8 sm:px-6 md:px-10 md:py-12" style={{ maxWidth: "1400px" }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-base font-semibold text-gray-500 shadow-sm transition-colors hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <span aria-hidden="true">{"\u2190"}</span>
          Back to Home
        </Link>

        <article className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#020817] sm:p-7 md:p-10 lg:p-12">
          <header className="border-b border-gray-200 pb-6 dark:border-gray-800">
            <h1 className="text-[2rem] font-semibold leading-tight text-gray-900 dark:text-white md:text-[2.75rem]">
              {title}{" "}
              <span className="block text-[1.45rem] font-normal text-gray-500 dark:text-gray-400 md:inline md:text-[2rem]">
                {siteLabel}
              </span>
            </h1>
            <p className="mt-3 text-[1rem] text-gray-500 dark:text-gray-400 md:text-[1.15rem]">
              Last updated: {lastUpdated}
            </p>
          </header>

          <article className="mt-7">
            <ol className="list-decimal space-y-6 pl-6 marker:font-medium md:space-y-8 md:pl-8">{children}</ol>
          </article>

          <footer className="mt-10 border-t border-gray-200 pt-6 text-[1rem] text-gray-500 dark:border-gray-800 dark:text-gray-400 md:text-[1.08rem]">
            Questions? Contact us at{" "}
            <a href={`mailto:${contactEmail}`} className={legalLinkClassName}>
              {contactEmail}
            </a>
            .
          </footer>
        </article>
      </div>
    </main>
  );
}
