import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

async function forward(request: NextRequest, path: string[]) {
  const route = path.join('/');
  const method = route === 'question-sets' ? 'GET'
    : ['start-session', 'start-single-subject', 'submit', 'submit-single-subject'].includes(route) ? 'POST' : null;
  if (!method) return NextResponse.json({ message: 'Unknown exam route' }, { status: 404 });
  if (request.method !== method) return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  const token = (await cookies()).get('auth-token')?.value;
  if (!token) return NextResponse.json({ message: 'Please sign in to take an exam' }, { status: 401 });
  const base = process.env.BACKEND_URL;
  if (!base) return NextResponse.json({ message: 'Exam service is not configured' }, { status: 503 });
  try {
    const response = await fetch(`${base.replace(/\/$/, '')}/cbt/${route}`, {
      method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: method === 'POST' ? await request.text() : undefined, cache: 'no-store',
    });
    return NextResponse.json(await response.json(), { status: response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ message: 'Exam service is unavailable. Please try again.' }, { status: 502 });
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, (await context.params).path);
}
export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, (await context.params).path);
}
