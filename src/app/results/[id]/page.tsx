'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle, XCircle, Clock, Award, Home, ChevronDown, ChevronUp, MinusCircle } from 'lucide-react';

const API_BASE_URL = '/api/quiztaker';

interface Answer {
  question: string;
  type: string;
  yourAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean | null;
  pointsAwarded: number;
  pointsPossible: number;
  wasAnswered: boolean; // NEW: Flag to indicate if question was answered
}

interface QuestionSetAnswers {
  questionSetTitle: string;
  order: number;
  answers: Answer[];
}

interface Submission {
  id: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeTaken: number;
  submittedAt: string;
  status: string;
  feedback?: string;
  answersByQuestionSet?: QuestionSetAnswers[];
}

const ResultsPage = () => {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSets, setExpandedSets] = useState<number[]>([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/submission/${submissionId}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setSubmission(data.submission);
      // Expand all sets by default
      if (data.submission.answersByQuestionSet) {
        setExpandedSets(data.submission.answersByQuestionSet.map((qs: QuestionSetAnswers) => qs.order));
      }
    } catch (err) {
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const toggleSet = (order: number) => {
    if (expandedSets.includes(order)) {
      setExpandedSets(expandedSets.filter(o => o !== order));
    } else {
      setExpandedSets([...expandedSets, order]);
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 70) return 'green';
    if (percentage >= 50) return 'yellow';
    return 'red';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'auto-graded':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Auto Graded</span>;
      case 'pending-manual-grading':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">Pending Review</span>;
      case 'graded':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">Graded</span>;
      default:
        return null;
    }
  };

  // Calculate statistics for a question set
  const getQuestionSetStats = (questionSet: QuestionSetAnswers) => {
    const answeredQuestions = questionSet.answers.filter(a => a.wasAnswered);
    const correctAnswers = questionSet.answers.filter(a => a.isCorrect === true);
    const unansweredCount = questionSet.answers.filter(a => !a.wasAnswered).length;
    const totalQuestions = questionSet.answers.length;
    
    const setPercentage = totalQuestions > 0 
      ? Math.round((correctAnswers.length / totalQuestions) * 100) 
      : 0;

    return {
      answeredCount: answeredQuestions.length,
      correctCount: correctAnswers.length,
      unansweredCount,
      totalQuestions,
      percentage: setPercentage,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Results</h2>
          <p className="text-gray-600 mb-6">{error || 'Something went wrong'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(submission.percentage);
  const scaledScore = submission.totalPoints > 0
    ? Math.round((submission.score / submission.totalPoints) * 400)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-lg">B</span>
            </div>
            <span className="font-semibold text-sm sm:text-base">Exam Results</span>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
          >
            <Home className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Score Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center border border-gray-200">
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto flex items-center justify-center mb-4 sm:mb-6 ${
            statusColor === 'green' ? 'bg-green-100' : statusColor === 'yellow' ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <span className={`text-2xl sm:text-3xl font-bold ${
              statusColor === 'green' ? 'text-green-600' : statusColor === 'yellow' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {submission.percentage}%
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Exam Completed!</h1>
          <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
            {getStatusBadge(submission.status)}
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-5 h-5 text-blue-600" />
                <div className="text-2xl font-bold text-gray-900">{scaledScore}</div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Score (out of 400)</div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="text-2xl font-bold text-gray-900">
                  {submission.score}/{submission.totalPoints}
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Actual Points</div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <div className="text-2xl font-bold text-gray-900">{formatTime(submission.timeTaken)}</div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Time Taken</div>
            </div>
          </div>

          {/* Feedback */}
          {submission.feedback && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Instructor Feedback</h3>
              <p className="text-gray-700 text-sm">{submission.feedback}</p>
            </div>
          )}
        </div>

        {/* Detailed Answers by Question Set */}
        {submission.answersByQuestionSet && submission.answersByQuestionSet.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Detailed Review</h2>
              <p className="text-sm text-gray-600 mt-1">Review your answers for each subject</p>
            </div>

            <div className="divide-y divide-gray-200">
              {submission.answersByQuestionSet.map((questionSet) => {
                const isExpanded = expandedSets.includes(questionSet.order);
                const stats = getQuestionSetStats(questionSet);

                return (
                  <div key={questionSet.order} className="bg-white">
                    {/* Question Set Header */}
                    <button
                      onClick={() => toggleSet(questionSet.order)}
                      className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                          {questionSet.questionSetTitle}
                        </h3>
                        <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-600">
                          <span>{stats.correctCount}/{stats.totalQuestions} correct</span>
                          {stats.unansweredCount > 0 && (
                            <span className="text-orange-600 font-medium">
                              {stats.unansweredCount} unanswered
                            </span>
                          )}
                          <span className={`font-semibold ${
                            stats.percentage >= 70 ? 'text-green-600' :
                            stats.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {stats.percentage}%
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Question Set Answers */}
                    {isExpanded && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 bg-gray-50">
                        {questionSet.answers.map((answer, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg border-2 ${
                              !answer.wasAnswered
                                ? 'bg-orange-50 border-orange-200'
                                : answer.isCorrect === true
                                ? 'bg-green-50 border-green-200'
                                : answer.isCorrect === false
                                ? 'bg-red-50 border-red-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            {/* Question Number and Status */}
                            <div className="flex items-start justify-between mb-3">
                              <span className="text-xs sm:text-sm font-semibold text-gray-500">
                                Question {idx + 1}
                              </span>
                              {!answer.wasAnswered ? (
                                <div className="flex items-center gap-1 text-orange-600">
                                  <MinusCircle className="w-4 h-4" />
                                  <span className="text-xs font-medium">Not Answered</span>
                                </div>
                              ) : answer.isCorrect === true ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-xs font-medium">Correct</span>
                                </div>
                              ) : answer.isCorrect === false ? (
                                <div className="flex items-center gap-1 text-red-600">
                                  <XCircle className="w-4 h-4" />
                                  <span className="text-xs font-medium">Incorrect</span>
                                </div>
                              ) : (
                                <span className="text-xs font-medium text-gray-500">Pending Review</span>
                              )}
                            </div>

                            {/* Question Text */}
                            <p className="text-sm sm:text-base text-gray-900 mb-3 font-medium">
                              {answer.question}
                            </p>

                            {/* Your Answer */}
                            <div className="mb-2">
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Your Answer:
                              </span>
                              <p className={`mt-1 text-sm sm:text-base ${
                                !answer.wasAnswered 
                                  ? 'text-orange-700 italic' 
                                  : answer.isCorrect === false 
                                  ? 'text-red-700' 
                                  : 'text-gray-900'
                              }`}>
                                {answer.wasAnswered 
                                  ? (answer.yourAnswer || <em className="text-gray-400">No answer provided</em>)
                                  : <em>Question not answered</em>
                                }
                              </p>
                            </div>

                            {/* Correct Answer (show if wrong/unanswered and available) */}
                            {(answer.isCorrect === false || !answer.wasAnswered) && 
                             answer.correctAnswer && 
                             answer.type !== 'essay' && (
                              <div>
                                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                                  Correct Answer:
                                </span>
                                <p className="mt-1 text-sm sm:text-base text-green-700">
                                  {answer.correctAnswer}
                                </p>
                              </div>
                            )}

                            {/* Points */}
                            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                              <span className="text-xs text-gray-600">Points</span>
                              <span className={`text-sm font-bold ${
                                answer.isCorrect === true ? 'text-green-600' :
                                !answer.wasAnswered ? 'text-orange-600' :
                                answer.isCorrect === false ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {answer.pointsAwarded}/{answer.pointsPossible}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No answers available message */}
        {(!submission.answersByQuestionSet || submission.answersByQuestionSet.length === 0) && (
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Detailed Review Not Available</h3>
            <p className="text-sm text-gray-600">
              The instructor has not enabled answer review for this quiz.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm sm:text-base"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm sm:text-base"
          >
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;