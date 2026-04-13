import { NextResponse } from "next/server";

const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,follower_count";

function errorRedirect(request) {
  return NextResponse.redirect(new URL("/?tiktok=error", request.url));
}

export async function GET(request) {
  try {
    const code = request.nextUrl.searchParams.get("code") || "";

    if (!code) {
      return errorRedirect(request);
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI;

    if (!clientKey || !clientSecret || !redirectUri) {
      return errorRedirect(request);
    }

    const tokenBody = new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });

    const tokenResponse = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenBody.toString(),
      cache: "no-store",
    });

    const tokenPayload = await tokenResponse.json().catch(() => null);

    if (!tokenResponse.ok || !tokenPayload) {
      return errorRedirect(request);
    }

    const accessToken = tokenPayload.access_token || tokenPayload.data?.access_token || "";
    const refreshToken = tokenPayload.refresh_token || tokenPayload.data?.refresh_token || "";
    const fallbackOpenId = tokenPayload.open_id || tokenPayload.data?.open_id || "";

    if (!accessToken) {
      return errorRedirect(request);
    }

    const userInfoResponse = await fetch(USER_INFO_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const userInfoPayload = await userInfoResponse.json().catch(() => null);
    if (!userInfoResponse.ok || !userInfoPayload) {
      return errorRedirect(request);
    }

    const user = userInfoPayload.data?.user || userInfoPayload.data || {};
    const openId = user.open_id || fallbackOpenId || "";
    const displayName = user.display_name || "";
    const avatarUrl = user.avatar_url || "";

    const successUrl = new URL("/", request.url);
    successUrl.searchParams.set("tiktok", "success");
    successUrl.searchParams.set("access_token", accessToken);
    successUrl.searchParams.set("refresh_token", refreshToken);
    successUrl.searchParams.set("open_id", openId);
    successUrl.searchParams.set("display_name", displayName);
    successUrl.searchParams.set("avatar_url", avatarUrl);

    return NextResponse.redirect(successUrl);
  } catch {
    return errorRedirect(request);
  }
}
