import { serverApi } from '../../lib/api/attendance-client';
import WeeklyScheduleClient from './WeeklySchedule';

export default async function StudentSchedulePage() {
  const initialSchedule = await serverApi.student.getWeeklySchedule().catch(() => null);
  return <WeeklyScheduleClient initialSchedule={initialSchedule || []} initialError={null} />;
}
export const dynamic = 'force-dynamic';
