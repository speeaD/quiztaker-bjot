'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Clock, Calendar, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';
import CalculatorWidget from '@/components/CalculatorComponent';

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

const CBTSimulator = () => {
  const [phase, setPhase] = useState<'selection' | 'exam' | 'result'>('selection');
  const [showCalculator, setShowCalculator] = useState(false);
  const email = typeof window !== 'undefined' && localStorage.getItem('quizTakerEmail') 
    ? localStorage.getItem('quizTakerEmail') as string 
    : 'Guest';
  
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
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour for single subject
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  useEffect(() => {
    if (phase === 'selection') fetchQuestionSets();
  }, [phase]);

  useEffect(() => {
    if (phase !== 'exam' || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeRemaining]);

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

      // Start single subject session
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

      // Fetch questions
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
    if (!isAuto) {
      const confirmed = window.confirm(
        `You have answered ${Object.keys(answers).length} out of ${questions.length} questions. Do you want to submit?`
      );
      if (!confirmed) return;
    }

    try {
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
    }
  };

  // Selection Phase
  if (phase === 'selection') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-4 py-4 px-6">
          <DashboardHeader studentName={email} />
          
          <main className="flex items-center justify-center px-6 py-2">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <button 
                onClick={() => typeof window !== 'undefined' && window.history.back()} 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="font-medium">BACK</span>
              </button>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Select Subject
              </h1>
              <p className="text-gray-600 mb-8">
                Choose one subject to be tested on
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8">
                    {availableQuestionSets.map((qs) => {
                      const selected = selectedQuestionSetId === qs._id;
                      return (
                        <button
                          key={qs._id}
                          onClick={() => toggleQuestionSet(qs._id)}
                          className={`relative p-6 rounded-lg border-2 text-left transition-all ${
                            selected 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                              : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="font-semibold text-lg mb-2">{qs.title}</div>
                          <div className={`text-sm ${selected ? 'text-blue-100' : 'text-gray-500'}`}>
                            {qs.questionCount} questions • {qs.totalPoints} points
                          </div>
                          {selected && (
                            <div className="absolute top-4 right-4">
                              <Check className="w-6 h-6" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedQuestionSetId && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Duration:</strong> 1 hour • 
                        <strong className="ml-2">Subject:</strong>{' '}
                        {availableQuestionSets.find(qs => qs._id === selectedQuestionSetId)?.title}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleStartExam}
                    disabled={!selectedQuestionSetId || loading}
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                      selectedQuestionSetId && !loading
                        ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-sm' 
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
        <div className="max-w-4xl mx-auto space-y-4 py-8 px-6">
          <DashboardHeader studentName={email} />
          
          <main className="px-6 py-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center mb-6 ${
                percentageColor === 'green' ? 'bg-green-100' : 
                percentageColor === 'yellow' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className={`text-4xl font-bold ${
                  percentageColor === 'green' ? 'text-green-600' : 
                  percentageColor === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {submissionResult.percentage}%
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Exam Completed!
              </h1>
              <p className="text-gray-600 mb-8">
                Here are your results for {availableQuestionSets.find(qs => qs._id === selectedQuestionSetId)?.title}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {submissionResult.score}
                  </div>
                  <div className="text-sm text-gray-600">Your Score</div>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {submissionResult.totalPoints}
                  </div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {Math.floor(submissionResult.timeTaken / 60)}m
                  </div>
                  <div className="text-sm text-gray-600">Time Taken</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setPhase('selection');
                    setSelectedQuestionSetId('');
                    setAnswers({});
                    setCurrentQuestionIndex(0);
                    setQuestions([]);
                  }}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Take Another Exam
                </button>
                <button
                  onClick={() => typeof window !== 'undefined' && window.history.back()}
                  className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Back to Dashboard
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-bg rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
            <span className="font-semibold text-gray-900">BJOT Subject Simulator</span>
          </div>
          
              <CalculatorWidget  onClose={() => setShowCalculator(!showCalculator)}/>
         
          <button 
            onClick={() => handleSubmit()} 
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Submit
          </button>
        </div>
      </header>

      {/* Timer Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-6">
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <Clock className="w-5 h-5" />
            <span className="text-lg">{formatTime(timeRemaining)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">
              {availableQuestionSets.find(qs => qs._id === selectedQuestionSetId)?.title}
            </span>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {currentQuestion ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Question Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {availableQuestionSets.find(qs => qs._id === selectedQuestionSetId)?.title}
              </h2>
              <span className="text-sm font-semibold text-gray-500">
                Question {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>

            {/* Question Text */}
            <div className="mb-8">
              <p className="text-lg text-gray-900 leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {(currentQuestion.options || []).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(opt)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestion._id] === opt 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      answers[currentQuestion._id] === opt 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-gray-900 pt-1">{opt}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading question...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CBTSimulator;