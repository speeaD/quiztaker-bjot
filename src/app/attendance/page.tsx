/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverApi } from '../../lib/api/attendance-client';
import AttendanceHistoryClient from './AttendanceClient';

export async function getData() {
  const  initialData = await serverApi.student.getAttendanceHistory().catch((err: any) => {
    console.error('Failed to fetch attendance history:', err);
    return null;
  }); 
  const  error = null;
  return {
    props: {
      initialData,
      error,
    },
  };
}

export default async function StudentHistoryPage({ initialData, error }: { initialData: any; error: any }) {
  

  // }

  return (
    <AttendanceHistoryClient 
      initialRecords={initialData?.records || []}
      initialStatistics={initialData?.statistics || {
        totalClasses: 0,
        present: 0,
        attendancePercentage: '0',
      }}
      initialPagination={initialData?.pagination || {
        total: 0,
        limit: 20,
        skip: 0,
      }}
      initialError={error}
    />
  );
}