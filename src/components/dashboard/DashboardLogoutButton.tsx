'use client';

import { Loader2, LogOut } from 'lucide-react';
import { useState } from 'react';
import { logoutQuizTaker } from '@/lib/auth/client';

export default function DashboardLogoutButton() {
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
    <div className="shrink-0">
        <button type="button" onClick={() => void handleLogout()} disabled={isLoggingOut} className="flex items-center justify-center gap-2 rounded-md border border-[#c9d8cf] bg-white px-3 py-2.5 text-[0.82875rem] font-bold text-[#15513e] transition hover:bg-[#edf3ef] disabled:cursor-not-allowed disabled:opacity-60">
          {isLoggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
          {isLoggingOut ? 'Logging out…' : 'Log out'}
        </button>
        {logoutError && <p role="alert" className="text-center text-[0.690625rem] font-medium text-[#b85b26]">{logoutError}</p>}
    </div>
  );
}
