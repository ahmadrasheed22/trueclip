"use client";

import { FormEvent, useState } from "react";
import type { TikTokUser } from "@/components/TikTokAuthCard";

type Notice = {
  type: "success" | "error" | "info";
  text: string;
};

type PostResponse = {
  success?: boolean;
  publishId?: string;
  caption?: string;
  error?: string;
};

type TikTokPostCardProps = {
  user: TikTokUser | null;
};

function getNoticeClass(type: Notice["type"]) {
  if (type === "success") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
  }

  if (type === "error") {
    return "border-rose-500/40 bg-rose-500/10 text-rose-200";
  }

  return "border-indigo-500/40 bg-indigo-500/10 text-indigo-200";
}

export default function TikTokPostCard({ user }: TikTokPostCardProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [captionSeed, setCaptionSeed] = useState("My latest short is live");
  const [isPosting, setIsPosting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const handlePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!videoUrl.trim()) {
      setNotice({
        type: "error",
        text: "Please provide a valid HTTPS video URL.",
      });
      return;
    }

    setIsPosting(true);
    setNotice({ type: "info", text: "Posting to TikTok..." });

    try {
      const response = await fetch("/api/tiktok/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl,
          captionSeed,
        }),
      });

      const payload = (await response.json().catch(() => null)) as PostResponse | null;

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "TikTok post request failed.");
      }

      setNotice({
        type: "success",
        text: `Posted successfully. Publish ID: ${payload.publishId || "n/a"}. Caption: ${payload.caption || ""}`,
      });
    } catch (errorCause) {
      setNotice({
        type: "error",
        text:
          errorCause instanceof Error
            ? errorCause.message
            : "Unable to post to TikTok right now.",
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
        Publishing
      </p>
      <h3 className="mt-2 text-xl font-semibold text-zinc-50">Post to TikTok</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-300">
        Send a generated short directly to TikTok with an optimized caption and trending hashtags.
      </p>

      {!user ? (
        <p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-300">
          Connect a TikTok account first to enable posting.
        </p>
      ) : null}

      {notice ? (
        <p className={`mt-4 rounded-lg border px-3 py-2 text-sm ${getNoticeClass(notice.type)}`}>
          {notice.text}
        </p>
      ) : null}

      <form className="mt-4 space-y-3" onSubmit={handlePost}>
        <div>
          <label
            htmlFor="tiktok-video-url"
            className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400"
          >
            Video URL
          </label>
          <input
            id="tiktok-video-url"
            type="url"
            required
            disabled={!user || isPosting}
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="https://cdn.yourdomain.com/generated-short.mp4"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="tiktok-caption-seed"
            className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400"
          >
            Caption Seed
          </label>
          <input
            id="tiktok-caption-seed"
            type="text"
            maxLength={160}
            disabled={!user || isPosting}
            value={captionSeed}
            onChange={(event) => setCaptionSeed(event.target.value)}
            placeholder="Describe your short in one sentence"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={!user || isPosting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPosting ? "Posting to TikTok..." : "Post to TikTok"}
        </button>

        <p className="text-xs leading-5 text-zinc-400">
          Note: Before full TikTok app audit, posts may appear as private. This is expected behavior.
        </p>
      </form>
    </div>
  );
}
