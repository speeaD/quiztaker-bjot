/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
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
  const [phase, setPhase] = useState< 'selection' | 'exam' | 'result'>('selection');
  const [showCalculator, setShowCalculator] = useState(false);
  const email = typeof window !== 'undefined' && localStorage.getItem('quizTakerEmail') 
    ? localStorage.getItem('quizTakerEmail') as string 
    : 'Guest';
  const [loading, setLoading] = useState(false);
  const [ , setError] = useState('');
  const [availableQuestionSets, setAvailableQuestionSets] = useState<QuestionSet[]>([]);
  const [selectedQuestionSetIds, setSelectedQuestionSetIds] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [quizTakerId, setQuizTakerId] = useState('');
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [questionsBySetId, setQuestionsBySetId] = useState<Record<string, Question[]>>({});
  const [currentQuestionSetIndex, setCurrentQuestionSetIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(7200);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const maxSubjects = 4;

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
      const response = await fetch(`${API_BASE_URL}/cbt/question-sets`);
      const data = await response.json();
      if (data.success) {
        setAvailableQuestionSets(data.questionSets);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = () => {
    if (email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('');
      setPhase('selection');
    } else {
      setError('Please enter a valid email');
    }
  };

  const toggleQuestionSet = (id: string) => {
    if (selectedQuestionSetIds.includes(id)) {
      setSelectedQuestionSetIds(selectedQuestionSetIds.filter(x => x !== id));
    } else if (selectedQuestionSetIds.length < maxSubjects) {
      setSelectedQuestionSetIds([...selectedQuestionSetIds, id]);
    }
  };

  const handleStartExam = async () => {
    if (selectedQuestionSetIds.length !== maxSubjects) return;
    try {
      setLoading(true);
      const sessionResponse = await fetch(`${API_BASE_URL}/cbt/start-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionSetIds: selectedQuestionSetIds, email }),
      });
      console.log('sessionResponse', sessionResponse);
      const sessionData = await sessionResponse.json();
      if (!sessionData.success) {
        setError(sessionData.message);
        setLoading(false);
        return;
      }
      setSessionId(sessionData.session.sessionId);
      setQuizTakerId(sessionData.session.quizTakerId);
      setStartedAt(new Date(sessionData.session.startedAt));

      const questionsData: Record<string, Question[]> = {};
      for (const id of selectedQuestionSetIds) {
        const res = await fetch(`${API_BASE_URL}/cbt/question-set/${id}/questions`);
        const data = await res.json();
        if (data.success) questionsData[id] = data.questionSet.questions;
      }
      setQuestionsBySetId(questionsData);
      setPhase('exam');
    } catch (err) {
      setError('Error starting exam');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentQuestions = () => questionsBySetId[selectedQuestionSetIds[currentQuestionSetIndex]] || [];
  const getCurrentQuestion = () => getCurrentQuestions()[currentQuestionIndex] || null;
  const getAllQuestions = () => selectedQuestionSetIds.flatMap(id => questionsBySetId[id] || []);

  const handleOptionSelect = (answer: string) => {
    const q = getCurrentQuestion();
    if (q) setAnswers({ ...answers, [q._id]: answer });
  };

  const handleNext = () => {
    const questions = getCurrentQuestions();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentQuestionSetIndex < selectedQuestionSetIds.length - 1) {
      setCurrentQuestionSetIndex(currentQuestionSetIndex + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentQuestionSetIndex > 0) {
      setCurrentQuestionSetIndex(currentQuestionSetIndex - 1);
      const prevId = selectedQuestionSetIds[currentQuestionSetIndex - 1];
      setCurrentQuestionIndex((questionsBySetId[prevId] || []).length - 1);
    }
  };

  const handleSubmit = async (isAuto = false) => {
    const all = getAllQuestions();
    if (!isAuto && !window.confirm(`Submit ${Object.keys(answers).length}/${all.length} answered?`)) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/cbt/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          quizTakerId,
          questionSetIds: selectedQuestionSetIds,
          answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
          startedAt: startedAt?.toISOString(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSubmissionResult(data.submission);
        setPhase('result');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error submitting');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = getCurrentQuestion();
  const currentGlobalIndex = selectedQuestionSetIds.slice(0, currentQuestionSetIndex)
    .reduce((sum, id) => sum + (questionsBySetId[id]?.length || 0), 0) + currentQuestionIndex;

  

  if (phase === 'selection') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-4 py-8 px-6">
        <DashboardHeader studentName={email} />
        <main className="flex items-center justify-center px-6 py-2">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm p-8">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-600 mb-6">
              <ChevronLeft className="w-4 h-4" />BACK
            </button>
            <h1 className="text-2xl font-bold mb-2">Select {maxSubjects} Subjects</h1>
            <p className="text-gray-600 mb-8">Choose subjects to be tested on</p>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {availableQuestionSets.map((qs) => {
                    const selected = selectedQuestionSetIds.includes(qs._id);
                    const disabled = !selected && selectedQuestionSetIds.length >= maxSubjects;
                    return (
                      <button
                        key={qs._id}
                        onClick={() => toggleQuestionSet(qs._id)}
                        disabled={disabled}
                        className={`relative p-4 rounded-lg border-2 text-left ${
                          selected ? 'bg-blue-600 border-blue-600 text-white' :
                          disabled ? 'bg-gray-50 border-gray-200 text-gray-400' :
                          'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">{qs.title}</div>
                        <div className={`text-sm ${selected ? 'text-blue-100' : 'text-gray-500'}`}>
                          {qs.questionCount} questions
                        </div>
                        {selected && <Check className="w-5 h-5 absolute top-3 right-3" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-center text-sm text-gray-600 mb-6">
                  {selectedQuestionSetIds.length} of {maxSubjects} selected
                </p>
                <button
                  onClick={handleStartExam}
                  disabled={selectedQuestionSetIds.length !== maxSubjects || loading}
                  className={`w-full py-4 rounded-lg font-semibold text-lg ${
                    selectedQuestionSetIds.length === maxSubjects ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-blue-400 text-white cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Starting...' : 'Start Exam'}
                </button>
              </>
            )}
          </div>
        </main>
        </div>
      </div>
    );
  }

  if (phase === 'result' && submissionResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-4 py-8 px-6">
        <DashboardHeader studentName={email} />
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 ${
              submissionResult.percentage >= 70 ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <span className={`text-3xl font-bold ${
                submissionResult.percentage >= 70 ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {submissionResult.percentage}%
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Exam Completed!</h1>
            <p className="text-gray-600 mb-8">Here are your results</p>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{submissionResult.score}</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{submissionResult.totalPoints}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{Math.floor(submissionResult.timeTaken / 60)}m</div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Take Another Exam
            </button>
          </div>
        </main>
        </div>
      </div>
    );
  }

  // Exam Phase
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-bg rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
            <span className="font-semibold">BJOT CBT Simulator</span>
          </div>
          <CalculatorWidget  onClose={() => setShowCalculator(!showCalculator)}/>
          <button onClick={() => handleSubmit()} className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700">
            Submit
          </button>
        </div>
      </header>
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-6">
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <Clock className="w-5 h-5" />
            <span className="text-lg">{formatTime(timeRemaining)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>
      <div className="bg-blue-900">
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {selectedQuestionSetIds.map((id, i) => {
            const qs = availableQuestionSets.find(q => q._id === id);
            return (
              <button
                key={id}
                onClick={() => { setCurrentQuestionSetIndex(i); setCurrentQuestionIndex(0); }}
                className={`px-6 py-3 font-medium ${
                  currentQuestionSetIndex === i ? 'bg-blue-700 text-white' : 'bg-blue-900 text-blue-200 hover:bg-blue-800'
                }`}
              >
                {qs?.title}
              </button>
            );
          })}
        </div>
      </div>
      <main className="max-w-4xl mx-auto px-6 py-8">
        {currentQuestion && (
          <div className="bg-white rounded-lg shadow-sm  p-8">
            <div className="flex justify-between mb-6 pb-4 border-b">
              <h2 className="text-sm font-semibold text-gray-500 uppercase">
                {availableQuestionSets.find(qs => qs._id === selectedQuestionSetIds[currentQuestionSetIndex])?.title}
              </h2>
              <span className="text-sm font-semibold text-gray-500">
                {currentGlobalIndex + 1} / {getAllQuestions().length}
              </span>
            </div>
            <p className="text-lg mb-8">{currentQuestion.question}</p>
            <div className="space-y-3 mb-8">
              {(currentQuestion.options || []).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(opt)}
                  className={`w-full text-left p-4 rounded-lg border-2 ${
                    answers[currentQuestion._id] === opt ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      answers[currentQuestion._id] === opt ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="pt-1">{opt}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-between pt-4 border-t">
              <button
                onClick={handlePrev}
                disabled={currentQuestionSetIndex === 0 && currentQuestionIndex === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-lg border text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />Prev
              </button>
              <button
                onClick={handleNext}
                disabled={currentQuestionSetIndex === selectedQuestionSetIds.length - 1 && currentQuestionIndex === getCurrentQuestions().length - 1}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Next<ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CBTSimulator;