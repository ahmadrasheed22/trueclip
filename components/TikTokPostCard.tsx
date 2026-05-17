"use client";

import { FormEvent, useEffect, useState } from "react";
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

type CreatorInfoResponse = {
  creator_avatar_url: string;
  creator_nickname: string;
  privacy_level_options: string[];
  comment_disabled: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
  max_video_post_duration_sec: number;
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
  
  // New States
  const [privacyLevel, setPrivacyLevel] = useState("");
  const [allowComment, setAllowComment] = useState(false);
  const [allowDuet, setAllowDuet] = useState(false);
  const [allowStitch, setAllowStitch] = useState(false);
  
  const [commercialToggle, setCommercialToggle] = useState(false);
  const [brandOrganicToggle, setBrandOrganicToggle] = useState(false);
  const [brandContentToggle, setBrandContentToggle] = useState(false);

  const [creatorInfo, setCreatorInfo] = useState<CreatorInfoResponse | null>(null);

  const [isPosting, setIsPosting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (user) {
      fetch(`/api/tiktok/creator-info?access_token=${user.accessToken}`)
        .then((res) => res.json())
        .then((data: CreatorInfoResponse) => {
          if (data && data.privacy_level_options) {
            setCreatorInfo(data);
          }
        })
        .catch(() => {});
    } else {
      setCreatorInfo(null);
    }
  }, [user]);

  const handlePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!videoUrl.trim()) {
      setNotice({
        type: "error",
        text: "Please provide a valid HTTPS video URL.",
      });
      return;
    }
    
    if (!privacyLevel) {
      setNotice({
        type: "error",
        text: "Please select a privacy level.",
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
          privacyLevel,
          allowComment,
          allowDuet,
          allowStitch,
          brandOrganicToggle,
          brandContentToggle,
        }),
      });

      const payload = (await response.json().catch(() => null)) as PostResponse | null;

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "TikTok post request failed.");
      }

      setNotice({
        type: "success",
        text: "Your video is being processed. It may take a few minutes to appear on your TikTok profile.",
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

  const getCommercialDisclosureLabel = () => {
    if (brandOrganicToggle && brandContentToggle) return "Your video will be labeled as 'Paid partnership'";
    if (brandOrganicToggle) return "Your video will be labeled as 'Promotional content'";
    if (brandContentToggle) return "Your video will be labeled as 'Paid partnership'";
    return "";
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

        {creatorInfo ? (
          <>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400">
                Privacy
              </label>
              <select
                value={privacyLevel}
                onChange={(e) => setPrivacyLevel(e.target.value)}
                disabled={isPosting}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="" disabled hidden>Select privacy...</option>
                {creatorInfo.privacy_level_options.map((opt) => (
                  <option 
                    key={opt} 
                    value={opt} 
                    disabled={opt === "SELF_ONLY" && brandContentToggle ? true : false}
                  >
                    {opt.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400">
                User Interactions
              </label>
              {!creatorInfo.comment_disabled && (
                <label className="flex items-center space-x-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={allowComment}
                    onChange={(e) => setAllowComment(e.target.checked)}
                    disabled={isPosting}
                  />
                  <span>Allow Comments</span>
                </label>
              )}
              {!creatorInfo.duet_disabled && (
                <label className="flex items-center space-x-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={allowDuet}
                    onChange={(e) => setAllowDuet(e.target.checked)}
                    disabled={isPosting}
                  />
                  <span>Allow Duet</span>
                </label>
              )}
              {!creatorInfo.stitch_disabled && (
                <label className="flex items-center space-x-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={allowStitch}
                    onChange={(e) => setAllowStitch(e.target.checked)}
                    disabled={isPosting}
                  />
                  <span>Allow Stitch</span>
                </label>
              )}
            </div>

            <div className="space-y-2 rounded-lg border border-white/10 bg-zinc-900/50 p-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-zinc-200">
                <input
                  type="checkbox"
                  checked={commercialToggle}
                  onChange={(e) => {
                    setCommercialToggle(e.target.checked);
                    if (!e.target.checked) {
                      setBrandOrganicToggle(false);
                      setBrandContentToggle(false);
                    }
                  }}
                  disabled={isPosting}
                />
                <span>Commercial Content Disclosure</span>
              </label>

              {commercialToggle && (
                <div className="ml-6 space-y-2">
                  <label className="flex items-center space-x-2 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={brandOrganicToggle}
                      onChange={(e) => setBrandOrganicToggle(e.target.checked)}
                      disabled={isPosting}
                    />
                    <span>Your Brand</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={brandContentToggle}
                      onChange={(e) => {
                        setBrandContentToggle(e.target.checked);
                        if (e.target.checked && privacyLevel === "SELF_ONLY") {
                          setPrivacyLevel("");
                        }
                      }}
                      disabled={isPosting}
                    />
                    <span>Branded Content</span>
                  </label>

                  <p className="text-xs text-indigo-300 mt-2 italic">
                    {getCommercialDisclosureLabel()}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : null}

        <p className="text-sm text-gray-500 mt-4 mb-2">
          By posting, you agree to TikTok&apos;s Music Usage Confirmation
        </p>

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
