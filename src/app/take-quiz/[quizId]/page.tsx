// app/take-quiz/[quizId]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import QuizTimer from '@/components/QuizTimer';
import ProgressTracker from '@/components/ProgressTracker';
import OrderSelection from '@/components/OrderSelection';
import QuestionDisplay from '@/components/QuestionDisplay';
import {
  Quiz,
  QuizProgress,
  QuestionSet,
  Answer,
} from '@/types/global';

type ViewMode = 'loading' | 'order-selection' | 'quiz' | 'error';

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizTaker = localStorage.getItem('quizTaker');
  const {quizId} = params;

  

  const [viewMode, setViewMode] = useState<ViewMode>('loading');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [currentQuestionSet, setCurrentQuestionSet] = useState<QuestionSet | null>(null);
  const [answers, setAnswers] = useState<Map<string, string | boolean>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  

  // Fetch quiz and progress data
  const fetchQuizData = useCallback(async () => {
    console.log('Fetching quiz data for quizId:', quizId);
    if (!quizId) return;
    
    try {
      setError(null);

      const [quizResponse, progressResponse] = await Promise.all([
        fetch(`/api/quiz/${quizId}`),
        fetch(`/api/quiz/${quizId}/progress`),
      ]);

      const quizData = await quizResponse.json();
      console.log('Quiz data:', quizData);
      const progressData = await progressResponse.json();
      console.log('Progress data:', progressData.progress);

      if (!quizData.success || !progressData.success) {
        throw new Error(quizData.error || progressData.error || 'Failed to load quiz');
      }

      setQuiz(quizData.quiz);
      setProgress(progressData.progress);

      // Determine view mode
      if (!progressData.progress ||
          progressData.progress.selectedQuestionSetOrder.length === 0) {
        setViewMode('order-selection');
      } else if (progressData.progress.status === 'completed') {
        router.push(`/results/${progressData.progress.submissionId}`);
      } else {
        setViewMode('quiz');
        // Load current question set
        await loadCurrentQuestionSet(progressData.progress);
      }
    } catch (err) {
      console.error('Error fetching quiz data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
      setViewMode('error');
    }
  }, [quizId, router]);


  
  // Load current question set
  const loadCurrentQuestionSet = async (progressData: QuizProgress) => {
    try {
      const nextSetOrder = progressData.currentQuestionSetOrder || 
                          progressData.selectedQuestionSetOrder[0];

      const response = await fetch(`/api/quiz/${quizId}/question-set/${nextSetOrder}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load question set');
      }

      setCurrentQuestionSet(data.questionSet);
      setCurrentQuestionIndex(0);
      // Start question set if not started
      const qsProgress = progressData.questionSets.find(
        qs => qs.questionSetOrder === nextSetOrder
      );
      
      if (qsProgress?.status === 'not-started') {
        await fetch(`/api/quiz/${quizId}/question-set/${nextSetOrder}/start`, {
          method: 'POST',
        });
      }
    } catch (err) {
      console.error('Error loading question set:', err);
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);

  // Handle order confirmation
  const handleOrderConfirmed = async (order: number[]) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/quiz/${quizId}/set-question-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionSetOrder: order }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to set question order');
      }

      // Start the quiz
      await fetch(`/api/quiz/${quizId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "quizTaker": quizTaker }),
      });

      // Reload quiz data
      await fetchQuizData();
    } catch (err) {
      console.error('Error confirming order:', err);
      setError(err instanceof Error ? err.message : 'Failed to start quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle answer change
  const handleAnswerChange = (questionId: string, answer: string | boolean) => {
    setAnswers(new Map(answers.set(questionId, answer)));
  };

  // Navigation handlers
  const handleNextQuestion = () => {
    if (currentQuestionSet && currentQuestionIndex < currentQuestionSet.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Handle question set submission
  const handleSubmitQuestionSet = async () => {
    if (!currentQuestionSet || !progress) return;

    const unanswered = currentQuestionSet.questions.filter(
      q => !answers.has(q._id)
    );

    if (unanswered.length > 0) {
      const confirmed = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Do you want to submit anyway?`
      );
      if (!confirmed) return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const answersArray: Answer[] = Array.from(answers.entries()).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        })
      );

      const completedSets = progress.questionSets.filter(
        qs => qs.status === 'completed'
      ).length;
      const isFinalSubmission = completedSets === 3; // This is the 4th set

      const response = await fetch(`/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answersArray,
          questionSetOrder: currentQuestionSet.order,
          isFinalSubmission,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit answers');
      }

      // Clear answers for next set
      setAnswers(new Map());

      if (isFinalSubmission) {
        // Redirect to results
        router.push(`/results/${data.data.submission.id}`);
      } else {
        // Reload progress and load next question set
        await fetchQuizData();
      }
    } catch (err) {
      console.error('Error submitting question set:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit answers');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle time up
  const handleTimeUp = useCallback(async () => {
    alert('Time is up! Your quiz will be submitted automatically.');
    
    if (!currentQuestionSet) return;

    try {
      const answersArray: Answer[] = Array.from(answers.entries()).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        })
      );

      await fetch(`/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answersArray,
          questionSetOrder: currentQuestionSet.order,
          isFinalSubmission: true,
        }),
      });

      router.push('/dashboard');
    } catch (err) {
      console.error('Error auto-submitting:', err);
    }
  }, [quizId, currentQuestionSet, answers, router]);

  // Navigate to completed question set
  const handleNavigateToSet = async (order: number) => {
    if (!progress) return;

    const qsProgress = progress.questionSets.find(
      qs => qs.questionSetOrder === order
    );

    if (qsProgress?.status !== 'completed') return;

    try {
      const response = await fetch(`/api/quiz/${quizId}/question-set/${order}`);
      const data = await response.json();

      if (data.success) {
        setCurrentQuestionSet(data.data);
        // Load saved answers (read-only mode could be implemented)
      }
    } catch (err) {
      console.error('Error loading question set:', err);
    }
  };

  // Calculate total duration in seconds
  const getTotalDuration = () => {
    if (!quiz) return 0;
    const { hours, minutes, seconds } = quiz.settings.duration;
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Early return if quizId is not available yet
  if (!quizId) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-[hsl(var(--primary))] mx-auto mb-4" />
          <p className="text-[hsl(var(--muted-foreground))]">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (viewMode === 'loading') {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-[hsl(var(--primary))] mx-auto mb-4" />
          <p className="text-[hsl(var(--muted-foreground))]">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (viewMode === 'error') {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
            Error Loading Quiz
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Order selection view
  if (viewMode === 'order-selection' && quiz) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>

          <OrderSelection
            questionSets={quiz.questionSets}
            onOrderConfirmed={handleOrderConfirmed}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    );
  }

  // Quiz taking view
   if (viewMode === 'quiz' && quiz && progress && currentQuestionSet) {
    const currentSetProgress = progress.questionSets.find(
      qs => qs.questionSetOrder === currentQuestionSet.order
    );
    const isReviewMode = currentSetProgress?.status === 'completed';
    const completedCount = progress.questionSets.filter(
      qs => qs.status === 'completed'
    ).length;

    const sortedQuestions = [...currentQuestionSet.questions].sort((a, b) => a.order - b.order);
    const currentQuestion = sortedQuestions[currentQuestionIndex];
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === sortedQuestions.length - 1;

    return (
      <div className="min-h-screen bg-[hsl(var(--background))] p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-[hsl(var(--card))] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                {quiz.settings.title}
              </h1>
              <QuizTimer
                totalSeconds={getTotalDuration()}
                onTimeUp={handleTimeUp}
                isPaused={isReviewMode}
              />
            </div>
            
            <ProgressTracker
              questionSets={progress.questionSets}
              currentQuestionSetOrder={currentQuestionSet.order}
              onNavigate={handleNavigateToSet}
            />
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-800 flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Question Set Header */}
          <div className="bg-[hsl(var(--card))] rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                  {currentQuestionSet.title}
                </h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  Question {currentQuestionIndex + 1} of {sortedQuestions.length} • {currentQuestionSet.totalPoints} points total
                </p>
              </div>
              {isReviewMode && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                  <CheckCircle size={20} />
                  <span className="font-semibold">Completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Question Navigation Grid */}
          <div className="bg-[hsl(var(--card))] rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                Quick Navigation:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sortedQuestions.map((q, index) => {
                const isAnswered = answers.has(q._id);
                const isCurrent = index === currentQuestionIndex;
                return (
                  <button
                    key={q._id}
                    onClick={() => handleJumpToQuestion(index)}
                    className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                      isCurrent
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] ring-2 ring-[hsl(var(--primary))]/50'
                        : isAnswered
                        ? 'bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200'
                        : 'bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))] border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))]"></div>
                <span>Not Answered</span>
              </div>
            </div>
          </div>

          {/* Current Question */}
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            answer={answers.get(currentQuestion._id)}
            onAnswerChange={(answer) => handleAnswerChange(currentQuestion._id, answer)}
          />

          {/* Navigation Buttons */}
          <div className="bg-[hsl(var(--card))] rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={isFirstQuestion}
                className="px-6 py-3 bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-lg font-semibold hover:bg-[hsl(var(--accent))] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                <span>Previous</span>
              </button>

              <div className="text-center">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {answers.size} of {sortedQuestions.length} questions answered
                </p>
                {completedCount === 3 && !isReviewMode && (
                  <p className="text-sm font-semibold text-orange-600 mt-1">
                    ⚠️ Final question set
                  </p>
                )}
              </div>

              {!isLastQuestion ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-semibold hover:opacity-90 flex items-center gap-2"
                >
                  <span>Next</span>
                  <ArrowRight size={20} />
                </button>
              ) : (
                !isReviewMode && (
                  <button
                    onClick={handleSubmitQuestionSet}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Question Set</span>
                        <CheckCircle size={20} />
                      </>
                    )}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}