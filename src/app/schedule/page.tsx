/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverApi } from '../../lib/api/attendance-client';
import WeeklyScheduleClient from './WeeklySchedule';

export default async function StudentSchedulePage() {
    const initialSchedule = await serverApi.student.getWeeklySchedule().catch((err: any) => {
      console.error("Error fetching weekly schedule:", err);
      return null;
    });
    const error = null;

  return (
    <WeeklyScheduleClient 
      initialSchedule={initialSchedule || []}
      initialError={error}
    />
  );
}