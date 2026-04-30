import { NextRequest, NextResponse } from "next/server";
import type { Clip, GenerateResponse } from "@/types/clips";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const REQUEST_TIMEOUT_MS = 300_000;
const RETRY_DELAY_MS = 1_250;
const DEFAULT_MAX_ATTEMPTS = 3;
const VIDEO_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

type BackendAttemptTarget = {
  backendBaseUrl: string;
  youtubeUrl: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function toPositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function dedupeStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function parseYouTubeVideoId(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const maybeId = url.pathname.split("/").filter(Boolean)[0] ?? "";
      return VIDEO_ID_REGEX.test(maybeId) ? maybeId : null;
    }

    if (
      hostname !== "youtube.com" &&
      hostname !== "m.youtube.com" &&
      hostname !== "music.youtube.com"
    ) {
      return null;
    }

    if (url.pathname === "/watch") {
      const maybeId = url.searchParams.get("v")?.trim() ?? "";
      return VIDEO_ID_REGEX.test(maybeId) ? maybeId : null;
    }

    const pathSegments = url.pathname.split("/").filter(Boolean);
    if (pathSegments.length < 2) {
      return null;
    }

    const firstSegment = pathSegments[0] ?? "";
    const secondSegment = pathSegments[1] ?? "";
    if (["shorts", "embed", "live", "v"].includes(firstSegment)) {
      return VIDEO_ID_REGEX.test(secondSegment) ? secondSegment : null;
    }

    return null;
  } catch {
    return null;
  }
}

function buildYouTubeUrlVariants(rawUrl: string): string[] {
  const normalized = rawUrl.trim();
  const videoId = parseYouTubeVideoId(normalized);

  if (!videoId) {
    return [normalized];
  }

  const variants = [
    normalized,
    `https://www.youtube.com/watch?v=${videoId}`,
    `https://youtu.be/${videoId}`,
    `https://m.youtube.com/watch?v=${videoId}`,
  ];

  return dedupeStrings(variants);
}

function readBackendBaseUrls(): string[] {
  const primary = process.env.CLIP_BACKEND_URL?.trim() ?? "";
  const fallbackRaw = process.env.CLIP_BACKEND_FALLBACK_URLS?.trim() ?? "";

  const fallbackUrls = fallbackRaw
    ? fallbackRaw
        .split(/[\s,]+/)
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  return dedupeStrings([primary, ...fallbackUrls].filter(Boolean));
}

function buildAttemptTargets(
  backendBaseUrls: string[],
  youtubeUrlVariants: string[]
): BackendAttemptTarget[] {
  const targets: BackendAttemptTarget[] = [];

  for (const backendBaseUrl of backendBaseUrls) {
    for (const youtubeUrl of youtubeUrlVariants) {
      targets.push({ backendBaseUrl, youtubeUrl });
    }
  }

  return targets;
}

function isGenericFailureMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower === "download failed." ||
    lower === "clip generation failed. please verify the url and try again." ||
    lower === "clip generation service is temporarily unavailable. please try again in a moment."
  );
}

function mapKnownExtractorError(rawMessage: string): string {
  const errorMatch = rawMessage.match(/error:\s*([\s\S]+)/i);
  const normalizedMessage = normalizeWhitespace(errorMatch?.[1] ?? rawMessage);
  const lower = normalizedMessage.toLowerCase();

  if (lower.includes("no supported javascript runtime could be found")) {
    return "Clip backend yt-dlp runtime is incomplete. Install Node.js runtime support for yt-dlp JS extraction (for example, pass --js-runtimes node on the backend).";
  }

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
  if (typeof payload === "string" && payload.trim()) {
    return mapKnownExtractorError(payload);
  }

  const root = asRecord(payload);
  if (!root) {
    return null;
  }

  const nestedError = asRecord(root.error);
  const candidate =
    root.error ??
    root.message ??
    root.detail ??
    nestedError?.message ??
    nestedError?.detail;

  if (typeof candidate === "string" && candidate.trim()) {
    return mapKnownExtractorError(candidate);
  }

  return null;
}

async function parseBackendPayload(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text || !text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function shouldRetryAttempt(statusCode: number): boolean {
  return statusCode === 408 || statusCode === 429 || statusCode >= 500;
}

function selectBestAttemptError(errorMessages: string[]): string {
  if (errorMessages.length === 0) {
    return "Clip generation failed. Please verify the URL and try again.";
  }

  const informative = errorMessages.find((message) => !isGenericFailureMessage(message));
  if (informative) {
    return informative;
  }

  return errorMessages[errorMessages.length - 1];
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

  const recordBody = asRecord(requestBody);
  const youtubeUrl = recordBody?.youtubeUrl;
  const subtitleStyle = recordBody?.subtitleStyle;
  const highlightColor = recordBody?.highlightColor;
  const fontSize = recordBody?.fontSize;
  const position = recordBody?.position;

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

  const backendBaseUrls = readBackendBaseUrls();

  if (backendBaseUrls.length === 0) {
    const missingConfigResponse: GenerateResponse = {
      clips: [],
      error: "CLIP_BACKEND_URL is not configured on the server.",
    };

    return NextResponse.json(missingConfigResponse, { status: 500 });
  }

  const youtubeUrlVariants = buildYouTubeUrlVariants(trimmedUrl);
  const attemptTargets = buildAttemptTargets(backendBaseUrls, youtubeUrlVariants);
  const maxAttempts = Math.min(
    attemptTargets.length,
    toPositiveInt(process.env.CLIP_BACKEND_MAX_ATTEMPTS, DEFAULT_MAX_ATTEMPTS)
  );

  if (maxAttempts === 0) {
    const invalidConfigResponse: GenerateResponse = {
      clips: [],
      error: "No valid clip backend targets were configured.",
    };

    return NextResponse.json(invalidConfigResponse, { status: 500 });
  }

  const attemptErrors: string[] = [];
  let lastStatusCode = 502;

  for (let index = 0; index < maxAttempts; index += 1) {
    const target = attemptTargets[index];
    let endpoint: URL;

    try {
      endpoint = new URL("/generate", target.backendBaseUrl);
    } catch {
      attemptErrors.push(
        "One configured backend URL is invalid. Check CLIP_BACKEND_URL/CLIP_BACKEND_FALLBACK_URLS."
      );
      lastStatusCode = 500;
      continue;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const backendResponse = await fetch(endpoint.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          youtubeUrl: target.youtubeUrl,
          subtitleStyle,
          highlightColor,
          fontSize,
          position
        }),
        signal: controller.signal,
        cache: "no-store",
      });

      const payload = await parseBackendPayload(backendResponse);

      if (backendResponse.ok) {
        const successResponse: GenerateResponse = {
          clips: normalizeClips(payload),
        };

        return NextResponse.json(successResponse);
      }

      const fallbackMessage =
        backendResponse.status >= 500
          ? "Clip generation service is temporarily unavailable. Please try again in a moment."
          : "Clip generation failed. Please verify the URL and try again.";
      const extractedMessage = extractErrorMessage(payload) ?? fallbackMessage;

      attemptErrors.push(extractedMessage);
      lastStatusCode =
        backendResponse.status >= 400 && backendResponse.status < 600
          ? backendResponse.status
          : 502;

      const hasNextAttempt = index < maxAttempts - 1;
      if (hasNextAttempt && shouldRetryAttempt(lastStatusCode)) {
        await sleep(RETRY_DELAY_MS);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        attemptErrors.push(
          "Clip generation timed out after 5 minutes. Please try a shorter video or try again."
        );
        lastStatusCode = 504;
      } else {
        attemptErrors.push(
          "Unable to contact the clip generation service right now. Please try again."
        );
        lastStatusCode = 502;
      }

      const hasNextAttempt = index < maxAttempts - 1;
      if (hasNextAttempt) {
        await sleep(RETRY_DELAY_MS);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  const failureResponse: GenerateResponse = {
    clips: [],
    error: selectBestAttemptError(attemptErrors),
  };

  return NextResponse.json(failureResponse, { status: lastStatusCode });
}
