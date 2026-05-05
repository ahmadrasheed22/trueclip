import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const title = searchParams.get("title") || "short";

  if (!videoId || typeof videoId !== "string" || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json({ error: "Valid videoId is required" }, { status: 400 });
  }

  const backendUrl = process.env.CLIP_BACKEND_URL || process.env.NEXT_PUBLIC_CLIP_BACKEND_URL;
  
  if (!backendUrl) {
    return NextResponse.json({ error: "Backend URL is not configured (CLIP_BACKEND_URL is missing)." }, { status: 500 });
  }

  try {
    const targetUrl = new URL(`/download/youtube/${videoId}`, backendUrl);
    targetUrl.searchParams.set("title", title);

    const response = await fetch(targetUrl.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      let errorMessage = `Backend responded with status: ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        // Fallback if not JSON
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "video/mp4");
    
    const disposition = response.headers.get("Content-Disposition");
    if (disposition) {
      headers.set("Content-Disposition", disposition);
    } else {
      headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(title)}.mp4"`);
    }

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}