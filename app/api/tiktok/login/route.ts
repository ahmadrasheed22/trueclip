import { NextRequest, NextResponse } from "next/server";
import { buildTikTokAuthorizeUrl, createTikTokOAuthState } from "@/lib/tiktok";
import { setTikTokOAuthState } from "@/lib/tiktok-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const state = createTikTokOAuthState();
    await setTikTokOAuthState(state);

    return NextResponse.redirect(buildTikTokAuthorizeUrl(state));
  } catch {
    const fallbackUrl = new URL("/", request.url);
    fallbackUrl.searchParams.set("tiktokError", "Unable to start TikTok login right now.");
    return NextResponse.redirect(fallbackUrl);
  }
}
