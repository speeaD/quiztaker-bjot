import { requestStudentAttendance } from '@/lib/api/attendance-server';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const limit = Math.min(100, Math.max(1, Number.parseInt(params.get('limit') || '20', 10) || 20));
  const skip = Math.max(0, Number.parseInt(params.get('skip') || '0', 10) || 0);
  return requestStudentAttendance(`/attendance/history?limit=${limit}&skip=${skip}`);
}
