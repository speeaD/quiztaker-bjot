import { ArrowRight, type LucideIcon } from 'lucide-react';

interface GameModeCardProps {
  title: string;
  description: string;
  detail: string;
  action: string;
  icon: LucideIcon;
  accent: 'emerald' | 'gold' | 'orange';
  onPlay: () => void;
}

const accentStyles = {
  emerald: { icon: 'bg-[#e5f0eb] text-[#0d3b2e]', badge: 'bg-[#eaf3ed] text-[#15513e]' },
  gold: { icon: 'bg-[#fff2d1] text-[#9a5a00]', badge: 'bg-[#fff7e7] text-[#9a5a00]' },
  orange: { icon: 'bg-[#fff0e4] text-[#c64d08]', badge: 'bg-[#fff1e9] text-[#b54b0b]' },
};

export default function GameModeCard({ title, description, detail, action, icon: Icon, accent, onPlay }: GameModeCardProps) {
  const style = accentStyles[accent];
  return (
    <article className="group flex min-h-[270px] flex-col rounded-xl border border-[#dce5df] bg-white p-5 shadow-[0_3px_12px_rgba(13,59,46,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-[#b7ccbf] hover:shadow-[0_12px_24px_rgba(13,59,46,0.10)]">
      <div className="flex items-start justify-between">
        <span className={`grid size-11 place-items-center rounded-lg ${style.icon}`}><Icon size={21} /></span>
        <span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${style.badge}`}>{detail}</span>
      </div>
      <h2 className="mt-6 text-lg font-black tracking-[-0.03em] text-[#17231e]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#64726a]">{description}</p>
      <button onClick={onPlay} className="mt-auto flex items-center justify-between rounded-md bg-[#edf3ef] px-3 py-2.5 text-xs font-black text-[#113c2e] transition hover:bg-[#dcebe1]">
        {action}<ArrowRight size={15} />
      </button>
    </article>
  );
}
