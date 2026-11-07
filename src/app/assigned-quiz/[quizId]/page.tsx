/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, ChevronLeft, ChevronRight, Calculator, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import PortalLogo from '@/components/PortalLogo';
import { watchExamFocus } from '@/lib/exam-focus';
import MockSubjectSelection from '@/components/MockSubjectSelection';
import { isEnglishSubject } from '@/lib/registration-subjects';

const API_BASE_URL = '/api/quiztaker';

interface QuestionSet {
  id: string;
  title: string;
  order: number;
  totalPoints: number;
  questionCount: number;
}

interface Question {
  id: string;
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
  id: string;
  title: string;
  durationHours: number;
  durationMinutes: number;
  durationSeconds: number;
  displayCalculator: boolean;
  looseFocus: boolean;
  studentSelectsSubjects?: boolean;
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

  const [phase, setPhase] = useState<'loading' | 'order-selection' | 'exam' | 'submitting' | 'submission-error'>('loading');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<number[]>([]);
  const [currentQuestionSetIndex, setCurrentQuestionSetIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsBySetOrder, setQuestionsBySetOrder] = useState<Record<number, Question[]>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timerStarted, setTimerStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const enforceFocus = quiz?.looseFocus === false;
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const submissionInProgress = useRef(false);
  const submissionReason = useRef<string | undefined>(undefined);
  const getAllQuestions = useCallback(() => selectedOrder.flatMap(order => questionsBySetOrder[order] || []), [questionsBySetOrder, selectedOrder]);


  const handleSubmitQuiz = useCallback(async (isAuto = false, reason?: string) => {
    if (submissionInProgress.current) return;
    submissionInProgress.current = true;
    submissionReason.current = reason;
    setShowSubmitConfirmation(false);

    if (isAuto && reason) {
      // Auto-submit due to focus loss or time up
      console.log(`Auto-submitting quiz: ${reason}`);
    }

    const localCompleted = new Set(completedSets);
    try {
      setIsDisabled(true);
      setPhase('submitting');

      const unsubmittedOrders = selectedOrder.filter(order => !localCompleted.has(order));

      // 🔥 FIX: Submit ALL unsubmitted question sets, not just the current one
      // Loop through all question sets in the selected order
      for (let i = 0; i < unsubmittedOrders.length; i++) {
        const setOrder = unsubmittedOrders[i];
        const setQuestions = questionsBySetOrder[setOrder] || [];
        const isFinalSubmission = i === unsubmittedOrders.length - 1; // last one is always final

        const setAnswers = setQuestions
          .map(q => ({ questionId: q.id, answer: answers[q.id] || '' }))
          .filter(a => a.answer);

        const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: setAnswers,
            questionSetOrder: setOrder,
            isFinalSubmission,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || data.error || 'Failed to submit quiz');
        }

        localCompleted.add(setOrder);
      }

      if (reason) {
        sessionStorage.setItem('quizSubmitReason', reason);
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
      setCompletedSets([...localCompleted]);
      setPhase('submission-error');
      submissionInProgress.current = false;
    } finally {
      setIsDisabled(false);
    }
  }, [answers, selectedOrder, completedSets, router, questionsBySetOrder, quizId]);

  const submitQuizRef = useRef(handleSubmitQuiz);
  useEffect(() => {
    submitQuizRef.current = handleSubmitQuiz;
  }, [handleSubmitQuiz]);

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
    if (phase === 'exam' && timerStarted && timeRemaining === 0 && !isDisabled) {
      handleSubmitQuiz(true, 'Time expired');
    }
  }, [timeRemaining, phase, timerStarted, isDisabled, handleSubmitQuiz]);



  // Keep listeners stable while answers change, and always submit current answers.
  useEffect(() => {
    if (phase !== 'exam' || !enforceFocus) return;

    const stopWatching = watchExamFocus(() => {
      void submitQuizRef.current(true, 'Focus lost - switched tabs or windows');
    });

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Warn user before closing/refreshing
      e.preventDefault();
      e.returnValue = 'Your quiz will be auto-submitted if you leave this page. Are you sure?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      stopWatching();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [phase, enforceFocus]);

  const fetchQuizDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/${quizId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || data.error || 'Unable to load quiz');
        return;
      }

      const quizData = data.quiz as Quiz;
      if (!quizData || !Array.isArray(quizData.questionSets) || quizData.questionSets.length === 0) {
        throw new Error('Quiz details are incomplete');
      }
      setQuiz(quizData);

      // Check if custom order already set
      if (data.selectedQuestionSetOrder?.length > 0 && (!quizData.studentSelectsSubjects || data.assignmentStatus === 'in-progress')) {
        setSelectedOrder(data.selectedQuestionSetOrder);
        await startQuiz(data.selectedQuestionSetOrder, quizData);
      } else {
        const defaultOrder = quizData.studentSelectsSubjects
          ? quizData.questionSets.filter((qs) => isEnglishSubject(qs.title)).map((qs) => qs.order)
          : quizData.questionSets.map((qs: QuestionSet) => qs.order);
        setSelectedOrder(defaultOrder);

        if (defaultOrder.length === 1 && !quizData.studentSelectsSubjects) {
          // Single-subject: no need to show order selection, go straight in
          await startQuiz(defaultOrder, quizData);
        } else {
          setPhase('order-selection');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
    }
  };

  const handleSetOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/set-question-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionSetOrder: selectedOrder }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || data.error || 'Failed to set order');
        return;
      }

      await startQuiz(selectedOrder);
    } catch (err) {
      setError('Failed to set order');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (order: number[], quizData?: Quiz) => {
    const resolvedQuiz = quizData || quiz; 
    try {
      setError('');
      // Start the quiz
      const startResponse = await fetch(`${API_BASE_URL}/quiz/${quizId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const startData = await startResponse.json();
      if (!startResponse.ok || !startData.success) {
        setError(startData.message || startData.error || 'Failed to start quiz');
        return;
      }

      // Fetch questions for each question set
      const questionsData: Record<number, Question[]> = {};
      for (const setOrder of order) {
        const res = await fetch(`${API_BASE_URL}/quiz/${quizId}/question-set/${setOrder}`);
        const data = await res.json();
        if (!res.ok || !data.success || !Array.isArray(data.questionSet?.questions)) {
          throw new Error(data.message || data.error || 'Failed to load questions');
        }
        questionsData[setOrder] = data.questionSet.questions;
      }

      setQuestionsBySetOrder(questionsData);

      // Set timer
      if (resolvedQuiz) {
        const totalSeconds = (resolvedQuiz.durationHours * 3600) + (resolvedQuiz.durationMinutes * 60) + resolvedQuiz.durationSeconds;
        const elapsedSeconds = startData.startedAt ? Math.floor((Date.now() - new Date(startData.startedAt).getTime()) / 1000) : 0;
        const remainingSeconds = Number.isSafeInteger(startData.remainingSeconds) && startData.remainingSeconds >= 0
          ? startData.remainingSeconds : Math.max(0, totalSeconds - Math.max(0, elapsedSeconds));
        setTimeRemaining(remainingSeconds);
        setTimerStarted(true);
      }

      setPhase('exam');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quiz');
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
    if (q) setAnswers({ ...answers, [q.id]: answer });
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

  const currentQuestion = getCurrentQuestion();
  const currentGlobalIndex = selectedOrder.slice(0, currentQuestionSetIndex)
    .reduce((sum, order) => sum + (questionsBySetOrder[order]?.length || 0), 0) + currentQuestionIndex;

  // Loading Phase
  if (phase === 'loading' || !quiz) {
    return (
      <div className="portal-utility min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <>
              <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <div className="mt-5 flex justify-center gap-3">
                <button onClick={() => { setError(''); void fetchQuizDetails(); }} className="rounded-lg bg-blue-700 px-4 py-2 text-white">Try again</button>
                <button onClick={() => router.push('/dashboard')} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700">Dashboard</button>
              </div>
            </>
          ) : (
            <>
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading quiz...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Order Selection Phase
  if (phase === 'order-selection') {
    return (
      <div className="portal-utility min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-4 py-4 sm:py-8 px-4 sm:px-6">
          <header className="bg-white border-b border-gray-200 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-10 w-24 flex items-center justify-center">
                <PortalLogo size={96} priority />
              </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">{quiz.title}</span>
            </div>
          </header>

          <main className="flex items-center justify-center px-2 sm:px-6 py-2">
            <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm p-4 sm:p-8">
              <h1 className="text-xl sm:text-2xl font-bold mb-2">{quiz.studentSelectsSubjects ? 'Prepare your mock exam' : 'Choose Your Question Order'}</h1>
              {quiz.studentSelectsSubjects ? <MockSubjectSelection subjects={quiz.questionSets.map((set) => ({ id: String(set.order), title: set.title, questionCount: set.questionCount }))} selectedIds={selectedOrder.map(String)} englishId={quiz.questionSets.find((set) => isEnglishSubject(set.title))?.order.toString()} disabled={loading}
                onToggle={(id) => setSelectedOrder((current) => current.includes(Number(id)) ? current.filter((value) => value !== Number(id)) : current.length < 4 ? [...current, Number(id)] : current)} /> : <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Use the controls to select the sequence you prefer.</p>}
              {quiz.studentSelectsSubjects && <p className="mb-4 text-sm text-gray-600">You can adjust the order of your selected subjects below.</p>}

              <div className="space-y-3 mb-6 sm:mb-8">
                {selectedOrder.map((order) => quiz.questionSets.find((set) => set.order === order)!).map((qs) => {
                  const position = selectedOrder.indexOf(qs.order);
                  return (
                    <div
                      key={qs.id}
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
                          disabled={position === selectedOrder.length - 1}
                          className="px-2 py-1 bg-gray-200 rounded text-xs disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
              <button
                onClick={handleSetOrder}
                disabled={loading || (quiz.studentSelectsSubjects && (selectedOrder.length !== 4 || !quiz.questionSets.some((set) => selectedOrder.includes(set.order) && isEnglishSubject(set.title))))}
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
  if (phase === 'submission-error') {
    return (
      <div className="portal-utility min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-lg font-bold text-gray-900">Unable to submit your exam</h1>
          <p className="mt-3 text-sm text-gray-600">{error}</p>
          <p className="mt-3 text-sm text-gray-600">Your answers are kept on this page. Retry when your connection is available.</p>
          <button onClick={() => void handleSubmitQuiz(true, submissionReason.current)} className="mt-5 rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white">Retry submission</button>
          <button onClick={() => router.push('/dashboard')} className="mt-3 block w-full text-sm text-gray-600">Back to dashboard</button>
        </div>
      </div>
    );
  }

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
    <div className="portal-utility min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-[76px] sm:h-10 sm:w-24 flex items-center justify-center">
              <PortalLogo size={96} priority />
            </div>
            <span className="font-semibold text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
              {quiz.title}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {quiz.displayCalculator && (
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
              onClick={() => setShowSubmitConfirmation(true)} disabled={isDisabled}
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
            {enforceFocus && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-600 bg-orange-50 px-2 sm:px-3 py-1 rounded-full">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Switching tabs or windows submits your exam</span>
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
                    className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all touch-manipulation ${answers[currentQuestion.id] === opt
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100 active:bg-gray-200'
                      }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span
                        className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${answers[currentQuestion.id] === opt
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
                    className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all touch-manipulation ${answers[currentQuestion.id] === opt
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100 active:bg-gray-200'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${answers[currentQuestion.id] === opt
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
                  value={answers[currentQuestion.id] || ''}
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

      {showSubmitConfirmation && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="submit-confirmation-title" className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 id="submit-confirmation-title" className="text-lg font-bold text-gray-900">Submit exam?</h2>
            <p className="mt-3 text-sm text-gray-600">You have answered {Object.keys(answers).length} of {getAllQuestions().length} questions.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowSubmitConfirmation(false)} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700">Keep working</button>
              <button onClick={() => void handleSubmitQuiz()} className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white">Submit exam</button>
            </div>
          </section>
        </div>
      )}

      {/* Calculator Widget */}
      {showCalculator && quiz.displayCalculator && (
        <CalculatorWidget onClose={() => setShowCalculator(false)} />
      )}
    </div>
  );
};

export default AssignedQuizPage;
