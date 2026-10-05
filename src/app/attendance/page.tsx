import { requestStudentAttendance } from '@/lib/api/attendance-server';
import type { StudentAttendanceHistory } from '@/types/global';
import AttendanceHistoryClient from './AttendanceClient';

export default async function StudentHistoryPage() {
  const response = await requestStudentAttendance('/attendance/history?limit=20&skip=0');
  const payload = await response.json();
  const valid = response.ok && Array.isArray(payload.records);
  const data = valid ? payload as StudentAttendanceHistory : null;
  return <AttendanceHistoryClient
    initialRecords={data?.records || []}
    initialStatistics={data?.statistics || { totalClasses: 0, present: 0, attendancePercentage: '0' }}
    initialPagination={data?.pagination || { total: 0, limit: 20, skip: 0 }}
    initialError={valid ? null : payload.message || 'Unable to load attendance history'}
  />;
}
