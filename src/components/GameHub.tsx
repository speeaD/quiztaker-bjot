'use client';

import GameHubPanel from '@/components/game-hub/GameHubPanel';
import GameModeCard from '@/components/game-hub/GameModeCard';
import { ArrowLeft, CircleDollarSign, Gamepad2, Timer, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PortalLogo from '@/components/PortalLogo';

const gameModes = [
  {
    title: 'Time Attack',
    description: 'Race the clock through quick questions. Build accuracy while keeping your pace high.',
    detail: 'Fast rounds',
    action: 'Start time attack',
    icon: Timer,
    accent: 'emerald' as const,
    route: '/time-attack',
  },
  {
    title: 'Sudden Death',
    description: 'Every answer matters. One wrong answer ends the round, so stay sharp from the start.',
    detail: 'High stakes',
    action: 'Enter sudden death',
    icon: Zap,
    accent: 'orange' as const,
    route: '/sudden-death',
  },
  {
    title: 'Scholar’s Wager',
    description: 'Back your knowledge, wager your points, and move up the cohort rankings with each round.',
    detail: 'Earn XP',
    action: 'Place a wager',
    icon: CircleDollarSign,
    accent: 'gold' as const,
    route: '/scholars-wager',
  },
];

export default function GameHub() {
  const router = useRouter();
  return (
    <div className="portal-page">
      <header className="border-b border-[#dce5df] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid"><PortalLogo size={75} priority /></span>
            <span><small className="block text-[14px] font-bold uppercase tracking-[0.13em] text-[#a5660c]">Game Hub</small></span>
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-bold text-[#15513e] hover:bg-[#edf3ef]"><ArrowLeft size={14} />Dashboard</Link>
        </div>
      </header>

      <main className="dashboard-main mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-6">
        <section className="mt-5 rounded-xl bg-[#0d3b2e] p-6 text-white shadow-[0_8px_24px_rgba(13,59,46,0.16)] sm:p-8">
          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <div><span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#b9d2c4]"><Gamepad2 size={12} />Skill arena</span><h1 className="mt-4 text-3xl font-black tracking-[-0.05em]">Make practice feel like play.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#d8e6de]">Choose a challenge, sharpen recall, and earn your place on the leaderboard.</p></div>
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3"><span className="grid size-9 place-items-center rounded-md bg-[#efb948] text-[#0d3b2e]"><Trophy size={18} /></span><span><strong className="block text-sm">Ready to compete?</strong><small className="text-[11px] text-[#b9d2c4]">Every round builds confidence.</small></span></div>
          </div>
        </section>

        <section className="mt-10"><div className="mb-3"><h2 className="text-sm font-black tracking-[-0.02em]">Choose your challenge</h2><p className="mt-0.5 text-[11px] text-[#718078]">Different formats for different ways to learn.</p></div><div className="grid gap-4 md:grid-cols-3">{gameModes.map((mode) => <GameModeCard key={mode.title} {...mode} onPlay={() => router.push(mode.route)} />)}</div></section>
        <section className="mt-5 grid gap-4 md:grid-cols-2"><GameHubPanel type="leaderboard" onClick={() => router.push('/leaderboard')} /><GameHubPanel type="history" onClick={() => router.push('/scholars-wager/history')} /></section>
      </main>
    </div>
  );
}
