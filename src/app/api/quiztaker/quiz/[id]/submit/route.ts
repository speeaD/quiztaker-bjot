import { NextRequest, NextResponse } from 'next/server';
import { forwardAssignedQuizSubmission } from '@/lib/assigned-quiz-submission';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('auth-token')?.value;
  const headers = { 'Cache-Control': 'private, no-store' };
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid submission request' }, { status: 400, headers }); }
  const { id } = await params;
  const result = await forwardAssignedQuizSubmission(process.env.BACKEND_URL, token, id, body);
  return NextResponse.json(result.data, { status: result.status, headers });
}
