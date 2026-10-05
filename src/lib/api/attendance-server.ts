import { cookies } from 'next/headers';

export async function requestStudentAttendance(path: string, options?: RequestInit) {
  const token = (await cookies()).get('auth-token')?.value;
  if (!token) return Response.json({ message: 'Please sign in again' }, { status: 401 });
  const backend = process.env.BACKEND_URL;
  if (!backend) return Response.json({ message: 'Backend is not configured' }, { status: 503 });

  try {
    const response = await fetch(`${backend}/attendance/student${path}`, {
      ...options,
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const payload = await response.json().catch(() => null);
    if (!payload) {
      return Response.json({ message: response.status === 404
        ? 'Student attendance is not available on the backend yet. Deploy the attendance update.'
        : 'The attendance service returned an invalid response' }, { status: 502 });
    }
    if (!response.ok) {
      return Response.json({ message: payload.message || 'Attendance request failed' }, { status: response.status });
    }
    if (!Object.hasOwn(payload, 'data')) {
      return Response.json({ message: 'The attendance service returned invalid data' }, { status: 502 });
    }
    return Response.json(payload.data);
  } catch {
    return Response.json({ message: 'Unable to reach the attendance service. Please try again.' }, { status: 502 });
  }
}
