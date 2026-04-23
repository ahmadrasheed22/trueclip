import { NextRequest, NextResponse } from "next/server";
import type { Clip, GenerateResponse } from "@/types/clips";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const REQUEST_TIMEOUT_MS = 300_000;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function mapKnownExtractorError(rawMessage: string): string {
  const errorMatch = rawMessage.match(/error:\s*([\s\S]+)/i);
  const normalizedMessage = normalizeWhitespace(errorMatch?.[1] ?? rawMessage);
  const lower = normalizedMessage.toLowerCase();

  if (
    lower.includes("sign in to confirm you're not a bot") ||
    lower.includes("--cookies-from-browser") ||
    lower.includes("use --cookies")
  ) {
    return "YouTube blocked automated access for this video. Configure authenticated yt-dlp cookies on the clip backend, then try again.";
  }

  if (lower.includes("private video") || lower.includes("members-only")) {
    return "This video is private or members-only. Please try a public YouTube video.";
  }

  if (lower.includes("video unavailable") || lower.includes("not available")) {
    return "This video is unavailable or region-restricted. Please try another YouTube video.";
  }

  return normalizedMessage;
}

function isValidYouTubeUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl.trim());
    const hostname = url.hostname.toLowerCase();

    if (hostname === "youtu.be") {
      return url.pathname.length > 1;
    }

    const normalizedHost = hostname.replace(/^www\./, "");
    const isYouTubeHost =
      normalizedHost === "youtube.com" ||
      normalizedHost === "m.youtube.com" ||
      normalizedHost === "music.youtube.com";

    if (!isYouTubeHost) {
      return false;
    }

    const pathname = url.pathname;

    if (pathname === "/watch") {
      return Boolean(url.searchParams.get("v"));
    }

    if (pathname === "/playlist") {
      return Boolean(url.searchParams.get("list"));
    }

    return /^(\/shorts\/|\/live\/|\/embed\/|\/@|\/channel\/|\/c\/|\/user\/)/.test(pathname);
  } catch {
    return false;
  }
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function normalizeClip(rawClip: unknown, fallbackIndex: number): Clip | null {
  const source = asRecord(rawClip);
  if (!source) {
    return null;
  }

  const idRaw = source.id;
  const videoUrlRaw = source.videoUrl;
  const subtitleRaw = source.subtitle;

  if (typeof videoUrlRaw !== "string" || !videoUrlRaw.trim()) {
    return null;
  }

  return {
    id:
      typeof idRaw === "string" && idRaw.trim()
        ? idRaw
        : `clip-${fallbackIndex + 1}`,
    videoUrl: videoUrlRaw,
    duration: toNumber(source.duration),
    subtitle: typeof subtitleRaw === "string" ? subtitleRaw : "",
    startTime: toNumber(source.startTime),
    endTime: toNumber(source.endTime),
  };
}

function normalizeClips(payload: unknown): Clip[] {
  const root = asRecord(payload);

  let source: unknown[] = [];

  if (Array.isArray(payload)) {
    source = payload;
  } else if (root && Array.isArray(root.clips)) {
    source = root.clips;
  }

  return source
    .map((clip, index) => normalizeClip(clip, index))
    .filter((clip): clip is Clip => clip !== null);
}

function extractErrorMessage(payload: unknown): string | null {
  const root = asRecord(payload);
  if (!root) {
    return null;
  }

  const candidate = root.error ?? root.message ?? root.detail;

  if (typeof candidate === "string" && candidate.trim()) {
    return mapKnownExtractorError(candidate);
  }

  return null;
}

export async function POST(request: NextRequest) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    const invalidJsonResponse: GenerateResponse = {
      clips: [],
      error: "Request body must be valid JSON.",
    };

    return NextResponse.json(invalidJsonResponse, { status: 400 });
  }

  const youtubeUrl = asRecord(requestBody)?.youtubeUrl;

  if (typeof youtubeUrl !== "string" || !youtubeUrl.trim()) {
    const invalidInputResponse: GenerateResponse = {
      clips: [],
      error: "Please provide a YouTube URL.",
    };

    return NextResponse.json(invalidInputResponse, { status: 400 });
  }

  const trimmedUrl = youtubeUrl.trim();

  if (!isValidYouTubeUrl(trimmedUrl)) {
    const invalidUrlResponse: GenerateResponse = {
      clips: [],
      error: "Please enter a valid YouTube URL.",
    };

    return NextResponse.json(invalidUrlResponse, { status: 400 });
  }

  const backendUrl = process.env.CLIP_BACKEND_URL?.trim();

  if (!backendUrl) {
    const missingConfigResponse: GenerateResponse = {
      clips: [],
      error: "CLIP_BACKEND_URL is not configured on the server.",
    };

    return NextResponse.json(missingConfigResponse, { status: 500 });
  }

  let endpoint: URL;

  try {
    endpoint = new URL("/generate", backendUrl);
  } catch {
    const invalidConfigResponse: GenerateResponse = {
      clips: [],
      error: "CLIP_BACKEND_URL is invalid. Please check your server config.",
    };

    return NextResponse.json(invalidConfigResponse, { status: 500 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const backendResponse = await fetch(endpoint.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ youtubeUrl: trimmedUrl }),
      signal: controller.signal,
      cache: "no-store",
    });

    const payload = (await backendResponse.json().catch(() => null)) as unknown;

    if (!backendResponse.ok) {
      const fallbackMessage =
        backendResponse.status >= 500
          ? "Clip generation service is temporarily unavailable. Please try again in a moment."
          : "Clip generation failed. Please verify the URL and try again.";

      const backendErrorResponse: GenerateResponse = {
        clips: [],
        error: extractErrorMessage(payload) ?? fallbackMessage,
      };

      const statusCode =
        backendResponse.status >= 400 && backendResponse.status < 600
          ? backendResponse.status
          : 502;

      return NextResponse.json(backendErrorResponse, { status: statusCode });
    }

    const successResponse: GenerateResponse = {
      clips: normalizeClips(payload),
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      const timeoutResponse: GenerateResponse = {
        clips: [],
        error:
          "Clip generation timed out after 5 minutes. Please try a shorter video or try again.",
      };

      return NextResponse.json(timeoutResponse, { status: 504 });
    }

    const networkErrorResponse: GenerateResponse = {
      clips: [],
      error: "Unable to contact the clip generation service right now. Please try again.",
    };

    return NextResponse.json(networkErrorResponse, { status: 502 });
  } finally {
    clearTimeout(timeoutId);
  }
}
