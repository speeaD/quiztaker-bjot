'use client';

import DashboardHeader from '@/components/DashboardHeader';
import {AlertCircle, Award, Calendar, Clock, Loader2, Lock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { JSX, useEffect, useState } from 'react';


interface Submission {
  id: string;
  quizId?: string;
  quizTitle: string;
  score: number;
  totalPoints: number;
  percentage: number;
  completedAt: string;
  timeTaken?: number;
  examType?: 'single-subject' | 'multi-subject';
  questionSets?: Array<{
    title: string;
  }>;
}



const DashboardCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  locked = false,
  iconColor = "text-blue-500",
  link,
}: { 
  icon: JSX.Element; 
  title: string;
  subtitle: string; 
  locked?: boolean;
  iconColor?: string;
  link?: string;
}) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
    <Link href={locked ? "#" : link || "/cbt-simulator"} className="block">
    {locked && (
      <div className="absolute top-4 right-4">
        <Lock className="w-4 h-4 text-gray-300" />
      </div>
    )}
    <div className="flex items-start gap-4">
      <div className={`${iconColor} p-2`}>
        {Icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-lg mb-1">{title}</h3>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
    </div>
    </Link>
  </div>
);

const QuizTakerDashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const email = typeof window !== 'undefined' && localStorage.getItem('quizTakerEmail') 
    ? localStorage.getItem('quizTakerEmail') as string 
    : 'Guest';

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError('');


      // Fetch from Next.js API route
      const response = await fetch('/api/quiztaker/submission', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Fetched submissions data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch submissions');
      }

      if (data.success) {
        setSubmissions(data.submissions || []);
      } else {
        setError(data.message || 'No submission history found');
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(err instanceof Error ? err.message : 'Unable to load submission history');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleNavigation = (path: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  // Calculate statistics
  const totalExams = submissions.length;
  const averageScore = totalExams > 0 
    ? Math.round(submissions.reduce((sum, s) => sum + s.percentage, 0) / totalExams)
    : 0;
  const highestScore = totalExams > 0
    ? Math.max(...submissions.map(s => s.percentage))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6 py-8 px-6">
        {/* Header */}
        <DashboardHeader studentName={email} />

        {/* Statistics Cards */}
        {totalExams > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalExams}</p>
                  <p className="text-sm text-gray-600">Total Exams</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{highestScore}%</p>
                  <p className="text-sm text-gray-600">Highest Score</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="space-y-6">
          {/* Dashboard Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DashboardCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
              }
              title="CBT Simulator"
              subtitle="Full exam mode - 4 subjects"
              iconColor="text-blue-500"
              link ="/cbt-simulator"
            />
            <DashboardCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                </svg>
              }
              title="Study Hub"
              subtitle="Lecture & Video"
              locked={true}
              iconColor="text-green-500"
            />
            <DashboardCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
              }
              title="Subject Tests"
              subtitle="Single subject exam"
              iconColor="text-orange-500"
              link="/subject-test"
            />
            <DashboardCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" x2="10" y1="12" y2="12"></line>
                  <line x1="8" x2="8" y1="10" y2="14"></line>
                  <line x1="15" x2="15.01" y1="13" y2="13"></line>
                  <line x1="18" x2="18.01" y1="11" y2="11"></line>
                  <rect width="20" height="12" x="2" y="6" rx="2"></rect>
                </svg>
              }
              title="Game Hub"
              subtitle="Time Attack, Sudden Death & Wager"
              link="/game-hub"
              iconColor="text-red-500"
            />
          </div>

          {/* Recent History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900 text-lg">Recent History</h2>
              </div>
              {totalExams > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{totalExams} exam{totalExams !== 1 ? 's' : ''}</span>
                  <button 
                    onClick={fetchSubmissions}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <p className="text-gray-500 text-sm">Loading history...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-gray-700 font-medium text-sm mb-2">{error}</p>
                <p className="text-gray-400 text-xs mb-4">Make sure you&apos;re logged in to view your history</p>
                <button
                  onClick={fetchSubmissions}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm mb-2">No exam history yet</p>
                <p className="text-gray-400 text-xs mb-4">Take your first exam to see results here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.slice(0, 10).map((submission) => (
                  <div 
                    key={submission.id}
                    className="flex items-center justify-between bg-gray-50 px-6 py-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {submission.quizTitle}
                        </h3>
                        {submission.examType === 'multi-subject' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            Multi-Subject
                          </span>
                        )}
                        {submission.examType === 'single-subject' && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                            Single Subject
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(submission.completedAt)}
                        </span>
                        {submission.timeTaken && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(submission.timeTaken)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getPercentageColor(submission.percentage)}`}>
                        {submission.percentage}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.score}/{submission.totalPoints}
                      </div>
                    </div>
                  </div>
                ))}
                
                {submissions.length > 10 && (
                  <button className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View all {submissions.length} exams →
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizTakerDashboard;