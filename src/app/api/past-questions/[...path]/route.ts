import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

type Context = { params: Promise<{ path: string[] }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function forward(request: NextRequest, context: Context) {
  const path = (await context.params).path;
  const route = path.join('/');
  const method = request.method;
  const allowed = (method === 'GET' && (route === 'availability' || route === 'attempts/active' ||
    (path.length === 2 && path[0] === 'attempts' && UUID.test(path[1])) ||
    (path.length === 3 && path[0] === 'attempts' && UUID.test(path[1]) && path[2] === 'result'))) ||
    (method === 'POST' && (route === 'attempts' ||
      (path.length === 3 && path[0] === 'attempts' && UUID.test(path[1]) && path[2] === 'submit'))) ||
    (method === 'PATCH' && path.length === 3 && path[0] === 'attempts' && UUID.test(path[1]) && path[2] === 'answers');
  if (!allowed) return NextResponse.json({ success: false, message: 'Unknown practice route' }, { status: 404 });
  const token = (await cookies()).get('auth-token')?.value;
  if (!token) return NextResponse.json({ success: false, message: 'Please sign in' }, { status: 401 });
  const base = process.env.BACKEND_URL;
  if (!base) return NextResponse.json({ success: false, message: 'Practice service is not configured' }, { status: 503 });
  try {
    const response = await fetch(`${base.replace(/\/$/, '')}/past-questions/${route}`, {
      method, headers: { Authorization: `Bearer ${token}`, ...(method !== 'GET' ? { 'Content-Type': 'application/json' } : {}) },
      body: method !== 'GET' ? await request.text() : undefined, cache: 'no-store',
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return NextResponse.json({ success: false,
      message: response.status === 404 ? 'JAMB Past Questions are not available on the configured backend yet.' : 'The practice service returned an unexpected response.' }, { status: 502 });
    return NextResponse.json(await response.json(), { status: response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false, message: 'Practice service is unavailable' }, { status: 502 });
  }
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
