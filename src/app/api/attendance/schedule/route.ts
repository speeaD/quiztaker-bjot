import { requestStudentAttendance } from '@/lib/api/attendance-server';

export async function GET() {
  return requestStudentAttendance('/schedule/weekly');
}
