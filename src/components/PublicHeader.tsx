"use client";

import { CircleHelp, Send } from "lucide-react";
import PortalLogo from "@/components/PortalLogo";

type PublicHeaderProps = {
  exam?: {
    timer: string;
    onSubmit: () => void;
    submitting?: boolean;
  };
};

export default function PublicHeader({ exam }: PublicHeaderProps) {
  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-[#dce7e3] bg-white px-5 sm:px-10">
        <PortalLogo size={100} priority className="" />
        <nav className="flex items-center gap-4 text-xs text-[#445b7e]">
          <span className="hidden sm:inline">Already have an access key?</span>
          <a
            href="/login"
            className="rounded-lg border border-[#bdc8d1] px-4 py-2 font-bold tracking-wide text-[#092235] transition hover:border-[#0a4a37] hover:text-[#0a4a37]"
          >
            SIGN IN
          </a>
          <a
            href="/support"
            className="hidden items-center gap-1.5 font-bold tracking-wide text-[#34465e] hover:text-[#a76000] sm:inline-flex"
          >
            <CircleHelp size={15} className="text-[#e9971c]" />
            HELP DESK
          </a>
        </nav>
      </header>
      {exam && (
        <div className="border-b border-[#dce7e3] bg-[#f7faf8] px-5 py-2 sm:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <span className="text-sm font-bold text-[#0d3b2e]" role="timer">{exam.timer} remaining</span>
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
      )}
    </>
  );
}
