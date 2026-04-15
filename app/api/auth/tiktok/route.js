import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  // Keep legacy endpoint for compatibility with already-submitted TikTok app configs.
  return NextResponse.redirect(new URL("/api/tiktok/login", request.url));
}
