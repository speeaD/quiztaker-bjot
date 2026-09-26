'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';

type Topic = { id: string; name: string; _count: { studyMaterials: number; questions: number } };
type Subject = { id: string; title: string; topics: Topic[] };

export default function StudyHubPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    fetch('/api/study-hub/subjects', { cache: 'no-store' }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not load the study hub');
      setSubjects(data.subjects || []);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load the study hub')).finally(() => setLoading(false));
  }, []);

  return <main className="portal-page min-h-screen px-4 py-8 text-[#17231e] sm:px-8"><div className="mx-auto max-w-5xl">
    <Link href="/dashboard" className="text-sm font-semibold text-[#15513e]">← Dashboard</Link>
    <header className="mt-5 rounded-2xl bg-[#0d3b2e] p-7 text-white"><BookOpen className="mb-3" /><h1 className="text-3xl font-black">Study Hub</h1><p className="mt-2 text-sm text-[#d8e6de]">Read your topic materials, then practise with 30–40 random questions.</p></header>
    {loading && <p className="mt-6 text-sm">Loading your subjects…</p>}
    {error && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!loading && !error && !subjects.length && <p className="mt-6 rounded-xl bg-white p-6 text-sm">No subjects are assigned to your account yet.</p>}
    <div className="mt-6 space-y-5">{subjects.map((subject) => <section key={subject.id} className="rounded-xl border border-[#dce5df] bg-white p-5"><h2 className="text-xl font-black">{subject.title}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{subject.topics.map((topic) => <Link key={topic.id} href={`/study-hub/${topic.id}`} className="flex items-center gap-3 rounded-lg border border-[#e0e9e3] p-4 hover:bg-[#f2f8f4]"><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{topic.name}</strong><small className="mt-1 block text-[#64726a]">{topic._count.studyMaterials} materials · {topic._count.questions} questions</small></span><ChevronRight size={18} /></Link>)}</div>{!subject.topics.length && <p className="mt-3 text-sm text-slate-500">No active topics yet.</p>}</section>)}</div>
  </div></main>;
}
