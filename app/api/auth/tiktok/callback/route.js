import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const callbackUrl = new URL("/api/tiktok/callback", request.url);
  callbackUrl.search = request.nextUrl.search;

  // Keep legacy callback path operational for TikTok apps that still point here.
  return NextResponse.redirect(callbackUrl);
}
