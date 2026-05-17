import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('access_token');
  const res = await fetch(`${process.env.CLIP_BACKEND_URL}/tiktok/creator-info?access_token=${token}`);
  const data = await res.json();
  return NextResponse.json(data);
}