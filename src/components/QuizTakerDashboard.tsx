'use client'

import React, { useState, JSX, useEffect } from 'react';
import { Clock, Trophy, BookOpen, CheckCircle, XCircle, AlertCircle, LogOut, User, Calendar, Award, RefreshCw } from 'lucide-react';
import type {
  DashboardResponse,
  DashboardStats,
  AssignedQuiz,
  QuizStatus,
  Duration,
  TabKey,
  Tab,
  StatusConfig
} from '../types/global';

const QuizTakerDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/quiztaker/dashboard', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      console.log('Fetch dashboard response status:', response.status); 

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.quizTaker) {
        setDashboardData(data);
      } else {
        throw new Error('Invalid dashboard data received');
      }
      
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboard()
  }, []);

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      window.location.href = '/login';
    }
  };

  const startQuiz = async (quizId: string): Promise<void> => {
    if (!dashboardData?.quizTaker.id) {
      alert('Unable to start quiz. Quiz taker information not found.');
      return;
    }

    try {
      const response = await fetch(`/api/quiztaker/quiz/${quizId}/start`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizTaker: dashboardData.quizTaker.id,
        }),
      });
      console.log('Start quiz response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start quiz');
      }

      // Redirect to quiz page
      window.location.href = `/take-quiz/${quizId}`;
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert(error instanceof Error ? error.message : 'Failed to start quiz. Please try again.');
    }
  };

  const viewResults = (submissionId: string): void => {
    window.location.href = `/results/${submissionId}`;
  };

  const formatDuration = (duration: Duration): string => {
    const parts: string[] = [];
    if (duration.hours > 0) parts.push(`${duration.hours}h`);
    if (duration.minutes > 0) parts.push(`${duration.minutes}m`);
    if (duration.seconds > 0) parts.push(`${duration.seconds}s`);
    return parts.join(' ');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (status: QuizStatus): JSX.Element => {
    const statusConfig: Record<QuizStatus, StatusConfig> = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: AlertCircle,
        text: 'Not Started' 
      },
      'in-progress': { 
        color: 'bg-blue-100 text-blue-800', 
        icon: Clock,
        text: 'In Progress' 
      },
      completed: { 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle,
        text: 'Completed' 
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={14} />
        {config.text}
      </span>
    );
  };

  const filterQuizzes = (quizzes: AssignedQuiz[]): AssignedQuiz[] => {
    if (activeTab === 'all') return quizzes;
    return quizzes.filter(q => q.status === activeTab);
  };

  const getStats = (): DashboardStats => {
    if (!dashboardData) {
      return { total: 0, pending: 0, inProgress: 0, completed: 0, avgScore: 0 };
    }

    const quizzes = dashboardData.quizTaker.assignedQuizzes;
    const completed = quizzes.filter(q => q.status === 'completed');
    const avgScore = completed.length > 0
      ? Math.round(completed.reduce((sum, q) => sum + (q.submissionId?.percentage || 0), 0) / completed.length)
      : 0;

    return {
      total: quizzes.length,
      pending: quizzes.filter(q => q.status === 'pending').length,
      inProgress: quizzes.filter(q => q.status === 'in-progress').length,
      completed: completed.length,
      avgScore,
    };
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Failed to load dashboard</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard</p>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const { quizTaker } = dashboardData;

  const tabs: Tab[] = [
    { key: 'all', label: 'All Quizzes', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'in-progress', label: 'In Progress', count: stats.inProgress },
    { key: 'completed', label: 'Completed', count: stats.completed },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                {quizTaker.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quiz Dashboard</h1>
                <p className="text-sm text-gray-600">{quizTaker.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                title="Refresh dashboard"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Quizzes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <BookOpen className="text-indigo-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="text-yellow-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-100 mb-1">Avg Score</p>
                <p className="text-3xl font-bold">{stats.avgScore}%</p>
              </div>
              <Trophy size={32} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                    activeTab === tab.key
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Quiz List */}
          <div className="p-6">
            {filterQuizzes(quizTaker.assignedQuizzes).length === 0 ? (
              <div className="text-center py-12">
                <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No quizzes found in this category</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filterQuizzes(quizTaker.assignedQuizzes).map(quiz => (
                  <div
                    key={quiz._id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-indigo-300 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {quiz.quizId.settings.title}
                          </h3>
                          {quiz.quizId.settings.isQuizChallenge && (
                            <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">
                              Challenge
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {quiz.quizId.settings.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            Duration: {formatDuration(quiz.quizId.settings.duration)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            Assigned: {formatDate(quiz.assignedAt)}
                          </div>
                          {quiz.completedAt && (
                            <div className="flex items-center gap-1">
                              <CheckCircle size={16} />
                              Completed: {formatDate(quiz.completedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(quiz.status)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {quiz.status === 'pending' && (
                        <button
                          onClick={() => startQuiz(quiz.quizId._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                          <BookOpen size={18} />
                          Start Quiz
                        </button>
                      )}

                      {quiz.status === 'in-progress' && (
                        <button
                          onClick={() => window.location.href = `/take-quiz/${quiz.quizId._id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          <Clock size={18} />
                          Continue Quiz
                        </button>
                      )}

                      {quiz.status === 'completed' && quiz.submissionId && (
                        <>
                          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-800 rounded-lg border border-green-200">
                            <Award size={18} />
                            <span className="font-semibold">
                              Score: {quiz.submissionId.score}/{quiz.submissionId.totalPoints}
                            </span>
                            <span className="text-sm">({quiz.submissionId.percentage}%)</span>
                          </div>
                          <button
                            onClick={() => viewResults(quiz.submissionId!._id)}
                            className="px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium"
                          >
                            View Results
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={20} />
            Profile Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{quizTaker.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Access Code</p>
              <p className="font-medium text-gray-900 font-mono">{quizTaker.accessCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-medium text-gray-900">{formatDate(quizTaker.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTakerDashboard;