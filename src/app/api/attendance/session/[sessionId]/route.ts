import { requestStudentAttendance } from '@/lib/api/attendance-server';

export async function POST(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return requestStudentAttendance(`/sessions/${encodeURIComponent(sessionId)}/mark`, { method: 'POST' });
}
