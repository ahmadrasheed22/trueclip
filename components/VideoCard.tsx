'use client';

import { useEffect, useState } from "react";
import TikTokRepostButton from "@/components/TikTokRepostButton";

export type VideoItem = {
  videoId: string;
  title: string;
  mp4_url?: string;
  viewCount?: string | number;
  likeCount?: string | number;
  publishedAt?: string;
  duration?: string;
  thumbnail?: string;
};

type VideoCardProps = {
  video: VideoItem;
  onPlay?: () => void;
};

export function formatCount(n: string | number | undefined | null) {
  const num = parseInt(String(n ?? 0), 10);
  if (Number.isNaN(num)) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export function formatDuration(iso: string | undefined | null) {
  const m = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "0:00";
  const h = parseInt(m[1] || "0", 10);
  const min = parseInt(m[2] || "0", 10);
  const s = parseInt(m[3] || "0", 10);
  if (h > 0) {
    return `${h}:${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${min}:${String(s).padStart(2, "0")}`;
}

export function timeAgo(dateString: string | undefined | null) {
  if (!dateString) return "Just now";

  const now = new Date();
  const uploaded = new Date(dateString);

  if (Number.isNaN(uploaded.getTime())) return "Just now";

  const diff = Math.floor((now.getTime() - uploaded.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
  return `${Math.floor(diff / 31536000)} years ago`;
}

export default function VideoCard({ video, onPlay }: VideoCardProps) {
  const videoId = video.videoId;
  const [downloadState, setDownloadState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [stats, setStats] = useState({
    views: String(video.viewCount ?? "0"),
    likes: String(video.likeCount ?? "0"),
    publishedAt: video.publishedAt ?? "",
  });
  const [publishedAgoLabel, setPublishedAgoLabel] = useState("Updating...");

  const thumbnail = video.thumbnail || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

  useEffect(() => {
    let isMounted = true;

    const refreshStats = async () => {
      try {
        const response = await fetch(`/api/stats?videoId=${videoId}`, {
          cache: "no-store",
        });

        if (!response.ok || !isMounted) return;

        const data = (await response.json()) as {
          viewCount?: string;
          likeCount?: string;
          publishedAt?: string;
        };

        setStats((prev) => ({
          views: data.viewCount ?? prev.views,
          likes: data.likeCount ?? prev.likes,
          publishedAt: data.publishedAt ?? prev.publishedAt,
        }));
      } catch {
        // Ignore transient polling errors and keep existing stats.
      }
    };

    void refreshStats();

    const intervalId = window.setInterval(() => {
      void refreshStats();
    }, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [videoId]);

  useEffect(() => {
    const updateLabel = () => {
      setPublishedAgoLabel(timeAgo(stats.publishedAt));
    };

    // Compute relative time on the client after hydration to avoid SSR/client drift.
    updateLabel();

    const intervalId = window.setInterval(updateLabel, 60000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [stats.publishedAt]);

  const handleDownload = async () => {
    if (downloadState === "loading") return;

    setDownloadState("loading");

    try {
      const response = await fetch(
        `/api/download?videoId=${video.videoId}&title=${encodeURIComponent(video.title)}`
      );

      if (!response.ok) {
        throw new Error("Failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${video.title || video.videoId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setDownloadState("success");
    } catch {
      setDownloadState("error");
    } finally {
      window.setTimeout(() => setDownloadState("idle"), 2000);
    }
  };

  let buttonText = "\u2193 Download MP4";
  if (downloadState === "loading") buttonText = "Downloading...";
  if (downloadState === "success") buttonText = "\u2713 Saved!";
  if (downloadState === "error") buttonText = "\u2717 Failed";

  const buttonClassName = [
    "download-btn",
    downloadState === "success" ? "success" : "",
    downloadState === "error" ? "error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const fallbackRepostUrl = `/api/download?videoId=${encodeURIComponent(video.videoId)}&title=${encodeURIComponent(video.title)}`;
  const repostVideoUrl = video.mp4_url || fallbackRepostUrl;

  return (
    <article className="video-card">
      <div className="video-thumb" onClick={onPlay} role="button" tabIndex={0} onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onPlay?.();
        }
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="video-image" src={thumbnail} alt={video.title} loading="lazy" />

        {/* Play button overlay — shown on hover */}
        <div className="play-overlay" style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          transition: 'opacity 0.2s',
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Play triangle */}
            <div style={{
              width: 0,
              height: 0,
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderLeft: '18px solid #000',
              marginLeft: '4px',
            }} />
          </div>
        </div>

        <span className="duration-badge">{formatDuration(video.duration)}</span>
      </div>

      <div className="video-body">
        <h3 className="video-title">{video.title}</h3>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "8px",
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--text-2)" }}>
            {"\u{1F441}"} {formatCount(stats.views)}
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-2)" }}>
            {"\u{2764}\u{FE0F}"} {formatCount(stats.likes)}
          </span>
        </div>

        <div style={{ marginTop: "4px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-3)" }}>
            {"\u{1F550}"} {publishedAgoLabel}
          </span>
        </div>

        <button type="button" className={buttonClassName} onClick={handleDownload} disabled={downloadState === "loading"}>
          {buttonText}
        </button>

        <TikTokRepostButton videoUrl={repostVideoUrl} title={video.title} />
      </div>
    </article>
  );
}
