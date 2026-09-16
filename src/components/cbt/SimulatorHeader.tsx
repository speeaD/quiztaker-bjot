import { Calculator, LogOut, Play, Send } from 'lucide-react';
import Link from 'next/link';
import PortalLogo from '@/components/PortalLogo';

interface SimulatorHeaderProps {
  mode: 'setup' | 'exam' | 'result';
  timer?: string;
  showCalculator?: boolean;
  onCalculatorToggle?: () => void;
  onSubmit?: () => void;
}

export default function SimulatorHeader({
  mode,
  timer,
  showCalculator = false,
  onCalculatorToggle,
  onSubmit,
}: SimulatorHeaderProps) {
  return (
    <header className="border-b border-[#dce5df] bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="grid"><PortalLogo size={70} priority /></span>
          <span>
            <strong className="block text-sm tracking-[-0.02em] text-[#17231e]">CBT</strong>
            <small className="block text-[9px] font-bold uppercase tracking-[0.13em] text-[#a5660c]">
              {mode === 'exam' ? 'Exam workspace' : 'Simulator'}
            </small>
          </span>
        </Link>

        {mode === 'exam' ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-md bg-[#edf3ef] px-3 py-2 text-sm font-black text-[#0d3b2e] sm:block">{timer}</span>
            <button
              onClick={onCalculatorToggle}
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold transition ${
                showCalculator
                  ? 'border-[#0d3b2e] bg-[#0d3b2e] text-white'
                  : 'border-[#c9d8cf] bg-white text-[#15513e] hover:bg-[#edf3ef]'
              }`}
            >
              <Calculator size={15} />
              <span className="hidden sm:inline">Calculator</span>
            </button>
            <button onClick={onSubmit} className="inline-flex items-center gap-2 rounded-md bg-[#b85b26] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#99471a]">
              <Send size={14} />
              Submit
            </button>
          </div>
        ) : (
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-bold text-[#15513e] hover:bg-[#edf3ef]">
            {mode === 'result' ? <Play size={14} /> : <LogOut size={14} />}
            Dashboard
          </Link>
        )}
      </div>
    </header>
  );
}
