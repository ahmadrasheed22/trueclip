import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-white/10 bg-zinc-950/70">
      <div className="mx-auto w-full max-w-6xl px-6 py-8 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
          Trueclip / Shortshub
        </p>

        <nav
          className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          aria-label="Legal links"
        >
          <Link
            href="/privacy-policy"
            className="text-lg font-semibold text-zinc-100 transition hover:text-indigo-300"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms-of-service"
            className="text-lg font-semibold text-zinc-100 transition hover:text-indigo-300"
          >
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
