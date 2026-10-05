import { requestStudentAttendance } from '@/lib/api/attendance-server';
import type { SessionWithAttendanceStatus } from '@/types/global';
import TodaysClassesClient from './TodaysClasses';

export default async function StudentTodayPage() {
  const response = await requestStudentAttendance('/classes/today');
  const payload = await response.json();
  const valid = response.ok && Array.isArray(payload.classes);
  return <TodaysClassesClient
    initialClasses={valid ? payload.classes as SessionWithAttendanceStatus[] : []}
    initialError={valid ? null : payload.message || "Unable to load today's classes"}
  />;
}
