import { NextResponse } from "next/server";

const TIKTOK_REPOST_URL = "https://open.tiktokapis.com/v2/post/publish/video/init/";

export async function POST(request) {
  try {
    const body = await request.json();

    const accessToken = typeof body?.access_token === "string" ? body.access_token.trim() : "";
    const videoUrl = typeof body?.video_url === "string" ? body.video_url.trim() : "";
    const title = typeof body?.title === "string" && body.title.trim() ? body.title.trim() : "Posted from Trueclip";

    if (!accessToken || !videoUrl) {
      return NextResponse.json({ error: "access_token and video_url are required." }, { status: 400 });
    }

    const repostPayload = {
      post_info: {
        title,
        privacy_level: "SELF_ONLY",
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: videoUrl,
      },
    };

    const response = await fetch(TIKTOK_REPOST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(repostPayload),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        payload?.error?.message ||
        payload?.message ||
        payload?.error_description ||
        "Unable to repost video to TikTok.";

      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const publishId = payload?.data?.publish_id || payload?.publish_id || "";

    return NextResponse.json({
      success: true,
      publish_id: publishId,
    });
  } catch {
    return NextResponse.json({ error: "Unable to repost video to TikTok." }, { status: 500 });
  }
}
