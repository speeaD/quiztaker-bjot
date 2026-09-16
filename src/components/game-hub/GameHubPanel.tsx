import { History, Trophy } from 'lucide-react';

interface GameHubPanelProps {
  type: 'leaderboard' | 'history';
  onClick: () => void;
}

export default function GameHubPanel({ type, onClick }: GameHubPanelProps) {
  const isLeaderboard = type === 'leaderboard';
  const Icon = isLeaderboard ? Trophy : History;
  return (
    <article className="rounded-xl border border-[#dce5df] bg-white p-5 shadow-[0_3px_12px_rgba(13,59,46,0.05)]">
      <span className={`grid size-9 place-items-center rounded-lg ${isLeaderboard ? 'bg-[#fff2d1] text-[#9a5a00]' : 'bg-[#e5f0eb] text-[#15513e]'}`}><Icon size={18} /></span>
      <h2 className="mt-4 text-sm font-black text-[#17231e]">{isLeaderboard ? 'Cohort Leaderboard' : 'Game History'}</h2>
      <p className="mt-1 text-xs leading-5 text-[#64726a]">{isLeaderboard ? 'See who is leading this week and chase your next rank.' : 'Review past rounds, scores, and areas to improve.'}</p>
      <button onClick={onClick} className="mt-4 text-xs font-black text-[#15513e] hover:underline">{isLeaderboard ? 'View rankings →' : 'View game history →'}</button>
    </article>
  );
}
