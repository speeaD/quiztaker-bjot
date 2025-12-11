'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  Trophy,
  Clock,
  AlertCircle,
  ArrowLeft,
  Award,
  Target,
} from 'lucide-react';

interface SubmissionAnswer {
  question: string;
  type: string;
  yourAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsAwarded: number;
  pointsPossible: number;
}

interface SubmissionData {
  id: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeTaken: number;
  submittedAt: string;
  status: string;
  feedback: string;
  answers: SubmissionAnswer[];
}

interface ResultsResponse {
  success: boolean;
  submission: SubmissionData;
}

const ResultsPageComponent = () => {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SubmissionData | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/quiztaker/submission/${submissionId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }

        const data: ResultsResponse = await response.json();
        setResults(data.submission);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchResults();
    }
  }, [submissionId]);

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    } else if (m > 0) {
      return `${m}m ${s}s`;
    }
    return `${s}s`;
  };

  const getGradeColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBgColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-50 border-green-200';
    if (percentage >= 80) return 'bg-blue-50 border-blue-200';
    if (percentage >= 70) return 'bg-yellow-50 border-yellow-200';
    if (percentage >= 60) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error || 'Failed to load results'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const correctAnswers = results.answers.filter(a => a.isCorrect).length;
  const percentage = results.percentage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
          <p className="text-sm text-gray-600">
            {results.status === 'pending-manual-grading' 
              ? 'Some questions require manual grading'
              : 'Your quiz has been graded'}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Card */}
        <div className={`bg-white rounded-xl shadow-lg border-2 p-8 mb-8 ${getGradeBgColor(percentage)}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold ${getGradeColor(percentage)} bg-white shadow-lg`}>
                {getGrade(percentage)}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{percentage}%</h2>
                <p className="text-gray-600">Your Score</p>
              </div>
            </div>
            <Trophy className={`${getGradeColor(percentage)}`} size={64} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-indigo-600" size={20} />
                <p className="text-sm text-gray-600">Score</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {results.score}/{results.totalPoints}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-600" size={20} />
                <p className="text-sm text-gray-600">Correct</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {correctAnswers}/{results.answers.length}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-blue-600" size={20} />
                <p className="text-sm text-gray-600">Time Spent</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {formatTime(results.timeTaken)}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Award className="text-purple-600" size={20} />
                <p className="text-sm text-gray-600">Status</p>
              </div>
              <p className="text-sm font-bold text-purple-600 capitalize">
                {results.status.replace('-', ' ')}
              </p>
            </div>
          </div>

          {results.feedback && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">Feedback:</p>
              <p className="text-blue-800">{results.feedback}</p>
            </div>
          )}
        </div>

        {/* Question Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Results</h2>
          {results.answers.map((result: SubmissionAnswer, index: number) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded">
                      Question {index + 1}
                    </span>
                    <span className="text-gray-600 text-sm">
                      {result.pointsPossible} {result.pointsPossible === 1 ? 'point' : 'points'}
                    </span>
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded">
                      {result.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {result.question}
                  </h3>
                </div>
                <div className="ml-4">
                  {result.isCorrect ? (
                    <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      <CheckCircle size={18} />
                      <span className="font-semibold">Correct</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full">
                      <XCircle size={18} />
                      <span className="font-semibold">Incorrect</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Display answers */}
              <div className="mt-4 space-y-3">
                <div className={`p-4 rounded-lg ${
                  result.isCorrect ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Your Answer:</p>
                  <p className="text-gray-900 font-medium">
                    {result.yourAnswer || 'No answer provided'}
                  </p>
                </div>
                {!result.isCorrect && result.correctAnswer && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-green-900 mb-1">
                      Correct Answer:
                    </p>
                    <p className="text-green-900 font-medium">{result.correctAnswer}</p>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Points Awarded: <span className="font-semibold">{result.pointsAwarded}/{result.pointsPossible}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.status === 'pending-manual-grading' && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="text-yellow-600 mx-auto mb-3" size={48} />
            <p className="text-yellow-800 font-semibold mb-2">
              Manual Grading Pending
            </p>
            <p className="text-yellow-700 text-sm">
              Some questions (like essays) require manual grading. Your final score may change once all questions are graded.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPageComponent;