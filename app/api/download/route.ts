import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function dedupeStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function readBackendBaseUrls(): string[] {
  const primary = process.env.CLIP_BACKEND_URL?.trim() ?? "";
  const fallbackRaw = process.env.CLIP_BACKEND_FALLBACK_URLS?.trim() ?? "";
  const publicUrl = process.env.NEXT_PUBLIC_CLIP_BACKEND_URL?.trim() ?? "";

  const fallbackUrls = fallbackRaw
    ? fallbackRaw
        .split(/[\s,]+/)
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  return dedupeStrings([primary, publicUrl, ...fallbackUrls].filter(Boolean));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const title = searchParams.get("title") || "short";

  if (!videoId || typeof videoId !== "string" || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json({ error: "Valid videoId is required" }, { status: 400 });
  }

  const backendBaseUrls = readBackendBaseUrls();

  if (backendBaseUrls.length === 0) {
    return NextResponse.json({ error: "Backend URL is not configured (CLIP_BACKEND_URL is missing)." }, { status: 500 });
  }

  const attemptErrors: string[] = [];

  for (const backendUrl of backendBaseUrls) {
    try {
      const targetUrl = new URL(`/download/youtube/${videoId}`, backendUrl);
      targetUrl.searchParams.set("title", title);

      const response = await fetch(targetUrl.toString(), { cache: "no-store" });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        attemptErrors.push(errorPayload?.error || `Backend responded with status: ${response.status}`);
        continue;
      }

      const headers = new Headers();
      headers.set("Content-Type", response.headers.get("Content-Type") || "video/mp4");

      const disposition = response.headers.get("Content-Disposition");
      if (disposition) {
        headers.set("Content-Disposition", disposition);
      }

      const length = response.headers.get("Content-Length");
      if (length) {
        headers.set("Content-Length", length);
      }

      return new NextResponse(response.body, {
        status: response.status,
        headers,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      attemptErrors.push(message);
    }
  }

  const fallbackError = attemptErrors[attemptErrors.length - 1] || "All configured backend download URLs failed.";
  return NextResponse.json({ error: fallbackError }, { status: 502 });
}