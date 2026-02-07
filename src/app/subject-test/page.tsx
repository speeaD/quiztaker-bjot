/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, Check, Loader2, Calculator, XCircle } from 'lucide-react';

const API_BASE_URL = 'https://bjot-backend.vercel.app/api';

interface QuestionSet {
  _id: string;
  title: string;
  questionCount: number;
  totalPoints: number;
}

interface Question {
  _id: string;
  type: string;
  question: string;
  options?: string[];
  points: number;
  order: number;
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

const CBTSimulator = () => {
  const [phase, setPhase] = useState<'selection' | 'exam' | 'result'>('selection');
  const [showCalculator, setShowCalculator] = useState(false);
  const email = 'student@example.com'; // Replace with actual email logic
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableQuestionSets, setAvailableQuestionSets] = useState<QuestionSet[]>([]);
  const [selectedQuestionSetId, setSelectedQuestionSetId] = useState<string>('');
  const [sessionId, setSessionId] = useState('');
  const [quizTakerId, setQuizTakerId] = useState('');
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Fixed: Added to prevent duplicate submissions

  useEffect(() => {
    if (phase === 'selection') fetchQuestionSets();
  }, [phase]);

  useEffect(() => {
    if (phase !== 'exam') return; // Fixed: Removed timeRemaining from dependencies
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0; // Fixed: Just return 0, handle submission separately
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]); // Fixed: Only depend on phase

  // Fixed: Separate effect to handle auto-submit when timer reaches 0
  useEffect(() => {
    if (phase === 'exam' && timeRemaining === 0 && !isSubmitting) {
      handleSubmit(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, phase, isSubmitting]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchQuestionSets = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/cbt/question-sets`);
      const data = await response.json();
      if (data.success) {
        setAvailableQuestionSets(data.questionSets);
      } else {
        setError(data.message || 'Failed to load subjects');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionSet = (id: string) => {
    setSelectedQuestionSetId(id === selectedQuestionSetId ? '' : id);
  };

  const handleStartExam = async () => {
    if (!selectedQuestionSetId) return;
    
    try {
      setLoading(true);
      setError('');

      const sessionResponse = await fetch(`${API_BASE_URL}/cbt/start-single-subject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          questionSetId: selectedQuestionSetId, 
          email 
        }),
      });

      const sessionData = await sessionResponse.json();
      
      if (!sessionData.success) {
        setError(sessionData.message || 'Failed to start exam');
        setLoading(false);
        return;
      }

      setSessionId(sessionData.session.sessionId);
      setQuizTakerId(sessionData.session.quizTakerId);
      setStartedAt(new Date(sessionData.session.startedAt));

      const questionsResponse = await fetch(
        `${API_BASE_URL}/cbt/question-set/${selectedQuestionSetId}/questions`
      );
      const questionsData = await questionsResponse.json();
      
      if (questionsData.success) {
        setQuestions(questionsData.questionSet.questions);
        setPhase('exam');
      } else {
        setError('Failed to load questions');
      }
    } catch (err) {
      setError('Error starting exam');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex] || null;

  const handleOptionSelect = (answer: string) => {
    if (currentQuestion) {
      setAnswers({ ...answers, [currentQuestion._id]: answer });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async (isAuto = false) => {
    if (isSubmitting) return; // Fixed: Prevent duplicate submissions
    
    if (!isAuto) {
      const confirmed = window.confirm(
        `You have answered ${Object.keys(answers).length} out of ${questions.length} questions. Do you want to submit?`
      );
      if (!confirmed) return;
    }

    try {
      setIsSubmitting(true); // Fixed: Set submitting flag
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/cbt/submit-single-subject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          quizTakerId,
          questionSetId: selectedQuestionSetId,
          answers: Object.entries(answers).map(([questionId, answer]) => ({ 
            questionId, 
            answer 
          })),
          startedAt: startedAt?.toISOString(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSubmissionResult(data.submission);
        setPhase('result');
      } else {
        setError(data.message || 'Failed to submit exam');
      }
    } catch (err) {
      setError('Error submitting exam');
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setIsSubmitting(false); // Fixed: Clear submitting flag
    }
  };

  // Selection Phase
  if (phase === 'selection') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-4 py-4 px-4 sm:px-6">
          <header className="bg-white border-b border-gray-200 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-bg rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">BJOT CBT Simulator</span>
            </div>
          </header>
          
          <main className="flex items-center justify-center px-2 sm:px-6 py-2">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Select Subject
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                Choose one subject to be tested on
              </p>

              {error && (
                <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 sm:mb-8">
                    {availableQuestionSets.map((qs) => {
                      const selected = selectedQuestionSetId === qs._id;
                      return (
                        <button
                          key={qs._id}
                          onClick={() => toggleQuestionSet(qs._id)}
                          className={`relative p-4 sm:p-6 rounded-lg border-2 text-left transition-all touch-manipulation ${
                            selected 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                              : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100'
                          }`}
                        >
                          <div className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{qs.title}</div>
                          <div className={`text-xs sm:text-sm ${selected ? 'text-blue-100' : 'text-gray-500'}`}>
                            {qs.questionCount} questions • {qs.totalPoints} points
                          </div>
                          {selected && (
                            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                              <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedQuestionSetId && (
                    <div className="mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs sm:text-sm text-blue-900">
                        <strong>Duration:</strong> 1 hour • 
                        <strong className="ml-2">Subject:</strong>{' '}
                        {availableQuestionSets.find(qs => qs._id === selectedQuestionSetId)?.title}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleStartExam}
                    disabled={!selectedQuestionSetId || loading}
                    className={`w-full py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all touch-manipulation ${
                      selectedQuestionSetId && !loading
                        ? 'bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900 shadow-sm' 
                        : 'bg-blue-300 text-white cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Starting...
                      </span>
                    ) : (
                      'Start Exam'
                    )}
                  </button>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Result Phase
  if (phase === 'result' && submissionResult) {
    const percentageColor = 
      submissionResult.percentage >= 70 ? 'green' : 
      submissionResult.percentage >= 50 ? 'yellow' : 'red';

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-4 py-4 sm:py-8 px-4 sm:px-6">
          <header className="bg-white border-b border-gray-200 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg"></div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">BJOT CBT Simulator</span>
            </div>
          </header>
          
          <main className="px-2 sm:px-6 py-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
              <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto flex items-center justify-center mb-4 sm:mb-6 ${
                percentageColor === 'green' ? 'bg-green-100' : 
                percentageColor === 'yellow' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className={`text-3xl sm:text-4xl font-bold ${
                  percentageColor === 'green' ? 'text-green-600' : 
                  percentageColor === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {submissionResult.percentage}%
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Exam Completed!
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                Here are your results for {availableQuestionSets.find(qs => qs._id === selectedQuestionSetId)?.title}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="p-4 sm:p-6 bg-gray-50 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {submissionResult.score}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Your Score</div>
                </div>
                <div className="p-4 sm:p-6 bg-gray-50 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {submissionResult.totalPoints}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Total Points</div>
                </div>
                <div className="p-4 sm:p-6 bg-gray-50 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {Math.floor(submissionResult.timeTaken / 60)}m
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Time Taken</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={() => {
                    // Fixed: Complete state reset
                    setPhase('selection');
                    setSelectedQuestionSetId('');
                    setAnswers({});
                    setCurrentQuestionIndex(0);
                    setQuestions([]);
                    setTimeRemaining(3600); // Fixed: Reset timer
                    setSubmissionResult(null); // Fixed: Clear results
                    setSessionId(''); // Fixed: Clear session
                    setQuizTakerId(''); // Fixed: Clear quiz taker
                    setStartedAt(null); // Fixed: Clear start time
                    setError(''); // Fixed: Clear errors
                    setLoading(false); // Fixed: Reset loading
                    setShowCalculator(false); // Fixed: Close calculator
                    setIsSubmitting(false); // Fixed: Reset submitting flag
                  }}
                  className="bg-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
                >
                  Take Another Exam
                </button>
              </div>
            </div>
          </main>
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
            <div className="w-10 h-10 bg-blue-bg rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
            <span className="font-semibold text-gray-900 text-sm sm:text-base">BJOT CBT</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setShowCalculator(!showCalculator)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors ${
                showCalculator 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Calculator</span>
            </button>
            <button 
              onClick={() => handleSubmit()} 
              disabled={loading || isSubmitting} 
              className="bg-red-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </div>
      </header>

      {/* Timer Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3 flex flex-wrap gap-3 sm:gap-6">
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-base sm:text-lg">{formatTime(timeRemaining)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-xs sm:text-sm">
              {availableQuestionSets.find(qs => qs._id === selectedQuestionSetId)?.title}
            </span>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {currentQuestion ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
            {/* Question Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 gap-2">
              <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {availableQuestionSets.find(qs => qs._id === selectedQuestionSetId)?.title}
              </h2>
              <span className="text-xs sm:text-sm font-semibold text-gray-500">
                Question {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>

            {/* Question Text */}
            <div className="mb-6 sm:mb-8">
              <p className="text-base sm:text-lg text-gray-900 leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              {(currentQuestion.options || []).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(opt)}
                  className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all touch-manipulation ${
                    answers[currentQuestion._id] === opt 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
                      answers[currentQuestion._id] === opt 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-gray-900 pt-0.5 sm:pt-1 text-sm sm:text-base">{opt}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-3 sm:pt-4 border-t border-gray-200 gap-2">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-xs sm:text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Previous</span>
                <span className="xs:hidden">Prev</span>
              </button>
              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 rounded-lg bg-blue-600 text-white font-medium text-xs sm:text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
              >
                <span>Next</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">Loading question...</p>
          </div>
        )}
      </main>

      {/* Calculator Widget */}
      {showCalculator && <CalculatorWidget onClose={() => setShowCalculator(false)} />}
    </div>
  );
};

export default CBTSimulator;