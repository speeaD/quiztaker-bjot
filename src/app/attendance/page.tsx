import { serverApi } from '../../lib/api/attendance-client';
import AttendanceHistoryClient from './AttendanceClient';

export default async function StudentHistoryPage() {
  const initialData = await serverApi.student.getAttendanceHistory().catch(() => null);
  return <AttendanceHistoryClient
    initialRecords={initialData?.records || []}
    initialStatistics={initialData?.statistics || { totalClasses: 0, present: 0, attendancePercentage: '0' }}
    initialPagination={initialData?.pagination || { total: 0, limit: 20, skip: 0 }}
    initialError={null}
  />;
}
export const dynamic = 'force-dynamic';
