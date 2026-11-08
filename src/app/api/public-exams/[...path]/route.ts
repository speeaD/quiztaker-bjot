import { NextRequest, NextResponse } from 'next/server';

const allowed = new Set(['question-sets', 'mock/sessions', 'topic/questions', 'topic/submit']);
const deviceCookie = 'bjot_public_mock_device';

async function forward(request: NextRequest, path: string[]) {
  const route = path.join('/');
  const mockSubmission = path.length === 4 && path[0] === 'mock' && path[1] === 'sessions' && path[3] === 'submit' && /^[a-zA-Z0-9_-]+$/.test(path[2]);
  if (!allowed.has(route) && !mockSubmission) return NextResponse.json({ message: 'Unknown public exam route' }, { status: 404 });
  if ((request.method === 'GET') !== (route === 'question-sets' || route === 'topic/questions')) return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  const base = process.env.BACKEND_URL;
  if (!base) return NextResponse.json({ message: 'Exam service is not configured' }, { status: 503 });
  const upstream = new URL(`${base.replace(/\/$/, '')}/public-exams/${route}`);
  if (request.method === 'GET') upstream.search = request.nextUrl.search;
  try {
    const headers = new Headers();
    if (request.method === 'POST') headers.set('Content-Type', 'application/json');
    const isMock = route === 'question-sets' || route.startsWith('mock/');
    const device = isMock ? request.cookies.get(deviceCookie)?.value : undefined;
    if (device) headers.set('Cookie', `${deviceCookie}=${encodeURIComponent(device)}`);
    const response = await fetch(upstream, {
      method: request.method,
      headers,
      body: request.method === 'POST' ? await request.text() : undefined,
      cache: 'no-store',
    });
    const outgoing = new NextResponse(await response.text(), {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'no-store' },
    });
    if (isMock) {
      for (const cookie of response.headers.getSetCookie()) {
        if (cookie.startsWith(`${deviceCookie}=`)) outgoing.headers.append('Set-Cookie', cookie);
      }
    }
    return outgoing;
  } catch {
    return NextResponse.json({ message: 'Exam service is unavailable' }, { status: 502 });
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, (await context.params).path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, (await context.params).path);
}
