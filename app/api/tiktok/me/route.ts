import { NextResponse } from "next/server";
import { getActiveTikTokSession } from "@/lib/tiktok-auth";
import { TikTokApiError } from "@/lib/tiktok";
import { clearTikTokSession } from "@/lib/tiktok-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getActiveTikTokSession();

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
      scope: session.scope,
      expiresAt: session.expiresAt,
    });
  } catch (errorCause) {
    if (
      errorCause instanceof TikTokApiError &&
      (errorCause.status === 401 || errorCause.code === "access_token_invalid")
    ) {
      await clearTikTokSession();
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const message =
      errorCause instanceof Error
        ? errorCause.message
        : "Unable to check TikTok session right now.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
