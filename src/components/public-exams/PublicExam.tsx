'use client';

import ExamWorkspace from '@/components/cbt/ExamWorkspace';
import SimulatorHeader from '@/components/cbt/SimulatorHeader';
import type { CbtQuestion, CbtQuestionSet } from '@/components/cbt/types';
import { useCallback, useEffect, useRef, useState } from 'react';

type Result = { score: number; totalPoints: number; percentage: number };
type Mode = 'mock' | 'topic';
type MockResponse = { session: { id: string; title: string; durationSeconds: number; questionsBySet: Record<string, CbtQuestion[]> } };
type TopicResponse = { topic: { id: string; name: string }; questionSet: CbtQuestionSet; questions: CbtQuestion[] };

async function api<T>(path: string, body?: object): Promise<T> {
  const response = await fetch(`/api/public-exams/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data: { success?: boolean; message?: string } = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message || 'Unable to complete this request');
  return data as T;
}

export default function PublicExam({ mode, topicId, questionSetId, topic }: { mode: Mode; topicId?: string; questionSetId?: string; topic?: string }) {
  const [phase, setPhase] = useState<'setup' | 'exam' | 'result'>('setup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sets, setSets] = useState<CbtQuestionSet[]>([]);
  const [combinations, setCombinations] = useState<string[][]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [topicData, setTopicData] = useState<TopicResponse | null>(null);
  const [questionsBySet, setQuestionsBySet] = useState<Record<string, CbtQuestion[]>>({});
  const [sessionId, setSessionId] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [setIndex, setSetIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [gradedResult, setGradedResult] = useState<Result | null>(null);
  const [countsForGrade, setCountsForGrade] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const autoSubmitted = useRef(false);

  useEffect(() => {
    let active = true;
    if (mode === 'mock') {
      api<{ questionSets: CbtQuestionSet[]; availableCombinations: string[][] }>('question-sets')
        .then((data) => { if (active) { setSets(data.questionSets || []); setCombinations(data.availableCombinations || []); } })
        .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unable to load free mocks'); })
        .finally(() => { if (active) setLoading(false); });
    } else {
      const query = topicId ? new URLSearchParams({ topicId }) : questionSetId && topic ? new URLSearchParams({ questionSetId, topic }) : null;
      if (!query) { setError('This topic test link is incomplete.'); setLoading(false); return; }
      api<TopicResponse>(`topic/questions?${query}`)
        .then((data) => { if (active) setTopicData(data); })
        .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unable to load topic test'); })
        .finally(() => { if (active) setLoading(false); });
    }
    return () => { active = false; };
  }, [mode, topicId, questionSetId, topic]);

  useEffect(() => {
    if (phase !== 'exam') return;
    const timer = window.setInterval(() => setSeconds((remaining) => Math.max(remaining - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const submit = useCallback(async (automatic = false) => {
    if (busy || phase !== 'exam') return;
    const total = Object.values(questionsBySet).reduce((sum, questions) => sum + questions.length, 0);
    if (!automatic && !window.confirm(`Submit ${Object.keys(answers).length}/${total} answered questions?`)) return;
    setBusy(true); setError('');
    try {
      const payload = { answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })) };
      if (mode === 'mock') {
        const data = await api<{ attempt: Result; gradedResult: Result; countsForGrade: boolean }>(`mock/sessions/${encodeURIComponent(sessionId)}/submit`, payload);
        setResult(data.attempt); setGradedResult(data.gradedResult); setCountsForGrade(data.countsForGrade);
      } else {
        const data = await api<{ result: Result }>('topic/submit', { ...payload, topicId: topicData?.topic.id });
        setResult(data.result);
      }
      setPhase('result');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to submit'); }
    finally { setBusy(false); }
  }, [answers, busy, mode, phase, questionsBySet, sessionId, topicData]);

  useEffect(() => {
    if (phase === 'exam' && seconds === 0 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      void submit(true);
    }
  }, [phase, seconds, submit]);

  const start = async () => {
    if (busy || loading) return;
    setError('');
    if (mode === 'mock') {
      if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || selected.length !== 4) {
        setError('Enter your name, a valid email, and exactly four subjects.'); return;
      }
      if (!combinations.some((combo) => combo.length === 4 && combo.every((id) => selected.includes(id)))) {
        setError('No free mock is available for this subject combination. Choose a different set of subjects.'); return;
      }
    } else if (!topicData?.questions.length) { setError('No questions are available for this topic.'); return; }
    setBusy(true);
    try {
      if (mode === 'mock') {
        const data = await api<MockResponse>('mock/sessions', { name: name.trim(), email: email.trim().toLowerCase(), questionSetIds: selected });
        if (!data.session?.id || selected.some((id) => !data.session.questionsBySet?.[id]?.length)) throw new Error('The exam has no questions for one or more selected subjects.');
        setSessionId(data.session.id);
        setQuestionsBySet(data.session.questionsBySet);
        setSeconds(data.session.durationSeconds || 7200);
      } else if (topicData) {
        setSets([topicData.questionSet]);
        setSelected([topicData.questionSet._id]);
        setQuestionsBySet({ [topicData.questionSet._id]: topicData.questions });
        setSeconds(Math.max(600, topicData.questions.length * 90));
      }
      autoSubmitted.current = false; setAnswers({}); setSetIndex(0); setQuestionIndex(0); setResult(null); setPhase('exam');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to start the test'); }
    finally { setBusy(false); }
  };

  const activeId = selected[setIndex];
  const activeQuestions = questionsBySet[activeId] || [];
  const current = activeQuestions[questionIndex] || null;
  const totalQuestions = selected.reduce((sum, id) => sum + (questionsBySet[id]?.length || 0), 0);
  const globalIndex = selected.slice(0, setIndex).reduce((sum, id) => sum + (questionsBySet[id]?.length || 0), 0) + questionIndex;
  const homeHref = mode === 'mock' ? '/free-mock' : '/';

  return <div className="min-h-screen bg-[#f4f7f5]">
    <SimulatorHeader mode={phase === 'setup' ? 'setup' : phase} homeHref={homeHref} homeLabel={mode === 'mock' ? 'Free mock' : 'Home'} timer={`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`} onSubmit={() => void submit()} />
    {error && <p role="alert" className="mx-auto mt-4 max-w-5xl rounded-lg bg-[#fff0ec] p-4 text-sm text-[#a8451f]">{error}</p>}
    {phase === 'setup' && <main className="mx-auto max-w-5xl px-4 py-8">
      <section className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-black text-[#17231e]">{mode === 'mock' ? 'Free public mock exam' : `${topicData?.topic.name || 'Topic'} test`}</h1>
        <p className="mt-2 text-sm text-[#64726a]">{mode === 'mock' ? 'Enter your details and choose four subjects. Your first completed score for this mock is the graded score.' : 'Answer questions from the lesson, then see your score.'}</p>
        {loading && <p className="mt-6 text-sm text-[#64726a]">Loading available questions…</p>}
        {mode === 'mock' && !loading && sets.length === 0 && <p className="mt-6 text-sm text-[#64726a]">No free mock is available right now.</p>}
        {mode === 'mock' && sets.length > 0 && <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold">Full name<input className="mt-2 w-full rounded-md border border-[#c9d8cf] p-3 font-normal" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>
            <label className="text-sm font-bold">Email<input className="mt-2 w-full rounded-md border border-[#c9d8cf] p-3 font-normal" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
          </div>
          <p className="mt-6 text-sm font-bold">Subjects selected: {selected.length}/4</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">{sets.map((set) => <button type="button" key={set._id} aria-pressed={selected.includes(set._id)} disabled={!selected.includes(set._id) && selected.length === 4} onClick={() => setSelected((current) => current.includes(set._id) ? current.filter((id) => id !== set._id) : [...current, set._id])} className={`rounded-lg border p-4 text-left text-sm font-bold disabled:opacity-40 ${selected.includes(set._id) ? 'border-[#0d3b2e] bg-[#edf7f0]' : 'border-[#dce5df]'}`}>{set.title}</button>)}</div>
        </>}
        {mode === 'topic' && topicData && <p className="mt-6 text-sm text-[#64726a]">{topicData.questionSet.title} · {topicData.questions.length} questions</p>}
        <button type="button" disabled={busy || loading || (mode === 'mock' ? sets.length === 0 || selected.length !== 4 : !topicData)} onClick={() => void start()} className="mt-6 rounded-md bg-[#0d3b2e] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Preparing…' : 'Start test'}</button>
      </section>
    </main>}
    {phase === 'exam' && <><ExamWorkspace questionSets={sets} selectedIds={selected} questionsBySet={questionsBySet} currentSetIndex={setIndex} currentQuestionIndex={questionIndex} answers={answers} currentQuestion={current} currentGlobalIndex={globalIndex} totalQuestions={totalQuestions} onSubjectChange={(index) => { setSetIndex(index); setQuestionIndex(0); }} onQuestionChange={setQuestionIndex} onAnswer={(answer) => current && setAnswers((prior) => ({ ...prior, [current._id]: answer }))} onPrevious={() => { if (questionIndex) setQuestionIndex(questionIndex - 1); else if (setIndex) { setSetIndex(setIndex - 1); setQuestionIndex((questionsBySet[selected[setIndex - 1]] || []).length - 1); } }} onNext={() => { if (questionIndex < activeQuestions.length - 1) setQuestionIndex(questionIndex + 1); else if (setIndex < selected.length - 1) { setSetIndex(setIndex + 1); setQuestionIndex(0); } }} />{busy && <p className="text-center text-sm">Submitting your test…</p>}</>}
    {phase === 'result' && result && <main className="mx-auto max-w-2xl px-4 py-12"><section className="rounded-xl bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-black">Test complete</h1><p className="mt-5 text-4xl font-black text-[#0d3b2e]">{result.percentage}%</p><p className="mt-2 text-sm">This attempt: {result.score}/{result.totalPoints} points</p>{mode === 'mock' && gradedResult && <p className="mt-4 rounded-lg bg-[#edf7f0] p-4 text-sm font-bold">{countsForGrade ? 'This is your graded first score.' : `Your first score remains graded: ${gradedResult.score}/${gradedResult.totalPoints} (${gradedResult.percentage}%).`}</p>}<button type="button" onClick={() => { setResult(null); setPhase('setup'); }} className="mt-7 rounded-md bg-[#0d3b2e] px-5 py-3 text-sm font-bold text-white">{mode === 'mock' ? 'Retake exam' : 'Retry topic test'}</button></section></main>}
  </div>;
}
