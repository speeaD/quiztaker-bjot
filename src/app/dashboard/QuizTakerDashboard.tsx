'use client';

import DashboardHeader from '@/components/DashboardHeader';
import { AlertCircle, Award, Calendar, Clock, Loader2, Lock, TrendingUp, CheckCircle, PlayCircle, Eye, XCircle, ChevronDown, ChevronUp, History } from 'lucide-react';
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
  attemptNumber?: number;
  questionSets?: Array<{
    title: string;
  }>;
}

interface AssignedQuiz {
  _id: string;
  quizId: {
    _id: string;
    settings: {
      title: string;
      description?: string;
      multipleAttempts?: boolean;
      duration?: {
        hours: number;
        minutes: number;
        seconds: number;
      };
    };
  };
  status: 'pending' | 'in-progress' | 'completed';
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  attemptCount?: number;
  submissionId?: {
    _id: string;
    score: number;
    totalPoints: number;
    percentage: number;
  };
  allSubmissions?: Array<{
    _id: string;
    score: number;
    totalPoints: number;
    percentage: number;
    completedAt: string;
    attemptNumber: number;
  }>;
}

interface QuizTakerProfile {
  id: string;
  email: string;
  accessCode?: string;
  accountType: 'premium' | 'regular';
  assignedQuizzes: AssignedQuiz[];
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
  <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
    <Link href={locked ? "#" : link || "/cbt-simulator"} className="block">
      {locked && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300" />
        </div>
      )}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`${iconColor} p-1.5 sm:p-2`}>
          {Icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-lg mb-0.5 sm:mb-1 truncate">{title}</h3>
          <p className="text-gray-500 text-xs sm:text-sm line-clamp-2">{subtitle}</p>
        </div>
      </div>
    </Link>
  </div>
);

const QuizTakerDashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignedQuizzes, setAssignedQuizzes] = useState<AssignedQuiz[]>([]);
  const [profile, setProfile] = useState<QuizTakerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignedLoading, setAssignedLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignedError, setAssignedError] = useState('');
  const [submitNotification, setSubmitNotification] = useState<string | null>(null);
  const [expandedQuizzes, setExpandedQuizzes] = useState<Set<string>>(new Set());
  const [assignedFilter, setAssignedFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [showAllAssigned, setShowAllAssigned] = useState(false);
  
  const email = typeof window !== 'undefined' && localStorage.getItem('quizTakerEmail') 
    ? localStorage.getItem('quizTakerEmail') as string 
    : 'Guest';

  useEffect(() => {
    fetchSubmissions();
    fetchAssignedQuizzes();
    
    // Check for quiz submit notification
    if (typeof window !== 'undefined') {
      const reason = sessionStorage.getItem('quizSubmitReason');
      if (reason) {
        setSubmitNotification(reason);
        sessionStorage.removeItem('quizSubmitReason');
        // Auto-hide after 10 seconds
        setTimeout(() => setSubmitNotification(null), 10000);
      }
    }
  }, []);

  const fetchAssignedQuizzes = async () => {
    try {
      setAssignedLoading(true);
      setAssignedError('');

      const response = await fetch('/api/quiztaker/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch assigned quizzes');
      }

      if (data.success && data.quizTaker) {
        console.log(data.quizTaker);
        setProfile(data.quizTaker);
        setAssignedQuizzes(data.quizTaker.assignedQuizzes || []);
      }
    } catch (err) {
      console.error('Error fetching assigned quizzes:', err);
      setAssignedError(err instanceof Error ? err.message : 'Unable to load assigned quizzes');
    } finally {
      setAssignedLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/quiztaker/submission', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
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

  const formatDuration = (duration?: { hours: number; minutes: number; seconds: number }) => {
    if (!duration) return 'N/A';
    const { hours, minutes } = duration;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Completed</span>;
      case 'in-progress':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">In Progress</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">Not Started</span>;
      default:
        return null;
    }
  };

  const handleTakeQuiz = (quizId: string, status: string) => {
    if (typeof window !== 'undefined') {
      if (status === 'pending' || status === 'completed') {
        window.location.href = `/assigned-quiz/${quizId}`;
      } else if (status === 'in-progress') {
        window.location.href = `/assigned-quiz/${quizId}`;
      }
    }
  };

  const handleViewResults = (submissionId: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/results/${submissionId}`;
    }
  };

  const toggleQuizExpanded = (quizId: string) => {
    const newExpanded = new Set(expandedQuizzes);
    if (newExpanded.has(quizId)) {
      newExpanded.delete(quizId);
    } else {
      newExpanded.add(quizId);
    }
    setExpandedQuizzes(newExpanded);
  };

  interface AttemptSummary {
    id: string;
    score: number;
    totalPoints: number;
    percentage: number;
    completedAt?: string;
    attemptNumber?: number;
  }

  const getAttempts = (quiz: AssignedQuiz): AttemptSummary[] => {
    if (quiz.allSubmissions && quiz.allSubmissions.length > 0) {
      return [...quiz.allSubmissions]
        .sort((a, b) => b.attemptNumber - a.attemptNumber)
        .map((s) => ({
          id: s._id,
          score: s.score,
          totalPoints: s.totalPoints,
          percentage: s.percentage,
          completedAt: s.completedAt,
          attemptNumber: s.attemptNumber,
        }));
    }
    if (quiz.submissionId) {
      return [{
        id: quiz.submissionId._id,
        score: quiz.submissionId.score,
        totalPoints: quiz.submissionId.totalPoints,
        percentage: quiz.submissionId.percentage,
      }];
    }
    return [];
  };

  const getBestAttempt = (quiz: AssignedQuiz): AttemptSummary | undefined => {
    const attempts = getAttempts(quiz);
    if (attempts.length === 0) return undefined;
    return attempts.reduce((best, current) => (current.percentage > best.percentage ? current : best));
  };

  // Calculate statistics
  const totalExams = submissions.length;
  const averageScore = totalExams > 0 
    ? Math.round(submissions.reduce((sum, s) => sum + s.percentage, 0) / totalExams)
    : 0;
  const highestScore = totalExams > 0
    ? Math.max(...submissions.map(s => s.percentage))
    : 0;

  // Assigned quiz statistics
  const pendingQuizzes = assignedQuizzes.filter(q => q.status === 'pending').length;
  const inProgressQuizzes = assignedQuizzes.filter(q => q.status === 'in-progress').length;
  const completedQuizzes = assignedQuizzes.filter(q => q.status === 'completed').length;

  // Surface exams that still need action before ones already completed, so
  // a long history of completed exams doesn't bury what's outstanding.
  const ASSIGNED_STATUS_PRIORITY: Record<AssignedQuiz['status'], number> = {
    'in-progress': 0,
    pending: 1,
    completed: 2,
  };
  const sortedAssignedQuizzes = [...assignedQuizzes].sort((a, b) => {
    const priorityDiff = ASSIGNED_STATUS_PRIORITY[a.status] - ASSIGNED_STATUS_PRIORITY[b.status];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime();
  });

  const assignedFilterTabs: { id: typeof assignedFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: assignedQuizzes.length },
    { id: 'pending', label: 'Pending', count: pendingQuizzes },
    { id: 'in-progress', label: 'In Progress', count: inProgressQuizzes },
    { id: 'completed', label: 'Completed', count: completedQuizzes },
  ];

  const filteredAssignedQuizzes = assignedFilter === 'all'
    ? sortedAssignedQuizzes
    : sortedAssignedQuizzes.filter(q => q.status === assignedFilter);

  // Cap what renders by default. This is the actual fix for the section
  // growing tall enough to push the rest of the dashboard out of view.
  const ASSIGNED_VISIBLE_LIMIT = 1;
  const visibleAssignedQuizzes = showAllAssigned
    ? filteredAssignedQuizzes
    : filteredAssignedQuizzes.slice(0, ASSIGNED_VISIBLE_LIMIT);
  const hiddenAssignedCount = filteredAssignedQuizzes.length - visibleAssignedQuizzes.length;

  const handleAssignedFilterChange = (filter: typeof assignedFilter) => {
    setAssignedFilter(filter);
    setShowAllAssigned(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 py-4 sm:py-8 px-4 sm:px-6">
        {/* Header */}
        <DashboardHeader studentName={email} />

        {/* Auto-Submit Notification */}
        {submitNotification && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800 mb-1">Quiz Auto-Submitted</h3>
                <p className="text-sm text-orange-700">{submitNotification}</p>
              </div>
              <button
                onClick={() => setSubmitNotification(null)}
                className="text-orange-600 hover:text-orange-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {totalExams > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalExams}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Total Exams</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{averageScore}%</p>
                  <p className="text-xs sm:text-sm text-gray-600">Average Score</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{highestScore}%</p>
                  <p className="text-xs sm:text-sm text-gray-600">Highest Score</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assigned Quizzes Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900 text-base sm:text-lg">Assigned Exams</h2>
          </div>

          {assignedQuizzes.length > 0 && (
            <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 overflow-x-auto pb-0.5 -mx-1 px-1">
              {assignedFilterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleAssignedFilterChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                    assignedFilter === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full ${
                      assignedFilter === tab.id ? 'bg-white/20' : 'bg-white text-gray-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {assignedLoading ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-spin mb-2 sm:mb-3" />
              <p className="text-gray-500 text-xs sm:text-sm">Loading assigned exams...</p>
            </div>
          ) : assignedError ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
              </div>
              <p className="text-gray-700 font-medium text-xs sm:text-sm mb-2">{assignedError}</p>
              <button
                onClick={fetchAssignedQuizzes}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : assignedQuizzes.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2">No assigned exams</p>
              <p className="text-gray-400 text-xs">Your instructor hasn&apos;t assigned any exams yet</p>
            </div>
          ) : filteredAssignedQuizzes.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500 text-xs sm:text-sm">
                No {assignedFilter.replace('-', ' ')} exams right now.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2 sm:space-y-3">
                {visibleAssignedQuizzes.map((quiz) => {
                  const attempts = getAttempts(quiz);
                  const bestAttempt = getBestAttempt(quiz);
                  const hasMultipleAttempts = attempts.length > 1;
                  const isExpanded = expandedQuizzes.has(quiz._id);
                  const statusAccent =
                    quiz.status === 'in-progress'
                      ? 'border-l-blue-500'
                      : quiz.status === 'completed'
                      ? 'border-l-emerald-500'
                      : 'border-l-gray-300';

                  return (
                    <div
                      key={quiz._id}
                      className={`bg-gray-50 rounded-lg border border-gray-100 border-l-4 ${statusAccent} hover:border-gray-200 transition-colors overflow-hidden`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:px-5 sm:py-4 gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                              {quiz.quizId.settings?.title || 'Untitled Quiz'}
                            </h3>
                            {getStatusBadge(quiz.status)}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Assigned: {formatDate(quiz.assignedAt)}
                            </span>
                            {quiz.quizId.settings?.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(quiz.quizId.settings?.duration)}
                              </span>
                            )}
                          </div>
                          {quiz.status === 'completed' && bestAttempt && (
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                              <span className={`text-xs sm:text-sm font-semibold ${getPercentageColor(bestAttempt.percentage)}`}>
                                {hasMultipleAttempts ? 'Best score' : 'Score'}: {bestAttempt.percentage}%
                              </span>
                              <span className="text-xs sm:text-sm text-gray-500">
                                ({Math.round((bestAttempt.score / bestAttempt.totalPoints) * 400)}) / 400
                              </span>
                              {hasMultipleAttempts && (
                                <button
                                  onClick={() => toggleQuizExpanded(quiz._id)}
                                  className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 font-medium"
                                >
                                  <History className="w-3 h-3" />
                                  {attempts.length} attempts
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 sm:flex-shrink-0">
                          {quiz.status === 'completed' && quiz.submissionId ? (
                            <button
                              onClick={() => handleViewResults(quiz.submissionId!._id)}
                              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              View Results
                            </button>
                          ) : (
                            <button
                              onClick={() => handleTakeQuiz(quiz.quizId._id, quiz.status)}
                              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white text-xs sm:text-sm rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                            >
                              <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              {quiz.status === 'in-progress' ? 'Continue' : 'Start Exam'}
                            </button>
                          )}
                        </div>
                      </div>

                      {hasMultipleAttempts && isExpanded && (
                        <div className="border-t border-gray-100 bg-white px-3 sm:px-5 py-2 sm:py-3 space-y-1.5">
                          {attempts.map((attempt) => (
                            <div
                              key={attempt.id}
                              className="flex items-center justify-between text-xs sm:text-sm"
                            >
                              <span className="text-gray-500">
                                Attempt {attempt.attemptNumber ?? '—'}
                                {attempt.completedAt && ` · ${formatDate(attempt.completedAt)}`}
                              </span>
                              <span className={`font-semibold ${getPercentageColor(attempt.percentage)}`}>
                                {attempt.percentage}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {(hiddenAssignedCount > 0 || showAllAssigned) && filteredAssignedQuizzes.length > ASSIGNED_VISIBLE_LIMIT && (
                <button
                  onClick={() => setShowAllAssigned((prev) => !prev)}
                  className="w-full flex items-center justify-center gap-1 mt-3 py-2 sm:py-3 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showAllAssigned ? (
                    <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
                  ) : (
                    <>Show {hiddenAssignedCount} more <ChevronDown className="w-3.5 h-3.5" /></>
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* Main Content */}
        <main className="space-y-4 sm:space-y-6">
          {/* Dashboard Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              link="/cbt-simulator"
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
            <DashboardCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" x2="12" y1="2" y2="6"></line>
                  <line x1="12" x2="12" y1="18" y2="22"></line>
                  <line x1="4.93" x2="7.76" y1="4.93" y2="7.76"></line>
                  <line x1="16.24" x2="19.07" y1="16.24" y2="19.07"></line>
                  <line x1="2" x2="6" y1="12" y2="12"></line>
                  <line x1="18" x2="22" y1="12" y2="12"></line>
                  <line x1="4.93" x2="7.76" y1="19.07" y2="16.24"></line> 
                  <line x1="16.24" x2="19.07" y1="7.76" y2="4.93"></line>
                </svg>
              }
              title="Attendance"
              subtitle="Mark your attendance"
              iconColor="text-orange-500"
              link="/todays-class"
            />
            <DashboardCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              }
              title="Class Schedule"
              subtitle="View your class schedule"
              link="/schedule"
              iconColor="text-red-500"
            />
          </div>

          {/* Recent History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900 text-base sm:text-lg">Recent History</h2>
              </div>
              {totalExams > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm text-gray-500">{totalExams} exam{totalExams !== 1 ? 's' : ''}</span>
                  <button 
                    onClick={fetchSubmissions}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-spin mb-2 sm:mb-3" />
                <p className="text-gray-500 text-xs sm:text-sm">Loading history...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
                </div>
                <p className="text-gray-700 font-medium text-xs sm:text-sm mb-2">{error}</p>
                <p className="text-gray-400 text-xs mb-3 sm:mb-4">Make sure you&apos;re logged in to view your history</p>
                <button
                  onClick={fetchSubmissions}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2">No exam history yet</p>
                <p className="text-gray-400 text-xs mb-3 sm:mb-4">Take your first exam to see results here</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {submissions.slice(0, 10).map((submission) => (
                  <div 
                    key={submission.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-4 sm:px-6 sm:py-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors gap-3 sm:gap-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {submission.quizTitle}
                        </h3>
                        {submission.examType === 'multi-subject' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded whitespace-nowrap">
                            Multi-Subject
                          </span>
                        )}
                        {submission.examType === 'single-subject' && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded whitespace-nowrap">
                            Single Subject
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
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
                    <div className="text-left sm:text-right">
                      <div className={`text-base sm:text-lg font-bold ${getPercentageColor(submission.percentage)}`}>
                        {submission.percentage}%
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {submission.score}/{submission.totalPoints}
                      </div>
                    </div>
                  </div>
                ))}
                
                {submissions.length > 10 && (
                  <button className="w-full py-2 sm:py-3 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium">
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