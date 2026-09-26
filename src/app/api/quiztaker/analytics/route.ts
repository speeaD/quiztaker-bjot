import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const token = (await cookies()).get('auth-token')?.value;
  if (!token) return NextResponse.json({ message: 'Please sign in' }, { status: 401 });
  if (!process.env.BACKEND_URL) return NextResponse.json({ message: 'Analytics service is not configured' }, { status: 503 });
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/quiztaker/analytics`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    return new NextResponse(await response.text(), { status: response.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ message: 'Analytics service is unavailable' }, { status: 502 });
  }
}
