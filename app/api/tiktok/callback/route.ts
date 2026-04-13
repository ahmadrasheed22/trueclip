import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForAccessToken, fetchTikTokUserProfile } from "@/lib/tiktok";
import {
  clearTikTokOAuthState,
  getTikTokOAuthState,
  setTikTokSession,
} from "@/lib/tiktok-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function withErrorRedirect(request: NextRequest, message: string) {
  const url = new URL("/", request.url);
  url.searchParams.set("tiktokError", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim() ?? "";
  const state = request.nextUrl.searchParams.get("state")?.trim() ?? "";
  const error = request.nextUrl.searchParams.get("error")?.trim();
  const errorDescription = request.nextUrl.searchParams.get("error_description")?.trim();

  if (error) {
    return withErrorRedirect(request, errorDescription || "TikTok authorization was canceled.");
  }

  if (!code || !state) {
    return withErrorRedirect(request, "Missing code or state in TikTok callback.");
  }

  const expectedState = await getTikTokOAuthState();
  await clearTikTokOAuthState();

  if (!expectedState || expectedState !== state) {
    return withErrorRedirect(request, "TikTok login request could not be verified.");
  }

  try {
    const tokenSet = await exchangeCodeForAccessToken(code);
    const user = await fetchTikTokUserProfile(tokenSet.accessToken);

    await setTikTokSession({
      accessToken: tokenSet.accessToken,
      refreshToken: tokenSet.refreshToken,
      openId: tokenSet.openId,
      scope: tokenSet.scope,
      expiresAt: tokenSet.expiresAt,
      refreshExpiresAt: tokenSet.refreshExpiresAt,
      user,
    });

    const successUrl = new URL("/", request.url);
    successUrl.searchParams.set("tiktok", "connected");
    return NextResponse.redirect(successUrl);
  } catch (errorCause) {
    const message =
      errorCause instanceof Error
        ? errorCause.message
        : "Unable to complete TikTok login right now.";

    return withErrorRedirect(request, message);
  }
}
