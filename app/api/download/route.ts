import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const title = searchParams.get("title") || "short";

  if (!videoId || typeof videoId !== "string" || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json({ error: "Valid videoId is required" }, { status: 400 });
  }

  const backendUrl = process.env.CLIP_BACKEND_URL || process.env.NEXT_PUBLIC_CLIP_BACKEND_URL;
  
  if (!backendUrl) {
    return NextResponse.json({ error: "Backend URL is not configured (CLIP_BACKEND_URL is missing)." }, { status: 500 });
  }

  try {
    const targetUrl = new URL(`/download/youtube/${videoId}`, backendUrl);
    targetUrl.searchParams.set("title", title);

    return NextResponse.redirect(targetUrl, { status: 307 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}