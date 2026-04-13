"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "tiktok_user";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    return {
      access_token: String(parsed.access_token || ""),
    };
  } catch {
    return null;
  }
}

function toAbsoluteUrl(videoUrl) {
  if (!videoUrl) return "";
  if (/^https?:\/\//i.test(videoUrl)) return videoUrl;

  const normalized = videoUrl.startsWith("/") ? videoUrl : `/${videoUrl}`;
  return `${window.location.origin}${normalized}`;
}

export default function TikTokRepostButton({ videoUrl, title }) {
  const [user, setUser] = useState(null);
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setUser(readStoredUser());
  }, []);

  const isConnected = Boolean(user?.access_token);

  const handleRepost = async () => {
    if (!isConnected || state === "loading") return;

    const absoluteVideoUrl = toAbsoluteUrl(videoUrl);
    if (!absoluteVideoUrl) {
      setState("error");
      setMessage("Video URL is missing.");
      return;
    }

    setState("loading");
    setMessage("Posting to TikTok...");

    try {
      const response = await fetch("/api/tiktok/repost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: user.access_token,
          video_url: absoluteVideoUrl,
          title: title || "Posted from Trueclip",
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "Unable to repost right now.");
      }

      setState("success");
      setMessage("Posted successfully to TikTok.");
    } catch (errorCause) {
      setState("error");
      setMessage(errorCause instanceof Error ? errorCause.message : "Unable to repost right now.");
    }
  };

  const buttonText =
    state === "loading"
      ? "Posting..."
      : state === "success"
        ? "Posted! ✅"
        : state === "error"
          ? "Retry ↗"
          : "Repost to TikTok ↗";

  const buttonClassName = [
    "tiktok-repost-btn",
    state === "loading" ? "tiktok-repost-btn--loading" : "",
    state === "success" ? "tiktok-repost-btn--success" : "",
    state === "error" ? "tiktok-repost-btn--error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="tiktok-repost-wrapper">
      <button
        type="button"
        className={buttonClassName}
        disabled={!isConnected || state === "loading"}
        onClick={handleRepost}
      >
        {isConnected ? buttonText : "Connect TikTok to repost"}
      </button>

      {message ? (
        <p className={state === "success" ? "tiktok-repost-msg--success" : state === "error" ? "tiktok-repost-msg--error" : ""}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
