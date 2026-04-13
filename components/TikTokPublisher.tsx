"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type TikTokUser = {
  openId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

type Notice = {
  type: "success" | "error" | "info";
  text: string;
};

type SessionResponse = {
  authenticated: boolean;
  user?: TikTokUser;
};

type PostResponse = {
  success?: boolean;
  publishId?: string;
  caption?: string;
  message?: string;
  error?: string;
};

export default function TikTokPublisher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [user, setUser] = useState<TikTokUser | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [captionSeed, setCaptionSeed] = useState("My new short is live");
  const [notice, setNotice] = useState<Notice | null>(null);

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

  const handleLogin = () => {
    setNotice({
      type: "info",
      text: "Redirecting to TikTok login...",
    });
    window.location.assign("/api/tiktok/login");
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/tiktok/logout", {
        method: "POST",
      });

      setUser(null);
      setNotice({
        type: "info",
        text: "Logged out from TikTok.",
      });
    } catch {
      setNotice({
        type: "error",
        text: "Unable to log out right now.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handlePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!videoUrl.trim()) {
      setNotice({
        type: "error",
        text: "Please provide a valid HTTPS video URL first.",
      });
      return;
    }

    setIsPosting(true);
    setNotice({
      type: "info",
      text: "Sending your video to TikTok...",
    });

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
        text:
          `Posted successfully. Publish ID: ${payload.publishId || "n/a"}. ` +
          `Caption used: ${payload.caption || ""}`,
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
    <section className="tiktok-panel" aria-label="TikTok publishing">
      <div className="tiktok-panel-head">
        <p className="tiktok-kicker">TikTok Automation</p>
        <h2 className="tiktok-title heading-font">Publish direct to TikTok</h2>
        <p className="tiktok-subtitle">
          Connect once and post generated shorts with optimized caption and trending hashtags.
        </p>
      </div>

      {notice ? (
        <p className={`tiktok-notice ${notice.type}`}>{notice.text}</p>
      ) : null}

      {isCheckingSession ? <p className="tiktok-helper">Checking TikTok session...</p> : null}

      {!isCheckingSession && !user ? (
        <div className="tiktok-auth-box">
          <button type="button" className="tiktok-login-btn" onClick={handleLogin}>
            Login with TikTok
          </button>
          <p className="tiktok-helper">
            Uses official TikTok OAuth. Tokens are stored in secure HTTP-only session cookies.
          </p>
        </div>
      ) : null}

      {user ? (
        <div className="tiktok-connected-box">
          <div className="tiktok-user-row">
            <div className="tiktok-user-copy">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.displayName} className="tiktok-avatar" />
              ) : (
                <span className="tiktok-avatar tiktok-avatar-fallback" aria-hidden="true" />
              )}

              <div>
                <p className="tiktok-user-name">{user.displayName}</p>
                <p className="tiktok-user-handle">@{user.username}</p>
              </div>
            </div>

            <button
              type="button"
              className="tiktok-logout-btn"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>

          <form className="tiktok-post-form" onSubmit={handlePost}>
            <label className="tiktok-label" htmlFor="tiktok-video-url">
              Generated video URL (HTTPS)
            </label>
            <input
              id="tiktok-video-url"
              className="tiktok-input"
              type="url"
              required
              placeholder="https://cdn.yourdomain.com/generated-video.mp4"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
            />

            <label className="tiktok-label" htmlFor="tiktok-caption-seed">
              Caption seed (optional)
            </label>
            <input
              id="tiktok-caption-seed"
              className="tiktok-input"
              type="text"
              maxLength={160}
              placeholder="Describe the short in one sentence"
              value={captionSeed}
              onChange={(event) => setCaptionSeed(event.target.value)}
            />

            <button type="submit" className="tiktok-post-btn" disabled={isPosting}>
              {isPosting ? "Posting to TikTok..." : "Post to TikTok"}
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
