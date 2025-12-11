/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { AlertTriangle, Clock, Calculator, Flag, ChevronLeft, Send, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import CalculatorWidget from "@/components/CalculatorComponent";
import { Answer, Quiz, QuizDetailsResponse } from "@/types/global";
import Image from "next/image";

interface TakeQuizScreenProps {
  initialQuizData: QuizDetailsResponse;
  quizTakerId: string;
}

const TakeQuizScreen: React.FC<TakeQuizScreenProps> = ({ initialQuizData, quizTakerId }) => {
  const router = useRouter();

  const [quiz] = useState<Quiz>(initialQuizData.quiz);
  const [assignedQuizStatus] = useState(initialQuizData.assignmentStatus);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(
    initialQuizData.quiz.questions.map(q => ({ 
      questionId: q._id, 
      answer: '', 
      flagged: false 
    }))
  );
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const [focusLost, setFocusLost] = useState(false);
  const [focusLostCount, setFocusLostCount] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(assignedQuizStatus === 'pending');
  const [quizStarted, setQuizStarted] = useState(assignedQuizStatus === 'in-progress');
  const [submitting, setSubmitting] = useState(false);
  const [ ,setStartTime] = useState<number>(0);

  // Initialize timer
  useEffect(() => {
    if (quizStarted) {
      const { hours, minutes, seconds } = quiz.settings.duration;
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      const timer = setTimeout(() => {
        setTimeRemaining(totalSeconds);
        setStartTime(Date.now());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [quizStarted, quiz.settings.duration]);

  // Timer countdown
  useEffect(() => {
    if (!quizStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  });

  // Focus detection
  useEffect(() => {
    if (!quizStarted || !quiz.settings.looseFocus) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setFocusLost(true);
        setFocusLostCount(prev => prev + 1);
      }
    };

    const handleBlur = () => {
      setFocusLost(true);
      setFocusLostCount(prev => prev + 1);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [quizStarted, quiz.settings.looseFocus]);

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: any) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex].answer = value;
    setAnswers(newAnswers);
  };

  const toggleFlag = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex].flagged = !newAnswers[currentQuestionIndex].flagged;
    setAnswers(newAnswers);
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      
      // Format answers for backend (only questionId and answer)
      const formattedAnswers = answers.map(({ questionId, answer }) => ({
        questionId,
        answer,
      }));
      
      console.log('Submitting quiz with answers:', formattedAnswers);
      
      const response = await fetch(`/api/quiztaker/quiz/${quiz._id}/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: formattedAnswers,
        }),
      });

      console.log('Submit response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Submit error response:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to submit quiz');
      }

      const data = await response.json();
      console.log('Submit success response:', data);
      
      // Redirect to results page
      router.push(`/results/${data.submissionId}`);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert(err instanceof Error ? err.message : 'Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };

  const startQuiz = async () => {
    try {
      const response = await fetch(`/api/quiztaker/quiz/${quiz._id}/start`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizTaker: quizTakerId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start quiz');
      }

      setShowInstructions(false);
      setQuizStarted(true);
    } catch (err) {
      console.error('Error starting quiz:', err);
      alert('Failed to start quiz. Please try again.');
    }
  };

  const getAnsweredCount = () => {
    return answers.filter(a => a.answer !== '' && a.answer !== null).length;
  };

  const getFlaggedCount = () => {
    return answers.filter(a => a.flagged).length;
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-8">
          {quiz.settings.coverImage && (
            <Image
              src={quiz.settings.coverImage}
              alt="Quiz cover"
              width={800}
              height={192}
              className="w-full h-48 object-cover rounded-lg mb-6"
            />
          )}
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{quiz.settings.title}</h1>
            {quiz.settings.isQuizChallenge && (
              <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
                Challenge
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-6">{quiz.settings.description}</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-blue-600" size={20} />
              Instructions
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{quiz.settings.instructions}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900">{quiz.questions.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Points</p>
              <p className="text-2xl font-bold text-gray-900">{quiz.totalPoints}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(quiz.settings.duration.hours * 3600 + quiz.settings.duration.minutes * 60 + quiz.settings.duration.seconds)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Multiple Attempts</p>
              <p className="text-2xl font-bold text-gray-900">
                {quiz.settings.multipleAttempts ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>
                {quiz.settings.looseFocus
                  ? 'Warning: Switching tabs or losing focus will be tracked.'
                  : 'You can freely switch tabs during the quiz.'}
              </span>
            </p>
          </div>

          <button
            onClick={startQuiz}
            className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{quiz.settings.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <Clock size={20} />
                <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
              </div>
              {quiz.settings.displayCalculator && (
                <button
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <Calculator size={20} />
                  Calculator
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Focus Lost Warning */}
      {focusLost && (
        <div className="bg-red-500 text-white px-4 py-3 text-center">
          <p className="font-semibold">
            ⚠️ Focus Lost Detected! (Count: {focusLostCount}) - Your activity is being monitored.
          </p>
          <button
            onClick={() => setFocusLost(false)}
            className="ml-4 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Question Overview</h3>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {quiz.questions.map((q, idx) => {
                  const answer = answers[idx];
                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-10 h-10 rounded-lg font-semibold text-sm transition ${
                        idx === currentQuestionIndex
                          ? 'bg-indigo-600 text-white'
                          : answer.flagged
                          ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400'
                          : answer.answer
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Answered:</span>
                  <span className="font-semibold text-green-600">{getAnsweredCount()}/{quiz.questions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Flagged:</span>
                  <span className="font-semibold text-yellow-600">{getFlaggedCount()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded">
                      {currentQuestion.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                    <span className="text-gray-600 text-sm">{currentQuestion.points} points</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {currentQuestion.question}
                  </h2>
                </div>
                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    currentAnswer.flagged
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Flag size={18} />
                  {currentAnswer.flagged ? 'Flagged' : 'Flag'}
                </button>
              </div>

              {/* Answer Input Based on Question Type */}
              <div className="mt-8">
                {currentQuestion.type === 'multiple-choice' && (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                          currentAnswer.answer === option
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={option}
                          checked={currentAnswer.answer === option}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          className="w-5 h-5 text-indigo-600 mr-3"
                        />
                        <span className="text-gray-900 font-medium">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'true-false' && (
                  <div className="space-y-3">
                    {['True', 'False'].map((option) => (
                      <label
                        key={option}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                          currentAnswer.answer === option
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={option}
                          checked={currentAnswer.answer === option}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          className="w-5 h-5 text-indigo-600 mr-3"
                        />
                        <span className="text-gray-900 font-medium">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'fill-in-the-blanks' && (
                  <input
                    type="text"
                    value={currentAnswer.answer || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Enter your answer here..."
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none text-lg"
                  />
                )}

                {currentQuestion.type === 'essay' && (
                  <textarea
                    value={currentAnswer.answer || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Write your answer here..."
                    rows={10}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none text-lg resize-none"
                  />
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>

                {currentQuestionIndex === quiz.questions.length - 1 ? (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
                  >
                    <Send size={20} />
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Next
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Widget */}
      {showCalculator && quiz.settings.displayCalculator && (
        <CalculatorWidget onClose={() => setShowCalculator(false)} />
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Submit Quiz?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your quiz? You have answered {getAnsweredCount()} out of {quiz.questions.length} questions.
            </p>
            {getAnsweredCount() < quiz.questions.length && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  You have {quiz.questions.length - getAnsweredCount()} unanswered question(s).
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeQuizScreen;