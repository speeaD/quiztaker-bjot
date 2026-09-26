import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

type Context = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, context: Context) {
  const path = (await context.params).path;
  const uuid = /^[0-9a-f-]{36}$/i;
  const valid = path.length === 1 && path[0] === 'subjects' && request.method === 'GET' ||
    path.length === 2 && path[0] === 'topics' && uuid.test(path[1]) && request.method === 'GET' ||
    path.length === 3 && path[0] === 'topics' && uuid.test(path[1]) && path[2] === 'start' && request.method === 'POST' ||
    path.length === 2 && path[0] === 'attempts' && uuid.test(path[1]) && request.method === 'GET' ||
    path.length === 3 && path[0] === 'attempts' && uuid.test(path[1]) && path[2] === 'submit' && request.method === 'POST';
  if (!valid) return NextResponse.json({ message: 'Unknown study hub route' }, { status: 404 });
  const token = (await cookies()).get('auth-token')?.value;
  if (!token) return NextResponse.json({ message: 'Please sign in' }, { status: 401 });
  if (!process.env.BACKEND_URL) return NextResponse.json({ message: 'Study hub service is not configured' }, { status: 503 });
  try {
    const response = await fetch(`${process.env.BACKEND_URL.replace(/\/$/, '')}/study-hub/${path.join('/')}`, {
      method: request.method,
      headers: { Authorization: `Bearer ${token}`, ...(request.method === 'POST' ? { 'Content-Type': 'application/json' } : {}) },
      body: request.method === 'POST' ? await request.text() : undefined,
      cache: 'no-store',
    });
    const contentType = response.headers.get('Content-Type') || '';
    if (!/\bjson\b/i.test(contentType)) {
      console.error('Study hub backend returned a non-JSON response', { status: response.status, contentType });
      return NextResponse.json({ message: 'Study Hub is temporarily unavailable. Please try again later.' }, { status: 502 });
    }
    try {
      const data: unknown = await response.json();
      return NextResponse.json(data, { status: response.status, headers: { 'Cache-Control': 'no-store' } });
    } catch {
      console.error('Study hub backend returned invalid JSON', { status: response.status });
      return NextResponse.json({ message: 'Study Hub is temporarily unavailable. Please try again later.' }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ message: 'Study hub service is unavailable' }, { status: 502 });
  }
}

export const GET = forward;
export const POST = forward;
