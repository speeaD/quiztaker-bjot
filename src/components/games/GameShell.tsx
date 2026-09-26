import Link from 'next/link';
import { ReactNode } from 'react';
export default function GameShell({ title, children }: { title: string; children: ReactNode }) {
  return <div className="portal-page min-h-screen px-4 py-8"><main className="mx-auto max-w-3xl">
    <nav className="mb-6 flex justify-between gap-4 text-sm font-bold text-[#15513e]">
      <Link href="/game-hub">← Game Hub</Link><Link href="/leaderboard">Weekly leaderboard →</Link>
    </nav>
    <h1 className="mb-6 text-3xl font-black text-[#0d3b2e]">{title}</h1>{children}
  </main></div>;
}
