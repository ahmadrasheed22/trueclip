import Link from "next/link";
import type { ReactNode } from "react";

type LegalPageLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  children: ReactNode;
};

type LegalSectionProps = {
  title: string;
  children: ReactNode;
};

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900/45 p-5 md:p-6">
      <h2 className="text-xl font-semibold text-white md:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-zinc-300 md:text-[15px]">
        {children}
      </div>
    </section>
  );
}

export default function LegalPageLayout({
  eyebrow,
  title,
  description,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <main className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-[#06070a] py-10 text-zinc-100 md:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_15%_0%,rgba(34,197,94,0.16),transparent_46%),radial-gradient(circle_at_85%_0%,rgba(59,130,246,0.16),transparent_50%)]"
      />

      <div className="relative mx-auto w-full max-w-4xl px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-zinc-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-300 transition hover:border-white/30 hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Back to Home
        </Link>

        <article className="mt-4 rounded-3xl border border-white/10 bg-zinc-950/75 p-6 shadow-[0_22px_55px_-28px_rgba(0,0,0,0.9)] backdrop-blur md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white md:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 md:text-base">
            {description}
          </p>

          <div className="mt-8 space-y-4 md:space-y-5">{children}</div>

          <footer className="mt-8 border-t border-white/10 pt-5 text-sm text-zinc-400">
            Last updated: {lastUpdated}
          </footer>
        </article>
      </div>
    </main>
  );
}
