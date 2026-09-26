'use client';

import CalculatorWidget from '@/components/cbt/CalculatorWidget';
import ExamWorkspace from '@/components/cbt/ExamWorkspace';
import SimulatorHeader from '@/components/cbt/SimulatorHeader';
import SubjectTestSelection from '@/components/cbt/SubjectTestSelection';
import { CbtQuestion, CbtQuestionSet } from '@/components/cbt/types';
import { Award, Clock3, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

const API_BASE_URL = '/api';
type Phase = 'selection' | 'exam' | 'result';
interface SubmissionResult { score: number; totalPoints: number; percentage: number; timeTaken: number; }
const formatTime = (seconds: number) => `${Math.floor(seconds / 3600)}:${Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

export default function SubjectTestPage() {
  const [phase, setPhase] = useState<Phase>('selection');
  const [questionSets, setQuestionSets] = useState<CbtQuestionSet[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [questions, setQuestions] = useState<CbtQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [sessionId, setSessionId] = useState('');
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (phase === 'selection') void fetchQuestionSets(); }, [phase]);
  useEffect(() => {
    if (phase !== 'exam') return;
    const timer = window.setInterval(() => setTimeRemaining((time) => Math.max(0, time - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);
  useEffect(() => {
    if (phase === 'exam' && timeRemaining === 0 && !submitting) void submit(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, phase, submitting]);

  const fetchQuestionSets = async () => {
    try {
      setLoading(true); setError('');
      const response = await fetch(`${API_BASE_URL}/cbt/question-sets`);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load subjects');
      if (!Array.isArray(data.questionSets) || !data.questionSets.length) throw new Error('No subjects have available questions yet.');
      setQuestionSets(data.questionSets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect to the server');
    } finally { setLoading(false); }
  };

  const start = async () => {
    if (loading || !selectedId) return;
    try {
      setLoading(true); setError('');
      const response = await fetch(`${API_BASE_URL}/cbt/start-single-subject`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionSetId: selectedId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to start the subject test');
      const selectedQuestions = data.session?.questionsBySet?.[selectedId];
      if (!data.session?.sessionId || !Array.isArray(selectedQuestions) || !selectedQuestions.length) {
        throw new Error('No questions are available for this subject.');
      }
      setSessionId(data.session.sessionId);
      setQuestions(selectedQuestions);
      setAnswers({}); setCurrentQuestionIndex(0); setTimeRemaining(data.session.durationSeconds); setPhase('exam');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start the subject test');
    } finally { setLoading(false); }
  };

  const submit = async (isAuto = false) => {
    if (submitting) return;
    if (!isAuto && !window.confirm(`Submit ${Object.keys(answers).length}/${questions.length} answered questions?`)) return;
    try {
      setSubmitting(true); setLoading(true); setError('');
      const response = await fetch(`${API_BASE_URL}/cbt/submit-single-subject`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })) }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to submit the subject test');
      setResult(data.submission); setPhase('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit the subject test');
    } finally { setLoading(false); setSubmitting(false); }
  };

  const reset = () => {
    setPhase('selection'); setSelectedId(''); setQuestions([]); setAnswers({}); setCurrentQuestionIndex(0);
    setTimeRemaining(3600); setResult(null); setSessionId(''); setShowCalculator(false); setError('');
  };

  if (phase === 'selection') return <div className="min-h-screen bg-[#f4f7f5]"><SimulatorHeader mode="setup" /><SubjectTestSelection questionSets={questionSets} selectedId={selectedId} loading={loading} error={error} onSelect={setSelectedId} onStart={() => void start()} /></div>;

  if (phase === 'result' && result) {
    const subject = questionSets.find((item) => item._id === selectedId)?.title || 'Subject Test';
    return <div className="min-h-screen bg-[#f4f7f5]"><SimulatorHeader mode="result" /><main className="mx-auto max-w-3xl px-4 py-8 sm:py-12"><section className="rounded-xl border border-[#dce5df] bg-white p-6 text-center shadow-[0_6px_20px_rgba(13,59,46,0.07)] sm:p-10"><span className="mx-auto grid size-20 place-items-center rounded-full bg-[#fff2d1] text-[#9a5a00]"><Award size={34} /></span><p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#a5660c]">Subject test complete</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#17231e]">{result.percentage}% score</h1><p className="mt-2 text-sm text-[#64726a]">Your {subject} result is ready.</p><div className="mt-7 grid gap-3 sm:grid-cols-3">{[[result.score, 'Your score'], [result.totalPoints, 'Total points'], [`${Math.floor(result.timeTaken / 60)}m`, 'Time taken']].map(([value, label]) => <div key={label as string} className="rounded-lg bg-[#edf3ef] p-4"><strong className="block text-2xl text-[#0d3b2e]">{value}</strong><small className="text-[11px] text-[#64726a]">{label}</small></div>)}</div><button onClick={reset} className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#0d3b2e] px-5 py-3 text-sm font-bold text-white hover:bg-[#14513c]"><RotateCcw size={16} />Take another subject test</button></section></main></div>;
  }

  const currentQuestion = questions[currentQuestionIndex] || null;
  return <div className="min-h-screen bg-[#f4f7f5]"><SimulatorHeader mode="exam" timer={formatTime(timeRemaining)} showCalculator={showCalculator} onCalculatorToggle={() => setShowCalculator((value) => !value)} onSubmit={() => void submit()} /><div className="border-b border-[#dce5df] bg-[#edf3ef] px-4 py-2 text-center text-xs font-bold text-[#15513e] sm:hidden"><Clock3 className="mr-1 inline size-4" />{formatTime(timeRemaining)} remaining</div>{error && <p className="mx-auto mt-4 max-w-7xl rounded-lg border border-[#f3c7b5] bg-[#fff0ec] px-4 py-3 text-xs font-bold text-[#a8451f]">{error}</p>}<ExamWorkspace questionSets={questionSets} selectedIds={[selectedId]} questionsBySet={{ [selectedId]: questions }} currentSetIndex={0} currentQuestionIndex={currentQuestionIndex} answers={answers} currentQuestion={currentQuestion} currentGlobalIndex={currentQuestionIndex} totalQuestions={questions.length} onSubjectChange={() => undefined} onQuestionChange={setCurrentQuestionIndex} onAnswer={(answer) => currentQuestion && setAnswers((current) => ({ ...current, [currentQuestion._id]: answer }))} onPrevious={() => setCurrentQuestionIndex((index) => Math.max(0, index - 1))} onNext={() => setCurrentQuestionIndex((index) => Math.min(questions.length - 1, index + 1))} />{loading && <div className="fixed inset-0 z-40 grid place-items-center bg-[#0d3b2e]/25 backdrop-blur-[1px]"><span className="rounded-lg bg-white px-5 py-4 text-sm font-bold text-[#0d3b2e] shadow-xl">Saving your test…</span></div>}{showCalculator && <CalculatorWidget onClose={() => setShowCalculator(false)} />}</div>;
}
