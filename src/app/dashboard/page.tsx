import QuizTakerDashboard from '@/components/QuizTakerDashboard';
import { getDashboardData } from '@/lib/data';

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();
  console.log('Dashboard Data in Page:', dashboardData);
  return <QuizTakerDashboard />;
}