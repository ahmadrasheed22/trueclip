"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Clip, GenerateResponse } from "@/types/clips";

const PROGRESS_MESSAGES = [
  "Downloading video...",
  "Transcribing audio...",
  "Finding best moments...",
  "Creating clips...",
] as const;

const PROGRESS_INTERVAL_MS = 5_000;

function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
}

function readGenerateError(payload: unknown): string | null {
  const root = asRecord(payload);
  if (!root) {
    return null;
  }

  const message = root.error;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }

  return null;
}

export default function GeneratePage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeProgressIndex, setActiveProgressIndex] = useState(0);
  const [clips, setClips] = useState<Clip[]>([]);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveProgressIndex((current) => {
        if (current >= PROGRESS_MESSAGES.length - 1) {
          return current;
        }

        return current + 1;
      });
    }, PROGRESS_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isLoading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUrl = youtubeUrl.trim();
    if (!trimmedUrl) {
      setError("Please paste a YouTube URL to generate clips.");
      setClips([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError("");
    setClips([]);
    setHasSearched(false);
    setActiveProgressIndex(0);

    try {
      const response = await fetch("/api/generate-clips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ youtubeUrl: trimmedUrl }),
      });

      const payload = (await response.json().catch(() => null)) as
        | GenerateResponse
        | null;

      if (!response.ok) {
        throw new Error(
          readGenerateError(payload) ??
            "We could not generate clips right now. Please try again shortly."
        );
      }

      const generatedClips = Array.isArray(payload?.clips) ? payload.clips : [];
      setClips(generatedClips);
      setHasSearched(true);
      setActiveProgressIndex(PROGRESS_MESSAGES.length - 1);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Something unexpected happened while generating clips.";

      setError(message);
      setClips([]);
      setHasSearched(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[var(--bg)] pb-20 pt-12 text-[var(--text-1)] sm:pt-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[radial-gradient(circle_at_top_right,rgba(108,99,255,0.24),transparent_58%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.16),transparent_50%),var(--bg-2)] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.35)] sm:p-10">
          <p className="inline-flex rounded-full border border-[rgba(108,99,255,0.35)] bg-[rgba(108,99,255,0.16)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-2)]">
            AI Clips
          </p>

          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Generate the best clip moments from any YouTube video.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-2)] sm:text-base">
            Paste a YouTube URL and let Trueclip automatically detect high-impact moments,
            then return ready-to-download clips.
          </p>

          <form className="mt-8 flex flex-col gap-4 sm:flex-row" onSubmit={handleSubmit}>
            <input
              type="url"
              inputMode="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              className="h-12 w-full rounded-xl border border-[var(--border-2)] bg-[var(--bg)] px-4 text-sm text-[var(--text-1)] outline-none transition focus:border-[var(--accent)] placeholder:text-[var(--text-3)]"
              aria-label="YouTube URL"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-2)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Generating..." : "Generate Clips"}
            </button>
          </form>

          {isLoading ? (
            <div className="mt-7 rounded-2xl border border-[var(--border)] bg-[rgba(8,8,8,0.68)] p-5 sm:p-6">
              <p className="text-sm font-semibold text-[var(--text-1)]">Processing video</p>
              <div className="mt-4 space-y-3">
                {PROGRESS_MESSAGES.map((message, index) => {
                  const isDone = index < activeProgressIndex;
                  const isCurrent = index === activeProgressIndex;

                  return (
                    <div
                      key={message}
                      className="flex items-center gap-3"
                      aria-live={isCurrent ? "polite" : undefined}
                    >
                      <span
                        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          isDone
                            ? "bg-emerald-500/20 text-emerald-300"
                            : isCurrent
                              ? "bg-[var(--accent)]/20 text-[var(--accent-2)]"
                              : "bg-[var(--bg-3)] text-[var(--text-3)]"
                        }`}
                      >
                        {isDone ? "✓" : index + 1}
                      </span>
                      <span
                        className={`text-sm ${
                          isDone || isCurrent ? "text-[var(--text-1)]" : "text-[var(--text-3)]"
                        }`}
                      >
                        {message}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}
        </section>

        {clips.length > 0 ? (
          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Generated Clips</h2>
              <span className="rounded-full border border-[var(--border)] bg-[var(--bg-2)] px-3 py-1 text-xs font-medium text-[var(--text-2)]">
                {clips.length} clip{clips.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {clips.map((clip) => (
                <article
                  key={clip.id}
                  className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-2)]"
                >
                  <video
                    src={clip.videoUrl}
                    controls
                    preload="metadata"
                    className="aspect-video w-full bg-black"
                  />

                  <div className="space-y-4 p-4">
                    <div className="flex items-center justify-between gap-3 text-xs text-[var(--text-2)]">
                      <span>Duration {formatDuration(clip.duration)}</span>
                      <span>
                        {formatDuration(clip.startTime)} - {formatDuration(clip.endTime)}
                      </span>
                    </div>

                    <p className="min-h-16 text-sm leading-6 text-[var(--text-2)]">
                      {clip.subtitle || "No subtitle preview available for this clip."}
                    </p>

                    <a
                      href={clip.videoUrl}
                      download
                      className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-[var(--border-2)] bg-[var(--bg)] px-4 text-sm font-semibold text-[var(--text-1)] transition hover:border-[var(--accent)] hover:text-[var(--accent-2)]"
                    >
                      Download
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {!isLoading && !error && hasSearched && clips.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5 text-sm text-[var(--text-2)]">
            No clips were generated for this video. Try a different YouTube URL with stronger
            moments.
          </section>
        ) : null}
      </div>
    </main>
  );
}
