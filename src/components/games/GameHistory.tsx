'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { gameRequest, GameSession } from '@/lib/game-client';
import { getGameConfig } from '@/lib/games';
import GameShell from './GameShell';
type Round = Pick<GameSession, 'id' | 'gameType' | 'subject' | 'currentScore' | 'status' | 'startedAt'>;
export default function GameHistory() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const data = await gameRequest<{ sessions: Round[] }>('history'); setRounds(data.sessions); }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to load rounds'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return <GameShell title="Your game history"><p className="mb-5 text-sm text-gray-600">Your latest 50 rounds across all three games.</p>
    {loading ? <p role="status">Loading rounds…</p> : error ? <p role="alert">{error} <button className="underline" onClick={load}>Retry</button></p> : !rounds.length ? <p>No rounds yet. Choose a game to get started.</p> : <ul className="grid gap-3">{rounds.map(round => <li key={round.id} className="rounded-xl border border-[#dce5df] bg-white p-5">
      <Link href={`/game-hub/play/${round.id}`} className="flex flex-wrap items-center justify-between gap-3"><div><strong>{getGameConfig(round.gameType)?.name} · {round.subject}</strong><p className="mt-1 text-sm text-gray-500">{new Date(round.startedAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} WAT · {round.status}</p></div><span className="font-bold text-[#15513e]">{round.status === 'active' ? 'Resume →' : `${round.currentScore.toLocaleString()} points →`}</span></Link>
    </li>)}</ul>}
  </GameShell>;
}
