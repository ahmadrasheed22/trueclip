"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CheckStatus = "checking" | "ok" | "fail";

type VerificationLink = {
  label: string;
  path: string;
  description: string;
};

const verificationLinks: VerificationLink[] = [
  {
    label: "TikTok domain verification file",
    path: "/tiktok-verification.txt",
    description: "Required for Developer Portal domain ownership.",
  },
  {
    label: "Privacy policy page",
    path: "/privacy",
    description: "Required for TikTok app review.",
  },
  {
    label: "Terms of service page",
    path: "/terms",
    description: "Required for TikTok app review.",
  },
];

function statusLabel(status: CheckStatus) {
  if (status === "ok") return "OK";
  if (status === "fail") return "FAIL";
  return "CHECKING";
}

function statusClassName(status: CheckStatus) {
  if (status === "ok") return "border-emerald-500/50 bg-emerald-500/10 text-emerald-200";
  if (status === "fail") return "border-rose-500/50 bg-rose-500/10 text-rose-200";
  return "border-zinc-700 bg-zinc-900/70 text-zinc-300";
}

export default function VerifyPage() {
  const [statuses, setStatuses] = useState<Record<string, CheckStatus>>({});

  useEffect(() => {
    let active = true;

    const runChecks = async () => {
      const checks = await Promise.all(
        verificationLinks.map(async (item) => {
          try {
            const response = await fetch(item.path, { cache: "no-store" });
            return {
              path: item.path,
              status: response.ok ? "ok" : "fail",
            } as { path: string; status: CheckStatus };
          } catch {
            return {
              path: item.path,
              status: "fail",
            } as { path: string; status: CheckStatus };
          }
        })
      );

      if (!active) return;

      const next: Record<string, CheckStatus> = {};
      for (const check of checks) {
        next[check.path] = check.status;
      }
      setStatuses(next);
    };

    void runChecks();

    return () => {
      active = false;
    };
  }, []);

  const okCount = verificationLinks.filter((item) => statuses[item.path] === "ok").length;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-black py-10 text-zinc-100">
      <div className="mx-auto w-full max-w-[800px] px-6">
        <article className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 md:p-10">
          <header className="mb-8 border-b border-zinc-800 pb-6">
            <Link
              href="/"
              className="text-sm font-semibold uppercase tracking-[0.08em] text-indigo-300 transition hover:text-indigo-200"
            >
              Back to Home
            </Link>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white md:text-4xl">
              Verification Check
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              Use this page to quickly confirm URLs required by TikTok Developer Portal and app
              review.
            </p>
            <p className="mt-3 text-sm text-zinc-400">
              Passing now: {okCount}/{verificationLinks.length}
            </p>
          </header>

          <ul className="space-y-4">
            {verificationLinks.map((item) => {
              const status = statuses[item.path] ?? "checking";

              return (
                <li key={item.path} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-zinc-100">{item.label}</h2>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold tracking-[0.08em] ${statusClassName(status)}`}
                    >
                      {statusLabel(status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{item.description}</p>
                  <Link
                    href={item.path}
                    className="mt-3 inline-block text-sm font-medium text-indigo-300 transition hover:text-indigo-200"
                  >
                    {item.path}
                  </Link>
                </li>
              );
            })}
          </ul>

          <footer className="mt-10 border-t border-zinc-800 pt-5 text-sm text-zinc-400">
            Last updated: April 14, 2026
          </footer>
        </article>
      </div>
    </main>
  );
}