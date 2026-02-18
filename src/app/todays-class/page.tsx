/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverApi } from '../../lib/api/attendance-client';
import TodaysClassesClient from './TodaysClasses';

export async function getData() {
  const initialData = await serverApi.student.getTodaysClasses().catch((err: any) => {
        console.error("Error fetching today's classes:", err);
        return null;
    });
    const error = null;
    // console.log("Initial data for today's classes:", initialData);

    return {
      props: {
        initialData,
        error,
      },
    };
}

export default async function StudentTodayPage({ initialData, error }: { initialData: any; error: any }) {

  return (
    <TodaysClassesClient 
      initialClasses={initialData}
      initialError={error}
    />
  );
}