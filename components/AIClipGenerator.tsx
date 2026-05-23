"use client";

import { FormEvent, useState } from "react";
import axios from "axios";

type AIClipGeneratorProps = {
  videoPath: string;
  videoId: string;
};

type GenerateClipResponse = {
  clipUrl?: string;
  error?: string;
};

function getErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const message = (payload as { error?: unknown }).error;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }

  return null;
}

export default function AIClipGenerator({ videoPath, videoId }: AIClipGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [clipUrl, setClipUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError("Please enter a prompt before generating.");
      return;
    }

    setIsLoading(true);
    setError("");
    setClipUrl("");

    try {
      const response = await axios.post<GenerateClipResponse>("/api/generate-clip", {
        videoPath,
        prompt: trimmedPrompt
      }, {
        timeout: 900000 // 15 minutes timeout
      });

      const payload = response.data;
      console.log("RAW BACKEND RESPONSE (clip):", payload);

      if (!payload?.clipUrl) {
        throw new Error("Clip generation finished, but no clip URL was returned.");
      }

      setClipUrl(payload.clipUrl);
    } catch (errorCause) {
      console.error("Clip generation error:", errorCause);
      let message = "Failed to generate clip. Please try again.";
      
      if (axios.isAxiosError(errorCause)) {
        console.log("RAW BACKEND ERROR RES:", errorCause.response?.data);
        message = getErrorMessage(errorCause.response?.data) ??
                  errorCause.message ??
                  "Failed to generate clip. Please try again.";
      } else if (errorCause instanceof Error) {
        message = errorCause.message;
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-lg font-semibold text-[var(--text-1)]">AI Clip Generator</h2>
        <p className="text-xs text-[var(--text-3)]">Video ID: {videoId}</p>
      </div>

      <form onSubmit={handleGenerate} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="e.g., Funny moments"
          className="h-11 w-full rounded-xl border border-[var(--border-2)] bg-[var(--bg)] px-4 text-sm text-[var(--text-1)] outline-none transition focus:border-[var(--accent)] placeholder:text-[var(--text-3)]"
          disabled={isLoading}
          aria-label="Clip prompt"
        />

        <button
          type="submit"
          className="inline-flex h-11 min-w-32 items-center justify-center rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-2)] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Processing...
            </span>
          ) : (
            "Generate"
          )}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {clipUrl ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <article className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-3)]">
              Original Video
            </p>
            <video
              src={videoPath}
              controls
              preload="metadata"
              className="w-full rounded-lg bg-black"
            />
          </article>

          <article className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-3)]">
              Generated Clip
            </p>
            <video
              src={clipUrl}
              controls
              preload="metadata"
              className="mx-auto aspect-[9/16] w-full max-w-[360px] rounded-lg bg-black object-cover"
            />
          </article>
        </div>
      ) : null}
    </section>
  );
}
