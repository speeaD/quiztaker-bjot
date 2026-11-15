"use client";

import { Calculator, CircleHelp, Send } from "lucide-react";
import Link from "next/link";
import PortalLogo from "@/components/PortalLogo";

type PublicHeaderProps = {
  exam?: {
    timer: string;
    onSubmit: () => void;
    submitting?: boolean;
    showCalculator?: boolean;
    onCalculatorToggle?: () => void;
  };
};

export default function PublicHeader({ exam }: PublicHeaderProps) {
  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-[#dce7e3] bg-white px-5 sm:px-10">
        <PortalLogo size={100} priority className="" />
        <nav className="flex items-center gap-4 text-xs text-[#445b7e]">
          <span className="hidden sm:inline">Already have an access key?</span>
          <Link
            href="/"
            className="rounded-lg border border-[#bdc8d1] px-4 py-2 font-bold tracking-wide text-[#092235] transition hover:border-[#0a4a37] hover:text-[#0a4a37]"
          >
            SIGN IN
          </Link>
          <Link
            href="/support"
            className="hidden items-center gap-1.5 font-bold tracking-wide text-[#34465e] hover:text-[#a76000] sm:inline-flex"
          >
            <CircleHelp size={15} className="text-[#e9971c]" />
            HELP DESK
          </Link>
        </nav>
      </header>
      {exam && (
        <div className="border-b border-[#dce7e3] bg-[#f7faf8] px-5 py-2 sm:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <span className="text-sm font-bold text-[#0d3b2e]" role="timer">{exam.timer} remaining</span>
            <div className="flex items-center gap-2">
              {exam.onCalculatorToggle && <button
                type="button"
                onClick={exam.onCalculatorToggle}
                aria-label="Calculator"
                aria-pressed={exam.showCalculator}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-bold ${exam.showCalculator ? 'bg-[#0d3b2e] text-white' : 'border border-[#c9d8cf] text-[#0d3b2e]'}`}
              >
                <Calculator size={14} /><span className="hidden sm:inline">Calculator</span>
              </button>}
              <button
                type="button"
                onClick={exam.onSubmit}
                disabled={exam.submitting}
                className="inline-flex items-center gap-2 rounded-md bg-[#b85b26] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#99471a] disabled:opacity-50"
              >
                <Send size={14} /> {exam.submitting ? "Submitting…" : "Submit exam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
