import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('access_token');
  const backendUrl = process.env.CLIP_BACKEND_URL || process.env.NEXT_PUBLIC_CLIP_BACKEND_URL;

  if (!backendUrl) {
    return NextResponse.json({ error: 'Backend URL is not configured (CLIP_BACKEND_URL is missing).' }, { status: 500 });
  }

  if (!token) {
    return NextResponse.json({ error: 'access_token is required.' }, { status: 400 });
  }

  const res = await fetch(`${backendUrl}/tiktok/creator-info?access_token=${encodeURIComponent(token)}`);
  const data = await res.json();
  return NextResponse.json(data);
}