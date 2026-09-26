import { NextRequest, NextResponse } from 'next/server';
import { forwardGameRequest } from '@/lib/game-proxy';

type Context = { params: Promise<{ path: string[] }> };
async function forward(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const valid = (path.length === 1 && ['subjects', 'history', 'leaderboard'].includes(path[0]) && request.method === 'GET') ||
    (path.length === 1 && path[0] === 'start' && request.method === 'POST') ||
    (path[0] === 'sessions' && uuid.test(path[1] || '') && ((path.length === 2 && request.method === 'GET') ||
      (path.length === 3 && ['answer', 'quit'].includes(path[2]) && request.method === 'POST')));
  if (!valid) return NextResponse.json({ message: 'Unknown game route' }, { status: 404 });
  return forwardGameRequest(request, path.join('/'));
}
export const GET = forward;
export const POST = forward;
