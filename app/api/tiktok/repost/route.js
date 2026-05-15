import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const accessToken = typeof body?.access_token === "string" ? body.access_token.trim() : "";
    const videoUrl = typeof body?.video_url === "string" ? body.video_url.trim() : "";
    const title = typeof body?.title === "string" && body.title.trim() ? body.title.trim() : "Posted from Trueclip";

    if (!accessToken || !videoUrl) {
      return NextResponse.json({ error: "access_token and video_url are required." }, { status: 400 });
    }

    const backendUrl = process.env.CLIP_BACKEND_URL || process.env.NEXT_PUBLIC_CLIP_BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json({ error: "Backend URL is not configured (CLIP_BACKEND_URL is missing)." }, { status: 500 });
    }

    // Call the dedicated backend endpoint to offload video download/upload processing
    const backendResponse = await fetch(`${backendUrl}/tiktok/repost`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: accessToken,
        video_url: videoUrl,
        title,
      }),
    });

    const payload = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: payload?.error || backendResponse.statusText || "Backend failed to repost video." },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: "Unable to repost video to TikTok. " + (error.message || "") }, { status: 500 });
  }
}
