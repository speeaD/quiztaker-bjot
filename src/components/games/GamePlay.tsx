'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gameRequest, GameResponse } from '@/lib/game-client';
import { getGameConfig } from '@/lib/games';
import GameShell from './GameShell';

export default function GamePlay({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<GameResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState('');
  const [wager, setWager] = useState('10');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const timeOffset = useRef(0);
  const inFlight = useRef(false);
  const deadlineChecked = useRef(false);
  const accept = useCallback((next: GameResponse) => {
    if (!next.session || !next.serverTime) throw new Error('Invalid game response. Please reload.');
    timeOffset.current = new Date(next.serverTime).getTime() - Date.now();
    setData(next); setAnswer('');
    setWager(value => String(Math.max(1, Math.min(Number(value) || 10, next.session.currentScore))));
  }, []);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { accept(await gameRequest<GameResponse>(`sessions/${sessionId}`)); }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to load round'); }
    finally { setLoading(false); }
  }, [accept, sessionId]);
  useEffect(() => { void load(); }, [load]);
  const session = data?.session;
  const active = session?.status === 'active';
  useEffect(() => {
    if (!active || !session?.expiresAt) return;
    const deadline = new Date(session.expiresAt).getTime();
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now() - timeOffset.current) / 1000));
      setRemaining(seconds);
      if (seconds === 0 && !inFlight.current && !deadlineChecked.current) {
        deadlineChecked.current = true;
        void load();
      }
    };
    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [active, session?.expiresAt, load]);
  async function act(action: 'answer' | 'quit') {
    if (!session || inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try {
      accept(await gameRequest<GameResponse>(`sessions/${sessionId}/${action}`, action === 'answer'
        ? { questionId: session.question?._id, answer, ...(session.gameType === 'scholars-wager' ? { wager: Number(wager) } : {}) } : {}));
      setConfirmQuit(false);
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to save answer'); }
    finally { inFlight.current = false; setBusy(false); }
  }
  const game = session ? getGameConfig(session.gameType) : null;
  const question = session?.question;
  const validWager = session?.gameType !== 'scholars-wager' || (Number.isInteger(Number(wager)) && Number(wager) >= 1 && Number(wager) <= session.currentScore);
  return <GameShell title={game?.name || 'Game round'}>
    {error && <div role="alert" className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">{error} <button className="underline" disabled={busy || loading} onClick={load}>Reload round</button></div>}
    {loading ? <p role="status">Loading round…</p> : session && <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#0d3b2e] p-5 text-white">
        <div><p className="text-sm text-[#d8e6de]">{session.subject}</p><strong className="text-2xl">{session.currentScore.toLocaleString()} points</strong></div>
        <p className="text-sm">{session.correctAnswers} correct / {session.questionsAnswered} answered</p>
        {active && session.expiresAt && <strong role="timer" aria-label="Time remaining" className={remaining === 0 ? 'text-red-300' : 'text-[#efb948]'}>{remaining === null ? '2:00' : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`}</strong>}
      </div>
      {data.feedback && <p role="status" className={`mb-4 rounded-lg p-3 ${data.feedback.correct ? 'bg-emerald-50 text-emerald-800' : 'bg-orange-50 text-orange-800'}`}>{data.feedback.correct ? 'Correct!' : 'Incorrect.'} {data.feedback.pointsChange > 0 ? '+' : ''}{data.feedback.pointsChange} points.</p>}
      {active && question ? <section className="rounded-xl border border-[#dce5df] bg-white p-6">
        <p className="mb-3 text-sm text-gray-500">Question {session.questionsAnswered + 1}</p>
        {question.passage && <p className="mb-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-6">{question.passage}</p>}
        {/* Question diagrams use administrator-provided URLs, including external hosts. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {question.diagram && <img src={question.diagram} alt={question.diagramAlt || 'Question diagram'} className="mb-4 max-h-72 max-w-full object-contain" />}
        <h2 className="mb-5 whitespace-pre-wrap text-lg font-bold">{question.question}</h2>
        <div className="grid gap-3">{question.options.map((option, index) => <button key={`${question._id}-${index}`} disabled={busy || remaining === 0} aria-pressed={answer === option} onClick={() => setAnswer(option)}
          className={`rounded-lg border p-4 text-left disabled:opacity-60 ${answer === option ? 'border-[#15513e] bg-[#e5f0eb]' : 'border-gray-200 hover:bg-gray-50'}`}>{String.fromCharCode(65 + index)}. {option}</button>)}</div>
        {session.gameType === 'scholars-wager' && <label className="mt-5 block text-sm font-bold">Your wager (1–{session.currentScore})
          <input type="number" min={1} max={session.currentScore} step={1} value={wager} disabled={busy} onChange={event => setWager(event.target.value)} className="ml-3 w-28 rounded-lg border border-gray-300 p-2" />
        </label>}
        <button onClick={() => act('answer')} disabled={!answer || busy || !validWager || remaining === 0} className="mt-5 rounded-lg bg-[#15513e] px-6 py-3 font-bold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Submit answer'}</button>
        <div className="mt-5 border-t border-gray-100 pt-4">{confirmQuit ? <div><p className="mb-2 text-sm">Quit this round? Its score will not count on the weekly leaderboard.</p><button disabled={busy} onClick={() => act('quit')} className="mr-4 font-bold text-red-700">Quit round</button><button disabled={busy} onClick={() => setConfirmQuit(false)}>Keep playing</button></div> : <button disabled={busy} onClick={() => setConfirmQuit(true)} className="text-sm text-gray-500 underline">Quit round</button>}</div>
      </section> : <section className="rounded-xl border border-[#dce5df] bg-white p-6 text-center">
        <h2 className="text-2xl font-bold">{session.status === 'won' ? 'You reached the goal!' : session.status === 'quit' ? 'Round ended' : 'Round complete'}</h2>
        <p className="mt-3 text-gray-600">{session.status === 'quit' || !session.questionsAnswered ? 'This round does not count toward the weekly leaderboard.' : 'Your score is saved. Your best completed score for this game counts in the week the round finished.'}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3"><Link href={game?.route || '/game-hub'} className="rounded-lg bg-[#15513e] px-5 py-3 font-bold text-white">Play again</Link><Link href="/leaderboard" className="rounded-lg border border-[#15513e] px-5 py-3 font-bold text-[#15513e]">View weekly rankings</Link></div>
      </section>}
    </>}
  </GameShell>;
}
