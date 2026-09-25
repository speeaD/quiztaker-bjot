import { NextRequest, NextResponse } from 'next/server';

const allowed = new Set(['question-sets', 'mock/sessions', 'topic/questions', 'topic/submit']);

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
    const response = await fetch(upstream, {
      method: request.method,
      headers: request.method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
      body: request.method === 'POST' ? await request.text() : undefined,
      cache: 'no-store',
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'no-store' },
    });
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
