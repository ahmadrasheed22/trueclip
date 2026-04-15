import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const targetUrl = new URL("/api/tiktok/login", request.url);
  const cacheBust = request.nextUrl.searchParams.get("ts");

  if (cacheBust) {
    targetUrl.searchParams.set("ts", cacheBust);
  }

  // Keep legacy endpoint for compatibility with already-submitted TikTok app configs.
  const response = NextResponse.redirect(targetUrl);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}
