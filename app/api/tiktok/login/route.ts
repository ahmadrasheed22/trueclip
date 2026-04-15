import { NextRequest, NextResponse } from "next/server";
import { buildTikTokAuthorizeUrl, createTikTokOAuthState } from "@/lib/tiktok";
import { setTikTokOAuthState } from "@/lib/tiktok-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectNoStore(url: string | URL) {
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const state = createTikTokOAuthState();
    await setTikTokOAuthState(state);

    return redirectNoStore(buildTikTokAuthorizeUrl(state));
  } catch {
    const fallbackUrl = new URL("/", request.url);
    fallbackUrl.searchParams.set("tiktokError", "Unable to start TikTok login right now.");
    return redirectNoStore(fallbackUrl);
  }
}
