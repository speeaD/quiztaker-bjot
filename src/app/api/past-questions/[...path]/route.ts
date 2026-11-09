import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

type Context = { params: Promise<{ path: string[] }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function forward(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const route = path.join('/');
  const method = path.length === 1 && path[0] === 'availability' ? 'GET'
    : path.length === 1 && path[0] === 'attempts' ? 'POST'
    : path.length === 2 && path[0] === 'attempts' && (path[1] === 'active' || UUID.test(path[1])) ? 'GET'
    : path.length === 3 && path[0] === 'attempts' && UUID.test(path[1])
      ? ({ answers: 'PATCH', submit: 'POST', result: 'GET' } as Record<string, string>)[path[2]] : undefined;
  if (!method) return NextResponse.json({ success: false, message: 'Unknown practice route' }, { status: 404 });
  if (request.method !== method) return NextResponse.json({ success: false, message: 'Method not allowed' }, { status: 405 });
  const token = (await cookies()).get('auth-token')?.value;
  if (!token) return NextResponse.json({ success: false, message: 'Please sign in to practise JAMB questions' }, { status: 401 });
  const base = process.env.BACKEND_URL;
  if (!base) return NextResponse.json({ success: false, message: 'Practice service is not configured' }, { status: 503 });
  try {
    const response = await fetch(`${base.replace(/\/$/, '')}/past-questions/${route}`, {
      method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: method === 'POST' || method === 'PATCH' ? await request.text() : undefined,
      cache: 'no-store',
    });
    return NextResponse.json(await response.json(), { status: response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false, message: 'Practice service is unavailable. Please try again.' }, { status: 502 });
  }
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
