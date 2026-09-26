'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GameId, getGameConfig } from '@/lib/games';
import { gameRequest, gameRules } from '@/lib/game-client';
import GameShell from './GameShell';

type Subject = { id: string; name: string; questionCount: number };
export default function GameStart({ gameId }: { gameId: GameId }) {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await gameRequest<{ subjects: Subject[] }>('subjects');
      if (!Array.isArray(data.subjects)) throw new Error('Unable to load subjects');
      setSubjects(data.subjects);
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to load subjects'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function start() {
    setStarting(true); setError('');
    try {
      const data = await gameRequest<{ session: { id: string } }>('start', { gameType: gameId, questionSetId: selected });
      router.push(`/game-hub/play/${data.session.id}`);
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to start game'); setStarting(false); }
  }
  return <GameShell title={getGameConfig(gameId)!.name}>
    <section className="rounded-xl bg-[#0d3b2e] p-6 text-white">
      <h2 className="font-bold">How to play</h2><p className="mt-2 text-sm leading-6 text-[#d8e6de]">{gameRules[gameId]}</p>
      <p className="mt-3 text-sm text-[#efb948]">Your best completed score counts this week. Rankings reset Monday, 00:00 WAT. Quit rounds do not count.</p>
    </section>
    <section className="mt-6 rounded-xl border border-[#dce5df] bg-white p-6">
      <h2 className="mb-4 font-bold">Choose a subject</h2>
      {loading ? <p role="status">Loading subjects…</p> : subjects.length ? <div className="grid gap-3 sm:grid-cols-2">
        {subjects.map(subject => <button key={subject.id} disabled={starting} aria-pressed={selected === subject.id} onClick={() => setSelected(subject.id)}
          className={`rounded-lg border p-4 text-left disabled:opacity-50 ${selected === subject.id ? 'border-[#15513e] bg-[#e5f0eb]' : 'border-[#dce5df] hover:bg-gray-50'}`}>
          <strong className="block">{subject.name}</strong><span className="text-sm text-gray-600">{subject.questionCount} questions</span>
        </button>)}
      </div> : !error && <p>No subjects have game questions yet. Please check back later.</p>}
      {error && <p role="alert" className="mt-4 text-red-700">{error} {!subjects.length && <button className="underline" onClick={load}>Retry</button>}</p>}
      <button disabled={!selected || starting || loading} onClick={start} className="mt-6 rounded-lg bg-[#15513e] px-6 py-3 font-bold text-white disabled:opacity-50">{starting ? 'Opening round…' : 'Start / resume round'}</button>
      <p className="mt-3 text-xs text-gray-500">If you have an unfinished round in this game, it will resume with its original subject. <Link href="/game-hub/history" className="underline">View your rounds</Link></p>
    </section>
  </GameShell>;
}
