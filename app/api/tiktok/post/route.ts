import { NextRequest, NextResponse } from "next/server";
import { getActiveTikTokSession } from "@/lib/tiktok-auth";
import {
  buildTikTokCaption,
  publishTikTokVideoFromUrl,
  TikTokApiError,
} from "@/lib/tiktok";
import { clearTikTokSession } from "@/lib/tiktok-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PostRequestBody = {
  videoUrl?: string;
  captionSeed?: string;
};

function hasScope(scopeValue: string, requiredScope: string): boolean {
  return scopeValue
    .split(",")
    .map((scopeItem) => scopeItem.trim())
    .includes(requiredScope);
}

function isHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  let body: PostRequestBody = {};

  try {
    body = (await request.json()) as PostRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const videoUrl = typeof body.videoUrl === "string" ? body.videoUrl.trim() : "";
  const captionSeed = typeof body.captionSeed === "string" ? body.captionSeed : "";

  if (!videoUrl || !isHttpsUrl(videoUrl)) {
    return NextResponse.json(
      { error: "Provide a valid HTTPS video URL to post to TikTok." },
      { status: 400 }
    );
  }

  try {
    const session = await getActiveTikTokSession();

    if (!session) {
      return NextResponse.json(
        { error: "TikTok session not found. Please log in again." },
        { status: 401 }
      );
    }

    if (!hasScope(session.scope, "video.publish")) {
      return NextResponse.json(
        {
          error:
            "This TikTok session is Login Kit only. Add the Content Posting product, include video.publish in TIKTOK_SCOPE, then reconnect your TikTok account.",
        },
        { status: 403 }
      );
    }

    const caption = buildTikTokCaption(captionSeed);
    const publish = await publishTikTokVideoFromUrl(session.accessToken, videoUrl, caption);

    return NextResponse.json({
      success: true,
      publishId: publish.publishId,
      logId: publish.logId,
      caption,
      message: "Video submitted to TikTok direct post successfully.",
    });
  } catch (errorCause) {
    if (
      errorCause instanceof TikTokApiError &&
      (errorCause.status === 401 || errorCause.code === "access_token_invalid")
    ) {
      await clearTikTokSession();
      return NextResponse.json(
        { error: "TikTok session expired. Please log in again." },
        { status: 401 }
      );
    }

    if (errorCause instanceof TikTokApiError && errorCause.code === "url_ownership_unverified") {
      return NextResponse.json(
        {
          error:
            "TikTok requires your video URL domain to be verified for PULL_FROM_URL uploads.",
        },
        { status: 400 }
      );
    }

    const message =
      errorCause instanceof Error
        ? errorCause.message
        : "Unable to post this video to TikTok right now.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
