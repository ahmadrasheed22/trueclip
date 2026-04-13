import { NextResponse } from "next/server";
import { clearTikTokOAuthState, clearTikTokSession } from "@/lib/tiktok-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await clearTikTokSession();
  await clearTikTokOAuthState();

  return NextResponse.json({ success: true });
}
