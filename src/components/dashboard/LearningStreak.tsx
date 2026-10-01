'use client';

import { Flame, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type Streak = {
  current: number;
  longest: number;
  completedToday: boolean;
  lastActiveDate: string | null;
  timezone: 'Africa/Lagos';
};

export default function LearningStreak() {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/quiztaker/streak', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load streak');
        const data: { success: boolean; streak?: Streak } = await response.json();
        if (!data.success || !data.streak) throw new Error('Unable to load streak');
        setStreak(data.streak);
      })
      .catch((cause: unknown) => { if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return (
    <section aria-label="Learning streak" className="rounded-xl border border-[#f0d8a1] bg-[#fff9ea] p-4 text-[#53360f] shadow-[0_2px_8px_rgba(13,59,46,0.04)] sm:p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#ffebbd] text-[#b95f0b]"><Flame size={23} aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[0.966875rem] font-black">Learning streak</h2>
          {loading ? <p className="mt-1 flex items-center gap-2 text-sm"><Loader2 size={14} className="animate-spin" />Loading streak…</p>
            : error ? <p className="mt-1 text-sm">Streak unavailable. Try refreshing the page.</p>
            : <p className="mt-1 text-sm">{streak?.completedToday ? 'Today counts. Keep it going tomorrow!' : streak?.current ? 'Complete an activity today to keep it going.' : 'Complete an activity today to start your streak.'}</p>}
        </div>
        {!loading && !error && streak && <div className="shrink-0 text-right"><strong className="block text-3xl font-black leading-none">{streak.current}</strong><span className="text-xs font-bold">{streak.current === 1 ? 'day' : 'days'}</span></div>}
      </div>
      {!loading && !error && streak && <div className="mt-4 flex items-center justify-between border-t border-[#f0d8a1] pt-3 text-xs"><span>Best streak: <strong>{streak.longest} {streak.longest === 1 ? 'day' : 'days'}</strong></span><span>{streak.completedToday ? 'Done today ✓' : 'Today is open'}</span></div>}
      <p className="mt-2 text-[0.690625rem] text-[#806b4b]">Mark attendance or finish a test or game. Days reset at midnight in Lagos.</p>
    </section>
  );
}
