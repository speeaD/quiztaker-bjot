'use client';

import {
  BookOpen,
  Calendar,
  Gamepad2,
  LayoutDashboard,
  Loader2,
  LogOut,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import PortalLogo from '@/components/PortalLogo';
import { logoutQuizTaker } from '@/lib/auth/client';

const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', active: true },
  { label: 'CBT Simulator', icon: Target, href: '/cbt-simulator' },
  { label: 'Study Hub', icon: BookOpen, href: '/study-hub' },
  { label: 'Subject Tests', icon: Target, href: '/subject-test' },
  { label: 'Game Hub', icon: Gamepad2, href: '/game-hub' },
  { label: 'Class Schedule', icon: Calendar, href: '/schedule' },
];

interface DashboardSidebarProps {
  readiness: number;
}

export default function DashboardSidebar({ readiness }: DashboardSidebarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError('');

    try {
      await logoutQuizTaker();
      window.location.assign('/login');
    } catch {
      setIsLoggingOut(false);
      setLogoutError('Unable to log out. Please try again.');
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[#dce5df] bg-white lg:flex">
      <div className="flex h-20 items-center gap-1 border-b border-[#e7eee9] px-2">
        <span className="grid"><PortalLogo size={120} priority /></span>
        <div><p className="text-[0.73125rem] font-bold tracking-[0.16em] text-[#a1610b]">STUDENT PORTAL</p></div>
      </div>

      <nav className="space-y-1 px-3 py-5" aria-label="Main navigation">
        {navigationItems.map(({ label, icon: Icon, href, active }) => (
          <Link key={label} href={href} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.975rem] font-semibold transition ${active ? 'bg-[#0d3b2e] text-white shadow-sm' : 'text-[#526158] hover:bg-[#edf3ef] hover:text-[#0d3b2e]'}`}>
            <Icon size={15} strokeWidth={1.8} />{label}
          </Link>
        ))}
      </nav>

      <div className="m-3 mt-auto space-y-3">
        <div className="rounded-lg border border-[#dce5df] bg-[#edf3ef] p-3">
          <p className="text-[0.8125rem] font-bold uppercase tracking-wide text-[#526158]">Target readiness</p>
          <div className="mt-1 flex items-end justify-between"><strong className="text-[1.3rem]">{readiness}%</strong><span className="text-[0.8125rem] font-semibold text-[#286448]">Ready</span></div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#d9e4dd]"><div className="h-full rounded-full bg-[#0d3b2e]" style={{ width: `${readiness}%` }} /></div>
        </div>

        <button type="button" onClick={() => void handleLogout()} disabled={isLoggingOut} className="flex w-full items-center justify-center gap-2 rounded-md border border-[#c9d8cf] px-3 py-2.5 text-[0.975rem] font-bold text-[#15513e] transition hover:bg-[#edf3ef] disabled:cursor-not-allowed disabled:opacity-60">
          {isLoggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
          {isLoggingOut ? 'Logging out…' : 'Log out'}
        </button>
        {logoutError && <p role="alert" className="text-center text-[0.8125rem] font-medium text-[#b85b26]">{logoutError}</p>}
      </div>
    </aside>
  );
}
