"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "tiktok_user";
const OAUTH_QUERY_KEYS = [
  "tiktok",
  "access_token",
  "refresh_token",
  "open_id",
  "display_name",
  "avatar_url",
];

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    return {
      access_token: String(parsed.access_token || ""),
      refresh_token: String(parsed.refresh_token || ""),
      open_id: String(parsed.open_id || ""),
      display_name: String(parsed.display_name || ""),
      avatar_url: String(parsed.avatar_url || ""),
    };
  } catch {
    return null;
  }
}

function cleanOAuthParamsFromUrl() {
  const url = new URL(window.location.href);
  let changed = false;

  for (const key of OAUTH_QUERY_KEYS) {
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
  const [error, setError] = useState("");

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const authStatus = params.get("tiktok");

      if (authStatus === "success") {
        const nextUser = {
          access_token: params.get("access_token") || "",
          refresh_token: params.get("refresh_token") || "",
          open_id: params.get("open_id") || "",
          display_name: params.get("display_name") || "",
          avatar_url: params.get("avatar_url") || "",
        };

        if (nextUser.access_token) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
          setUser(nextUser);
          setError("");
        } else {
          setError("TikTok login did not return an access token.");
        }
      } else if (authStatus === "error") {
        setError("TikTok authentication failed. Please try again.");
        setUser(readStoredUser());
      } else {
        setUser(readStoredUser());
      }

      cleanOAuthParamsFromUrl();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  const connect = () => {
    window.location.href = "/api/auth/tiktok";
  };

  const disconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setError("");
  };

  if (!user?.access_token) {
    return (
      <div className="tiktok-login-shell">
        <button type="button" className="tiktok-login-btn" onClick={connect}>
          Connect TikTok
        </button>
        {error ? <p className="tiktok-repost-msg--error">{error}</p> : null}
      </div>
    );
  }

  const display = user.display_name ? `@${user.display_name}` : "@tiktok_user";

  return (
    <div className="tiktok-login-shell">
      <div className="tiktok-user-badge">
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="tiktok-user-avatar" src={user.avatar_url} alt={display} loading="lazy" />
        ) : (
          <span className="tiktok-user-avatar" aria-hidden="true" />
        )}
        <span className="tiktok-user-name">{display}</span>
        <button type="button" className="tiktok-logout-btn" onClick={disconnect}>
          Disconnect
        </button>
      </div>
      {error ? <p className="tiktok-repost-msg--error">{error}</p> : null}
    </div>
  );
}
