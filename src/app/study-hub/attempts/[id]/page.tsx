'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Question = { _id: string; type: string; question: string; passage: string; diagram: string | null; diagramAlt: string; options: string[]; points: number };
type Attempt = { id: string; topic?: string; subject?: string; questions?: Question[]; submittedAt?: string; score?: number; totalPoints?: number; percentage?: number };

export default function StudyAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch(`/api/study-hub/attempts/${id}`, { cache: 'no-store' }).then(async (response) => {
      const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Could not load test'); setAttempt(data.attempt);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load test'));
  }, [id]);
  const submit = async () => {
    if (!window.confirm(`Submit ${Object.keys(answers).length} of ${attempt?.questions?.length || 0} answered questions?`)) return;
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/study-hub/attempts/${id}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })) }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Could not submit test');
      setAttempt({ id, submittedAt: new Date().toISOString(), ...data.result });
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not submit test'); }
    finally { setBusy(false); }
  };

  return <main className="portal-page min-h-screen px-4 py-8 text-[#17231e] sm:px-8"><div className="mx-auto max-w-3xl"><Link href="/study-hub" className="text-sm font-semibold text-[#15513e]">← Study Hub</Link>
    {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!attempt && !error && <p className="mt-6">Loading test…</p>}
    {attempt?.submittedAt ? <section className="mt-6 rounded-xl bg-white p-8 text-center"><h1 className="text-2xl font-black">Topic test complete</h1><p className="mt-4 text-4xl font-black text-[#0d3b2e]">{attempt.percentage}%</p><p className="mt-2 text-sm">{attempt.score} of {attempt.totalPoints} points</p><Link href="/dashboard" className="mt-6 inline-block rounded-lg bg-[#0d3b2e] px-5 py-2.5 text-sm font-bold text-white">View dashboard analytics</Link></section> : attempt?.questions && <><header className="mt-6 rounded-xl bg-[#0d3b2e] p-6 text-white"><p className="text-sm">{attempt.subject} · {attempt.topic}</p><h1 className="mt-2 text-2xl font-black">Topic test</h1><p className="mt-2 text-sm">{attempt.questions.length} questions · {Object.keys(answers).length} answered</p></header><div className="mt-5 space-y-4">{attempt.questions.map((question, index) => <fieldset key={question._id} className="rounded-xl border border-[#dce5df] bg-white p-5"><legend className="sr-only">Question {index + 1}</legend><p className="mb-2 text-xs font-bold text-[#15513e]">Question {index + 1} · {question.points} point{question.points === 1 ? '' : 's'}</p>{question.passage && <p className="mb-3 whitespace-pre-wrap border-l-4 border-[#aacdb8] pl-3 text-sm">{question.passage}</p>}{question.diagram && <img src={question.diagram} alt={question.diagramAlt || 'Question diagram'} className="mb-3 max-w-full rounded-lg" />}<p className="mb-4 font-semibold">{question.question}</p>{question.options.length ? <div className="space-y-2">{question.options.map((option) => <label key={option} className="flex cursor-pointer gap-2 rounded-lg border border-slate-200 p-3 text-sm"><input type="radio" name={question._id} checked={answers[question._id] === option} onChange={() => setAnswers({ ...answers, [question._id]: option })} />{option}</label>)}</div> : <input className="w-full rounded-lg border border-slate-300 p-3 text-sm" aria-label={`Answer question ${index + 1}`} value={answers[question._id] || ''} onChange={(event) => setAnswers({ ...answers, [question._id]: event.target.value })} />}</fieldset>)}</div><button disabled={busy} onClick={() => void submit()} className="mt-6 rounded-lg bg-[#0d3b2e] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Submitting…' : 'Submit test'}</button></>}
  </div></main>;
}
