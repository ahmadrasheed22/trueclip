"use client";

import { useEffect, useState } from "react";

const SESSION_USER_STORAGE_KEY = "trueclip_tiktok_user";

function readStoredSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    return {
      openId: String(parsed.openId || ""),
    };
  } catch {
    return null;
  }
}

function clearStoredSessionUser() {
  localStorage.removeItem(SESSION_USER_STORAGE_KEY);
  window.dispatchEvent(new Event("trueclip-tiktok-session-updated"));
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
    const syncSession = () => {
      setUser(readStoredSessionUser());
    };

    syncSession();
    window.addEventListener("trueclip-tiktok-session-updated", syncSession);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener("trueclip-tiktok-session-updated", syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const isConnected = Boolean(user?.openId);

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
      const response = await fetch("/api/tiktok/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: absoluteVideoUrl,
          captionSeed: title || "Posted from Trueclip",
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        if (response.status === 401) {
          clearStoredSessionUser();
          setUser(null);
        }

        throw new Error(payload?.error || "Unable to repost right now.");
      }

      setState("success");
      const publishId = payload?.publishId || "n/a";
      setMessage(`Posted successfully to TikTok. Publish ID: ${publishId}.`);
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
