import { requestStudentAttendance } from '@/lib/api/attendance-server';
import type { ClassSession } from '@/types/global';
import WeeklyScheduleClient from './WeeklySchedule';

export default async function StudentSchedulePage() {
  const response = await requestStudentAttendance('/schedule/weekly');
  const payload = await response.json();
  const valid = response.ok && Array.isArray(payload);
  return <WeeklyScheduleClient
    initialSchedule={valid ? payload as ClassSession[] : []}
    initialError={valid ? null : payload.message || 'Unable to load weekly schedule'}
  />;
}
