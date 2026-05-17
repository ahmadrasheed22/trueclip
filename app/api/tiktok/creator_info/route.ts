import { NextResponse } from "next/server";
import { getTikTokSession } from "@/lib/tiktok-session";
import { queryTikTokCreatorInfoDirect } from "@/lib/tiktok";

export async function GET() {
  try {
    const session = await getTikTokSession();

    if (!session?.accessToken) {
      return NextResponse.json({ error: "User is not authenticated" }, { status: 401 });
    }

    const creatorInfo = await queryTikTokCreatorInfoDirect(session.accessToken);
    return NextResponse.json(creatorInfo);
  } catch {
    return NextResponse.json({ error: "Failed to fetch creator info" }, { status: 500 });
  }
}