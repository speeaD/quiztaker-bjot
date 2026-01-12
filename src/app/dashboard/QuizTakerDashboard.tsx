/* eslint-disable @typescript-eslint/no-explicit-any */
import DashboardHeader from '@/components/DashboardHeader';
import { Target, BookOpen, FileText, ListChecks, Gamepad2, Clock, Lock, Moon } from 'lucide-react';

const DashboardCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  locked = false,
  iconColor = "text-blue-500"
}: { 
  icon: any; 
  title: string; 
  subtitle: string; 
  locked?: boolean;
  iconColor?: string;
}) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
    {locked && (
      <div className="absolute top-4 right-4">
        <Lock className="w-4 h-4 text-gray-300" />
      </div>
    )}
    <div className="flex items-start gap-4">
      <div className={`${iconColor} p-2`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-lg mb-1">{title}</h3>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
    </div>
  </div>
);

const QuizTakerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6 py-8">
      {/* Header */}
      <DashboardHeader studentName="Guest" />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-4">
        {/* Trial Banner */}
        {/* <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-6 mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-1">FREE TRIAL MODE</h2>
            <p className="text-gray-800 text-sm">Restricted Access. Upgrade to unlock all features.</p>
          </div>
          <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
            GET FULL ACCESS
          </button>
        </div> */}

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <DashboardCard
            icon={Target}
            title="CBT Simulator"
            subtitle="Full exam mode."
            iconColor="text-blue-500"
          />
          <DashboardCard
            icon={BookOpen}
            title="Study Hub"
            subtitle="Lecture & Video."
            locked={true}
            iconColor="text-green-500"
          />
          <DashboardCard
            icon={FileText}
            title="Topic Tests"
            subtitle="Specific topics."
            locked={true}
            iconColor="text-purple-500"
          />
          <DashboardCard
            icon={ListChecks}
            title="Subject Tests"
            subtitle="Single subject."
            locked={true}
            iconColor="text-orange-500"
          />
          <DashboardCard
            icon={Gamepad2}
            title="Game Hub"
            subtitle="Time Attack, Sudden Death & Wager."
            locked={true}
            iconColor="text-red-500"
          />
        </div>

        {/* Recent History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900 text-lg">Recent History</h2>
          </div>
          
          <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
            <div>
              <h3 className="font-semibold text-gray-900">SIM</h3>
              <p className="text-sm text-gray-500">1/12/2026</p>
            </div>
            <div className="text-right">
              <p className="text-red-500 font-bold text-lg">0/20</p>
              <p className="text-sm text-gray-500">0%</p>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};

export default QuizTakerDashboard;