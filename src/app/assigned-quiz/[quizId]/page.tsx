/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ChevronLeft, ChevronRight, Calculator, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

const API_BASE_URL = '/api/quiztaker';

interface QuestionSet {
  _id: string;
  title: string;
  order: number;
  totalPoints: number;
  questionCount: number;
}

interface Question {
  _id: string;
  type: string;
  question: string;
  passage?: string;           // NEW: Optional passage text
  diagram?: string;           // NEW: Optional diagram URL
  diagramAlt?: string;        // NEW: Optional alt text for accessibility
  options?: string[];
  points: number;
  order: number;
}

interface Quiz {
  _id: string;
  settings: {
    title: string;
    duration: {
      hours: number;
      minutes: number;
      seconds: number;
    };
    displayCalculator: boolean;
  };
  questionSets: QuestionSet[];
  totalPoints: number;
}

// Calculator Component
const CalculatorWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operation) {
      const currentValue = prevValue || 0;
      let newValue = currentValue;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '*':
          newValue = currentValue * inputValue;
          break;
        case '/':
          newValue = currentValue / inputValue;
          break;
        case '=':
          newValue = inputValue;
          break;
      }

      setDisplay(String(newValue));
      setPrevValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl border border-gray-300 p-3 sm:p-4 w-56 sm:w-64 z-50 max-w-[calc(100vw-2rem)]">
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Calculator</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
          <XCircle size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>
      <div className="bg-gray-100 p-2 sm:p-3 rounded mb-2 sm:mb-3 text-right text-xl sm:text-2xl font-mono overflow-x-auto">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {['7', '8', '9', '/'].map(btn => (
          <button
            key={btn}
            onClick={() => ['/', '*', '-', '+'].includes(btn) ? performOperation(btn) : inputDigit(btn)}
            className="bg-gray-200 active:bg-gray-400 hover:bg-gray-300 p-2 sm:p-3 rounded font-semibold text-sm sm:text-base touch-manipulation"
          >
            {btn}
          </button>
        ))}
        {['4', '5', '6', '*'].map(btn => (
          <button
            key={btn}
            onClick={() => ['/', '*', '-', '+'].includes(btn) ? performOperation(btn) : inputDigit(btn)}
            className="bg-gray-200 active:bg-gray-400 hover:bg-gray-300 p-2 sm:p-3 rounded font-semibold text-sm sm:text-base touch-manipulation"
          >
            {btn}
          </button>
        ))}
        {['1', '2', '3', '-'].map(btn => (
          <button
            key={btn}
            onClick={() => ['/', '*', '-', '+'].includes(btn) ? performOperation(btn) : inputDigit(btn)}
            className="bg-gray-200 active:bg-gray-400 hover:bg-gray-300 p-2 sm:p-3 rounded font-semibold text-sm sm:text-base touch-manipulation"
          >
            {btn}
          </button>
        ))}
        {['0', '.', '=', '+'].map(btn => (
          <button
            key={btn}
            onClick={() => {
              if (btn === '.') inputDecimal();
              else if (btn === '=') performOperation('=');
              else if (['+', '-', '*', '/'].includes(btn)) performOperation(btn);
              else inputDigit(btn);
            }}
            className={`${btn === '=' ? 'bg-blue-600 text-white active:bg-blue-800 hover:bg-blue-700' : 'bg-gray-200 active:bg-gray-400 hover:bg-gray-300'} p-2 sm:p-3 rounded font-semibold text-sm sm:text-base touch-manipulation`}
          >
            {btn}
          </button>
        ))}
        <button
          onClick={clear}
          className="col-span-4 bg-red-500 text-white active:bg-red-700 hover:bg-red-600 p-2 sm:p-3 rounded font-semibold text-sm sm:text-base touch-manipulation"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

const AssignedQuizPage = () => {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [phase, setPhase] = useState<'loading' | 'order-selection' | 'exam' | 'submitting'>('loading');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<number[]>([1, 2, 3, 4]);
  const [currentQuestionSetIndex, setCurrentQuestionSetIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsBySetOrder, setQuestionsBySetOrder] = useState<Record<number, Question[]>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const [looseFocusEnabled, setLooseFocusEnabled] = useState(false);
  const [hasLostFocus, setHasLostFocus] = useState(false);
  const userId = typeof window !== 'undefined' && localStorage.getItem('quizTaker')
    ? localStorage.getItem('quizTaker') as string
    : 'Guest';
  const getAllQuestions = useCallback(() => selectedOrder.flatMap(order => questionsBySetOrder[order] || []), [questionsBySetOrder, selectedOrder]);


  const handleSubmitQuiz = useCallback(async (isAuto = false, reason?: string) => {
    if (isDisabled) return;
    const all = getAllQuestions();

    // Show different messages based on reason
    if (!isAuto) {
      if (!window.confirm(`Submit ${Object.keys(answers).length}/${all.length} answered questions?`)) {
        return;
      }
    } else if (reason) {
      // Auto-submit due to focus loss or time up
      console.log(`Auto-submitting quiz: ${reason}`);
    }

    try {
      setIsDisabled(true);
      setPhase('submitting');

      // 🔥 FIX: Submit ALL unsubmitted question sets, not just the current one
      // Loop through all question sets in the selected order
      for (let i = 0; i < selectedOrder.length; i++) {
        const setOrder = selectedOrder[i];

        // Skip if already submitted
        if (completedSets.includes(setOrder)) {
          continue;
        }

        // Get questions for this set
        const setQuestions = questionsBySetOrder[setOrder] || [];

        // Get answers for this specific question set
        const setAnswers = setQuestions
          .map(q => ({
            questionId: q._id,
            answer: answers[q._id] || '',
          }))
          .filter(a => a.answer);

        // Determine if this is the final submission
        // It's final if this is the last unsubmitted set
        const isLastUnsubmittedSet = selectedOrder
          .slice(i + 1)
          .every(order => completedSets.includes(order));

        // Submit this question set
        await fetch(`${API_BASE_URL}/quiz/${quizId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: setAnswers,
            questionSetOrder: setOrder,
            isFinalSubmission: isLastUnsubmittedSet,
          }),
        });

        // Mark as completed locally (to prevent re-submission in loop)
        if (!completedSets.includes(setOrder)) {
          setCompletedSets(prev => [...prev, setOrder]);
        }
      }

      // Redirect to dashboard with message
      if (reason) {
        // Store reason in sessionStorage to show on dashboard
        sessionStorage.setItem('quizSubmitReason', reason);
      }
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to submit quiz');
      setPhase('exam');
      setHasLostFocus(false); // Allow retry
    } finally {
      setIsDisabled(false);
    }
  }, [isDisabled, getAllQuestions, answers, selectedOrder, completedSets, router, questionsBySetOrder, quizId]);

  const ImageModal: React.FC<{ imageUrl: string; altText: string; onClose: () => void }> = ({
    imageUrl,
    altText,
    onClose
  }) => {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="relative max-w-5xl max-h-[90vh] w-full">
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 text-white hover:text-gray-300 text-sm sm:text-base"
          >
            <XCircle size={32} />
          </button>
          <Image
            src={imageUrl}
            alt={altText}
            className="w-full h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {altText && (
            <p className="text-white text-center mt-4 text-sm">{altText}</p>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchQuizDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'exam') return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]); // ✅ Only depend on phase

  // Separate effect for auto-submit
  useEffect(() => {
    if (phase === 'exam' && timeRemaining === 0 && !isDisabled) {
      handleSubmitQuiz(true, 'Time expired');
    }
  }, [timeRemaining, phase, isDisabled, handleSubmitQuiz]);

  // Focus loss detection - AUTO SUBMIT
  useEffect(() => {
    if (phase === 'exam' && timeRemaining === 0 && !isDisabled) {
      handleSubmitQuiz(true, 'Time expired');
    }
  }, [timeRemaining, phase, isDisabled, handleSubmitQuiz]);

  // Focus loss detection - AUTO SUBMIT (FIXED VERSION)
  useEffect(() => {
    if (phase !== 'exam' || !looseFocusEnabled || hasLostFocus) return;

    // Track if the user has genuinely switched tabs/apps
    let wasVisible = true;
    let focusLostTimeout: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      // Mobile: document.hidden can be true when screen turns off
      // Desktop: document.hidden is true when tab is switched
      
      if (document.hidden) {
        wasVisible = false;
        
        // Give a grace period to distinguish screen-off from tab-switch
        // On mobile, screen-off typically triggers multiple rapid visibility changes
        // On desktop/genuine tab switch, the page stays hidden
        focusLostTimeout = setTimeout(() => {
          // Only trigger if still hidden after delay
          if (document.hidden && !document.hasFocus()) {
            console.log('Tab/window switched - triggering auto-submit');
            setHasLostFocus(true);
            handleSubmitQuiz(true, 'Focus lost - switched tabs or windows');
          }
        }, 300); // 300ms grace period
      } else {
        // Page became visible again - cancel any pending submission
        if (focusLostTimeout) {
          clearTimeout(focusLostTimeout);
          focusLostTimeout = null;
        }
        wasVisible = true;
      }
    };

    // Alternative approach: Use both visibility and focus together
    const handleFocusLoss = () => {
      // Only submit if BOTH conditions are true:
      // 1. Document is hidden (tab switched)
      // 2. Window doesn't have focus
      setTimeout(() => {
        if (document.hidden && !document.hasFocus()) {
          console.log('Focus lost - triggering auto-submit');
          setHasLostFocus(true);
          handleSubmitQuiz(true, 'Focus lost - switched tabs or windows');
        }
      }, 200);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Warn user before closing/refreshing
      e.preventDefault();
      e.returnValue = 'Your quiz will be auto-submitted if you leave this page. Are you sure?';
      return e.returnValue;
    };

    // Add event listeners - Use visibilitychange instead of blur
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    console.log('Focus loss detection enabled');

    // Cleanup
    return () => {
      if (focusLostTimeout) {
        clearTimeout(focusLostTimeout);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      console.log('Focus loss detection disabled');
    };
  }, [phase, looseFocusEnabled, hasLostFocus, handleSubmitQuiz]);

  const fetchQuizDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/${quizId}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setQuiz(data.quiz);

      // Enable loose focus detection if quiz settings allow
      if (data.quiz.settings.looseFocus === false) {
        setLooseFocusEnabled(true);
      }

      // Check if custom order already set
      if (data.selectedQuestionSetOrder && data.selectedQuestionSetOrder.length === 4) {
        setSelectedOrder(data.selectedQuestionSetOrder);
        await startQuiz(data.selectedQuestionSetOrder);
      } else {
        setPhase('order-selection');
      }
    } catch (err) {
      setError('Failed to load quiz');
    }
  };

  const handleSetOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/set-question-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionSetOrder: selectedOrder }),
      });

      const data = await response.json();
      if (!data.success) {
        setError(data.message);
        return;
      }

      await startQuiz(selectedOrder);
    } catch (err) {
      setError('Failed to set order');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (order: number[]) => {
    try {
      // Start the quiz
      const startResponse = await fetch(`${API_BASE_URL}/quiz/${quizId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizTaker: userId }),
      });

      const startData = await startResponse.json();
      if (!startData.success) {
        setError(startData.message);
        return;
      }

      // Fetch questions for each question set
      const questionsData: Record<number, Question[]> = {};
      for (const setOrder of order) {
        const res = await fetch(`${API_BASE_URL}/quiz/${quizId}/question-set/${setOrder}`);
        const data = await res.json();
        if (data.success) {
          questionsData[setOrder] = data.questionSet.questions;
        }
      }

      setQuestionsBySetOrder(questionsData);

      // Set timer
      if (quiz?.settings.duration) {
        const { hours, minutes, seconds } = quiz.settings.duration;
        const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
        setTimeRemaining(totalSeconds);
      }

      setPhase('exam');
    } catch (err) {
      setError('Failed to start quiz');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentQuestions = () => questionsBySetOrder[selectedOrder[currentQuestionSetIndex]] || [];
  const getCurrentQuestion = () => getCurrentQuestions()[currentQuestionIndex] || null;


  const handleOptionSelect = (answer: string) => {
    const q = getCurrentQuestion();
    if (q) setAnswers({ ...answers, [q._id]: answer });
  };

  const handleNext = () => {
    const questions = getCurrentQuestions();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentQuestionSetIndex < selectedOrder.length - 1) {
      setCurrentQuestionSetIndex(currentQuestionSetIndex + 1);
      setCurrentQuestionIndex(0);

    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentQuestionSetIndex > 0) {
      setCurrentQuestionSetIndex(currentQuestionSetIndex - 1);
      const prevOrder = selectedOrder[currentQuestionSetIndex - 1];
      setCurrentQuestionIndex((questionsBySetOrder[prevOrder] || []).length - 1);
    }
  };

  const handleSubmitQuestionSet = async () => {
    const currentSetOrder = selectedOrder[currentQuestionSetIndex];
    const currentSetQuestions = questionsBySetOrder[currentSetOrder] || [];

    // Get answers for current question set only
    const currentSetAnswers = currentSetQuestions
      .map(q => ({
        questionId: q._id,
        answer: answers[q._id] || '',
      }))
      .filter(a => a.answer);

    try {
      const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: currentSetAnswers,
          questionSetOrder: currentSetOrder,
          isFinalSubmission: true,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        setError(data.message);
        return;
      }

      // Mark set as completed
      setCompletedSets([...completedSets, currentSetOrder]);

      // Move to next set
      if (currentQuestionSetIndex < selectedOrder.length - 1) {
        setCurrentQuestionSetIndex(currentQuestionSetIndex + 1);
        setCurrentQuestionIndex(0);
      }
    } catch (err) {
      setError('Failed to submit question set');
    }
  };


  const currentQuestion = getCurrentQuestion();
  const currentGlobalIndex = selectedOrder.slice(0, currentQuestionSetIndex)
    .reduce((sum, order) => sum + (questionsBySetOrder[order]?.length || 0), 0) + currentQuestionIndex;

  // Loading Phase
  if (phase === 'loading' || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading quiz...</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Order Selection Phase
  if (phase === 'order-selection') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-4 py-4 sm:py-8 px-4 sm:px-6">
          <header className="bg-white border-b border-gray-200 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">{quiz.settings.title}</span>
            </div>
          </header>

          <main className="flex items-center justify-center px-2 sm:px-6 py-2">
            <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm p-4 sm:p-8">
              <h1 className="text-xl sm:text-2xl font-bold mb-2">Choose Your Question Order</h1>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                Drag to reorder or tap to select the sequence you prefer
              </p>

              <div className="space-y-3 mb-6 sm:mb-8">
                {quiz.questionSets.map((qs) => {
                  const position = selectedOrder.indexOf(qs.order);
                  return (
                    <div
                      key={qs._id}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {position + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm sm:text-base">{qs.title}</div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {qs.questionCount} questions • {qs.totalPoints} points
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newOrder = [...selectedOrder];
                            const idx = newOrder.indexOf(qs.order);
                            if (idx > 0) {
                              [newOrder[idx], newOrder[idx - 1]] = [newOrder[idx - 1], newOrder[idx]];
                              setSelectedOrder(newOrder);
                            }
                          }}
                          disabled={position === 0}
                          className="px-2 py-1 bg-gray-200 rounded text-xs disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => {
                            const newOrder = [...selectedOrder];
                            const idx = newOrder.indexOf(qs.order);
                            if (idx < newOrder.length - 1) {
                              [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
                              setSelectedOrder(newOrder);
                            }
                          }}
                          disabled={position === 3}
                          className="px-2 py-1 bg-gray-200 rounded text-xs disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleSetOrder}
                disabled={loading}
                className="w-full py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900 transition-all touch-manipulation"
              >
                {loading ? 'Starting...' : 'Start Quiz'}
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Submitting Phase
  if (phase === 'submitting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Submitting your quiz...</p>
        </div>
      </div>
    );
  }

  // Exam Phase
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-lg">B</span>
            </div>
            <span className="font-semibold text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
              {quiz.settings.title}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {quiz.settings.displayCalculator && (
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors ${showCalculator
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Calculator</span>
              </button>
            )}
            <button
              onClick={() => handleSubmitQuiz()} disabled={isDisabled}
              className="bg-red-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-red-700 active:bg-red-800 transition-colors touch-manipulation"
            >
              Submit
            </button>
          </div>
        </div>
      </header>

      {/* Timer Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span className="text-base sm:text-lg font-semibold text-blue-600">
                {formatTime(timeRemaining)}
              </span>
            </div>
            {looseFocusEnabled && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-600 bg-orange-50 px-2 sm:px-3 py-1 rounded-full">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Don&apos;t switch tabs - auto-submit enabled</span>
                <span className="sm:hidden">Stay focused</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="bg-blue-900 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 min-w-max">
          {selectedOrder.map((order, i) => {
            const qs = quiz.questionSets.find(q => q.order === order);
            const isCompleted = completedSets.includes(order);
            return (
              <button
                key={order}
                onClick={() => {
                  if (!isCompleted) {
                    setCurrentQuestionSetIndex(i);
                    setCurrentQuestionIndex(0);
                  }
                }}
                disabled={isCompleted}
                className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors touch-manipulation ${currentQuestionSetIndex === i
                  ? 'bg-blue-700 text-white'
                  : isCompleted
                    ? 'bg-green-700 text-green-100'
                    : 'bg-blue-900 text-blue-200 hover:bg-blue-800 active:bg-blue-700'
                  }`}
              >
                {qs?.title} {isCompleted && '✓'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {currentQuestion && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
            {/* Question Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 gap-2">
              <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {quiz.questionSets.find(qs => qs.order === selectedOrder[currentQuestionSetIndex])?.title}
              </h2>
              <span className="text-xs sm:text-sm font-semibold text-gray-500">
                {currentGlobalIndex + 1} / {getAllQuestions().length}
              </span>
            </div>

            {/* NEW: Passage Section */}
            {currentQuestion.passage && (
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                <h3 className="text-sm sm:text-base font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Reading Passage
                </h3>
                <div className="text-sm sm:text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {currentQuestion.passage}
                </div>
              </div>
            )}

            {/* NEW: Diagram Section */}
            {currentQuestion.diagram && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Diagram/Figure
                </h3>
                <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={currentQuestion.diagram}
                    alt={currentQuestion.diagramAlt || 'Question diagram'}
                    className="w-full h-auto max-h-96 object-contain cursor-zoom-in hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(currentQuestion.diagram!)}
                  />
                  <button
                    onClick={() => setSelectedImage(currentQuestion.diagram!)}
                    className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 px-3 py-1 rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-all flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    Zoom
                  </button>
                </div>
                {currentQuestion.diagramAlt && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 italic">
                    {currentQuestion.diagramAlt}
                  </p>
                )}
              </div>
            )}

            {/* Question Text */}
            <p className="text-base sm:text-lg mb-6 sm:mb-8 text-gray-900 leading-relaxed font-medium">
              {currentQuestion.question}
            </p>

            {/* Options - Multiple Choice */}
            {currentQuestion.type === 'multiple-choice' && (
              <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {(currentQuestion.options || []).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(opt)}
                    className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all touch-manipulation ${answers[currentQuestion._id] === opt
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 active:bg-gray-200'
                      }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span
                        className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${answers[currentQuestion._id] === opt
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                          }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-gray-900 pt-0.5 sm:pt-1 text-sm sm:text-base">{opt}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Options - True/False */}
            {currentQuestion.type === 'true-false' && (
              <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {['True', 'False'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(opt)}
                    className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all touch-manipulation ${answers[currentQuestion._id] === opt
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 active:bg-gray-200'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${answers[currentQuestion._id] === opt
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                          }`}
                      >
                        {opt[0]}
                      </span>
                      <span className="text-gray-900 text-sm sm:text-base">{opt}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Text Input - Fill in the blanks & Essay */}
            {(currentQuestion.type === 'fill-in-the-blanks' || currentQuestion.type === 'essay') && (
              <div className="mb-6 sm:mb-8">
                <textarea
                  value={answers[currentQuestion._id] || ''}
                  onChange={(e) => handleOptionSelect(e.target.value)}
                  placeholder={currentQuestion.type === 'essay' ? 'Type your answer here...' : 'Fill in the blank'}
                  rows={currentQuestion.type === 'essay' ? 6 : 2}
                  className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-3 sm:pt-4 border-t border-gray-200">
              <button
                onClick={handlePrev}
                disabled={currentQuestionSetIndex === 0 && currentQuestionIndex === 0}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-xs sm:text-sm hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                Prev
              </button>
              <button
                onClick={handleNext}
                disabled={isDisabled}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 rounded-lg bg-blue-600 text-white font-medium text-xs sm:text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
              >
                {currentQuestionIndex === getCurrentQuestions().length - 1 && currentQuestionSetIndex < selectedOrder.length - 1
                  ? 'Next Set'
                  : 'Next'}
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Image Modal - Add this before the closing </main> tag */}
        {selectedImage && (
          <ImageModal
            imageUrl={selectedImage}
            altText={currentQuestion?.diagramAlt || 'Diagram'}
            onClose={() => setSelectedImage(null)}
          />
        )}

      </main>

      {/* Calculator Widget */}
      {showCalculator && quiz.settings.displayCalculator && (
        <CalculatorWidget onClose={() => setShowCalculator(false)} />
      )}
    </div>
  );
};

export default AssignedQuizPage;