/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverApi } from '../../lib/api/attendance-client';
import WeeklyScheduleClient from './WeeklySchedule';

export async function getData() {
  const initialSchedule = await serverApi.student.getWeeklySchedule().catch((err: any) => {
    console.error("Error fetching weekly schedule:", err);
    return null;
  });
  const error = null;
  // console.log("Initial data for today's classes:", initialData);

  return {
    props: {
      initialSchedule,
      error,
    },
  };
}

export default async function StudentSchedulePage({ initialSchedule, error }: { initialSchedule: any; error: any }) {

  return (
    <WeeklyScheduleClient
      initialSchedule={initialSchedule || []}
      initialError={error}
    />
  );
}