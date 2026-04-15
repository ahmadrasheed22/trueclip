"use client";

import { useEffect, useState } from "react";

const SESSION_USER_STORAGE_KEY = "trueclip_tiktok_user";
const CALLBACK_QUERY_KEYS = ["tiktok", "tiktokError"];

function readStoredSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_USER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    return {
      openId: String(parsed.openId || ""),
      username: String(parsed.username || ""),
      displayName: String(parsed.displayName || ""),
      avatarUrl: String(parsed.avatarUrl || ""),
    };
  } catch {
    return null;
  }
}

function writeStoredSessionUser(user) {
  if (!user) {
    localStorage.removeItem(SESSION_USER_STORAGE_KEY);
  } else {
    localStorage.setItem(SESSION_USER_STORAGE_KEY, JSON.stringify(user));
  }

  window.dispatchEvent(new Event("trueclip-tiktok-session-updated"));
}

function cleanCallbackParamsFromUrl() {
  const url = new URL(window.location.href);
  let changed = false;

  for (const key of CALLBACK_QUERY_KEYS) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }

  if (changed) {
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", next);
  }
}

export default function TikTokLogin() {
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSession = async () => {
      const params = new URLSearchParams(window.location.search);
      const callbackStatus = params.get("tiktok");
      const callbackError = params.get("tiktokError");

      if (callbackStatus === "connected") {
        setError("");
      }

      if (callbackError) {
        setError(callbackError);
      }

      cleanCallbackParamsFromUrl();

      setIsCheckingSession(true);

      try {
        const response = await fetch("/api/tiktok/me", { cache: "no-store" });
        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.authenticated || !payload?.user) {
          setUser(null);
          writeStoredSessionUser(null);
          return;
        }

        setUser(payload.user);
        writeStoredSessionUser(payload.user);
      } catch {
        const fallbackUser = readStoredSessionUser();
        setUser(fallbackUser);
      } finally {
        setIsCheckingSession(false);
      }
    };

    void loadSession();
  }, []);

  const connect = () => {
    window.location.assign("/api/tiktok/login");
  };

  const disconnect = async () => {
    try {
      await fetch("/api/tiktok/logout", {
        method: "POST",
      });

      setUser(null);
      writeStoredSessionUser(null);
      setError("");
    } catch {
      setError("Unable to disconnect TikTok right now. Please try again.");
    }
  };

  if (isCheckingSession) {
    return (
      <div className="tiktok-login-shell">
        <p className="text-sm text-zinc-400">Checking TikTok session...</p>
        {error ? <p className="tiktok-repost-msg--error">{error}</p> : null}
      </div>
    );
  }

  if (!user?.openId) {
    return (
      <div className="tiktok-login-shell">
        <button type="button" className="tiktok-login-btn" onClick={connect}>
          Connect TikTok
        </button>
        {error ? <p className="tiktok-repost-msg--error">{error}</p> : null}
      </div>
    );
  }

  const displayName = user.displayName?.trim() || "TikTok Creator";
  const username = user.username?.trim() ? `@${user.username.trim()}` : "@tiktok_user";

  return (
    <div className="tiktok-login-shell">
      <div className="tiktok-user-badge">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="tiktok-user-avatar" src={user.avatarUrl} alt={displayName} loading="lazy" />
        ) : (
          <span className="tiktok-user-avatar" aria-hidden="true" />
        )}
        <span className="tiktok-user-name">{username}</span>
        <button type="button" className="tiktok-logout-btn" onClick={disconnect}>
          Disconnect
        </button>
      </div>
      {error ? <p className="tiktok-repost-msg--error">{error}</p> : null}
    </div>
  );
}
