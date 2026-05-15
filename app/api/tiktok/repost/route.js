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

    // 1. Download the video from URL
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      return NextResponse.json({ error: `Failed to download video: ${videoResponse.statusText}` }, { status: 400 });
    }
    
    const arrayBuffer = await videoResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const videoSize = buffer.length;

    const maxChunkSize = 64 * 1024 * 1024; // 64 MB
    let chunkSize = videoSize;
    let totalChunkCount = 1;

    if (videoSize > maxChunkSize) {
      chunkSize = maxChunkSize;
      totalChunkCount = Math.ceil(videoSize / chunkSize);
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
        source: "FILE_UPLOAD",
        video_size: videoSize,
        chunk_size: chunkSize,
        total_chunk_count: totalChunkCount,
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
    const uploadUrl = payload?.data?.upload_url || payload?.upload_url || "";

    if (!publishId || !uploadUrl) {
      return NextResponse.json({ error: "TikTok returned valid init response but missing publish_id or upload_url." }, { status: 500 });
    }

    // Upload chunks to the uploadUrl directly
    for (let i = 0; i < totalChunkCount; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, videoSize);
      const chunk = buffer.subarray(start, end);
      const contentRange = `bytes ${start}-${end - 1}/${videoSize}`;

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "video/mp4",
          "Content-Length": chunk.length.toString(),
          "Content-Range": contentRange,
        },
        body: chunk,
      });

      if (!uploadResponse.ok) {
        return NextResponse.json({ error: `Failed to upload chunk ${i + 1} to TikTok: ${uploadResponse.statusText}` }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      publish_id: publishId,
    });
  } catch (error) {
    return NextResponse.json({ error: "Unable to repost video to TikTok. " + (error.message || "") }, { status: 500 });
  }
}
