import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function forwardGameRequest(request: NextRequest, path: string) {
  const token = (await cookies()).get('auth-token')?.value;
  if (!token) return NextResponse.json({ message: 'Please sign in to play' }, { status: 401 });
  const base = process.env.BACKEND_URL;
  if (!base) return NextResponse.json({ message: 'Games service is not configured' }, { status: 503 });
  try {
    const response = await fetch(`${base.replace(/\/$/, '')}/games/${path}${request.nextUrl.search}`, {
      method: request.method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: request.method === 'POST' ? await request.text() : undefined,
      cache: 'no-store',
    });
    const data: unknown = await response.json();
    return NextResponse.json(data, { status: response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ message: 'Games are temporarily unavailable. Please try again.' }, { status: 502 });
  }
}
