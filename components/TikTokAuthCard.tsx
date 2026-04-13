"use client";

import { useState } from "react";

export type TikTokUser = {
  openId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

export type TikTokNotice = {
  type: "success" | "error" | "info";
  text: string;
};

type TikTokAuthCardProps = {
  user: TikTokUser | null;
  isCheckingSession: boolean;
  onUserChange: (user: TikTokUser | null) => void;
  onNotice: (notice: TikTokNotice) => void;
};

export default function TikTokAuthCard({
  user,
  isCheckingSession,
  onUserChange,
  onNotice,
}: TikTokAuthCardProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogin = () => {
    onNotice({ type: "info", text: "Redirecting to TikTok login..." });
    window.location.assign("/api/tiktok/login");
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/tiktok/logout", {
        method: "POST",
      });

      onUserChange(null);
      onNotice({ type: "success", text: "Logged out successfully." });
    } catch {
      onNotice({ type: "error", text: "Unable to log out right now." });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
        Account
      </p>
      <h3 className="mt-2 text-xl font-semibold text-zinc-50">TikTok Login</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-300">
        Connect your TikTok account securely with the official Login Kit flow.
      </p>

      {isCheckingSession ? (
        <p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-300">
          Checking account session...
        </p>
      ) : null}

      {!isCheckingSession && !user ? (
        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
            onClick={handleLogin}
          >
            Login with TikTok
          </button>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Tokens are handled server-side and stored in encrypted HTTP-only cookies.
          </p>
        </div>
      ) : null}

      {user ? (
        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="h-12 w-12 rounded-full border border-zinc-700 object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="inline-block h-12 w-12 rounded-full border border-zinc-700 bg-zinc-800"
                />
              )}

              <div>
                <p className="text-sm font-semibold text-zinc-100">{user.displayName}</p>
                <p className="text-sm text-zinc-300">@{user.username}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-indigo-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
