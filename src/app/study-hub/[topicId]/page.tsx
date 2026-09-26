'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Material = { id: string; title: string; type: 'text' | 'passage' | 'image' | 'youtube'; content: string; altText: string };
type TopicData = { topic: { id: string; name: string; subject: { title: string } }; materials: Material[]; questionCount: number; canTakeTest: boolean; attempts: { id: string; score: number; totalPoints: number; submittedAt: string }[] };

export default function StudyTopicPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const router = useRouter();
  const [data, setData] = useState<TopicData | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch(`/api/study-hub/topics/${topicId}`, { cache: 'no-store' }).then(async (response) => {
      const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Could not load topic'); setData(result);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load topic'));
  }, [topicId]);
  const start = async () => {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/study-hub/topics/${topicId}/start`, { method: 'POST' });
      const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Could not start test');
      router.push(`/study-hub/attempts/${result.attempt.id}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not start test'); setBusy(false); }
  };

  return <main className="portal-page min-h-screen px-4 py-8 text-[#17231e] sm:px-8"><div className="mx-auto max-w-3xl">
    <Link href="/study-hub" className="text-sm font-semibold text-[#15513e]">← Study Hub</Link>
    {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!data && !error && <p className="mt-6">Loading topic…</p>}
    {data && <><header className="mt-5 rounded-2xl bg-[#0d3b2e] p-7 text-white"><p className="text-xs uppercase tracking-widest text-[#bddac9]">{data.topic.subject.title}</p><h1 className="mt-2 text-3xl font-black">{data.topic.name}</h1><p className="mt-2 text-sm">Read the lesson in order, then test your understanding.</p></header>
      <div className="mt-6 space-y-5">{data.materials.map((item) => <section key={item.id} className="rounded-xl border border-[#dce5df] bg-white p-5"><h2 className="mb-3 text-lg font-bold">{item.title}</h2>{item.type === 'image' ? <img src={item.content} alt={item.altText} className="h-auto max-w-full rounded-lg" /> : item.type === 'youtube' ? <div className="aspect-video overflow-hidden rounded-lg"><iframe className="h-full w-full" src={item.content} title={item.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div> : <p className={`whitespace-pre-wrap text-sm leading-7 ${item.type === 'passage' ? 'border-l-4 border-[#aacdb8] pl-4 italic' : ''}`}>{item.content}</p>}</section>)}{!data.materials.length && <p className="rounded-xl bg-white p-5 text-sm text-slate-500">No published materials for this topic yet.</p>}</div>
      <section className="mt-7 rounded-xl border border-[#dce5df] bg-white p-6"><h2 className="text-xl font-black">Topic test</h2><p className="mt-2 text-sm text-slate-600">Each attempt draws {Math.min(40, data.questionCount)} random questions from this topic. Your result contributes to your dashboard analytics.</p><button onClick={() => void start()} disabled={!data.canTakeTest || busy} className="mt-4 rounded-lg bg-[#0d3b2e] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Preparing test…' : 'Start topic test'}</button>{!data.canTakeTest && <p className="mt-2 text-sm text-amber-700">This test opens after a material is published and the topic has at least 30 eligible questions.</p>}</section>
      {!!data.attempts.length && <section className="mt-6 rounded-xl border border-[#dce5df] bg-white p-5"><h2 className="font-bold">Recent results</h2><ul className="mt-3 space-y-2">{data.attempts.map((attempt) => <li key={attempt.id} className="flex justify-between text-sm"><span>{new Date(attempt.submittedAt).toLocaleDateString()}</span><Link className="font-bold text-[#15513e]" href={`/study-hub/attempts/${attempt.id}`}>{attempt.score}/{attempt.totalPoints} →</Link></li>)}</ul></section>}</>}
  </div></main>;
}
