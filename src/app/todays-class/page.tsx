import { serverApi } from '../../lib/api/attendance-client';
import TodaysClassesClient from './TodaysClasses';

export default async function StudentTodayPage() {
  const initialData = await serverApi.student.getTodaysClasses().catch(() => null);
  return <TodaysClassesClient initialClasses={initialData} initialError={null} />;
}
export const dynamic = 'force-dynamic';
