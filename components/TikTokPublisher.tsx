"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import TikTokAuthCard, {
  type TikTokNotice,
  type TikTokUser,
} from "@/components/TikTokAuthCard";
import TikTokPostCard from "@/components/TikTokPostCard";

type SessionResponse = {
  authenticated: boolean;
  user?: TikTokUser;
};

function getNoticeClass(type: TikTokNotice["type"]) {
  if (type === "success") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
  }

  if (type === "error") {
    return "border-rose-500/40 bg-rose-500/10 text-rose-200";
  }

  return "border-indigo-500/40 bg-indigo-500/10 text-indigo-200";
}

export default function TikTokPublisher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [user, setUser] = useState<TikTokUser | null>(null);
  const [notice, setNotice] = useState<TikTokNotice | null>(null);

  useEffect(() => {
    const callbackStatus = searchParams.get("tiktok");
    const callbackError = searchParams.get("tiktokError");

    if (!callbackStatus && !callbackError) {
      return;
    }

    if (callbackStatus === "connected") {
      setNotice({
        type: "success",
        text: "TikTok account connected successfully.",
      });
    }

    if (callbackError) {
      setNotice({
        type: "error",
        text: callbackError,
      });
    }

    const updatedParams = new URLSearchParams(searchParams.toString());
    updatedParams.delete("tiktok");
    updatedParams.delete("tiktokError");

    const nextQuery = updatedParams.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const loadSession = async () => {
      setIsCheckingSession(true);

      try {
        const response = await fetch("/api/tiktok/me", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as SessionResponse | null;

        if (!response.ok || !payload?.authenticated || !payload.user) {
          setUser(null);
          return;
        }

        setUser(payload.user);
      } catch {
        setUser(null);
      } finally {
        setIsCheckingSession(false);
      }
    };

    void loadSession();
  }, []);

  return (
    <section
      aria-label="TikTok publishing"
      className="mt-10 rounded-3xl border border-white/10 bg-zinc-950/70 p-6 md:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
        TikTok Integration
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-zinc-50 md:text-3xl">
        Login, manage account, and post in one flow
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300 md:text-base">
        Trueclip uses official TikTok Login Kit and Content Posting API to publish short videos
        directly from your workflow.
      </p>

      {notice ? (
        <p className={`mt-4 rounded-lg border px-3 py-2 text-sm ${getNoticeClass(notice.type)}`}>
          {notice.text}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <TikTokAuthCard
          user={user}
          isCheckingSession={isCheckingSession}
          onUserChange={setUser}
          onNotice={setNotice}
        />
        <TikTokPostCard user={user} />
      </div>
    </section>
  );
}
