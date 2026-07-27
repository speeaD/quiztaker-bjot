'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GameId, GAMES } from '@/lib/games';
import { LeaderboardResponse } from '@/types/leaderboard';


type TabId = 'overall' | GameId;

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function RankBadge({ rank }: { rank: number }) {
  const medal = MEDALS[rank];
  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm ${
        medal ? 'bg-transparent text-2xl' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {medal ?? rank}
    </span>
  );
}

export default function Leaderboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('overall');
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/leaderboard?limit=25', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }
      const json: LeaderboardResponse = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError("Couldn't load the leaderboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tabs: { id: TabId; label: string; icon: string; color: string }[] = [
    { id: 'overall', label: 'Overall', icon: '🏆', color: 'from-purple-400 to-purple-600' },
    ...GAMES.map((g) => ({ id: g.id, label: g.name, icon: g.icon, color: g.color })),
  ];

  const activeGame = activeTab !== 'overall' ? GAMES.find((g) => g.id === activeTab) : undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push('/game-hub')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
          >
            ← Back to Game Hub
          </button>
          <h1 className="text-4xl md:text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-md text-gray-600">See who&apos;s on top, per game and overall</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {loading && (
            <div className="py-16 text-center text-gray-500">Loading rankings…</div>
          )}

          {!loading && error && (
            <div className="py-16 text-center">
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={load}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Try again →
              </button>
            </div>
          )}

          {!loading && !error && data && activeTab === 'overall' && (
            <OverallTable entries={data.overall} />
          )}

          {!loading && !error && data && activeGame && (
            <GameTable entries={data.games[activeGame.id]} accentColor={activeGame.color} />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-16 text-center text-gray-500">
      No scores yet for {label}. Be the first to play and claim the top spot!
    </div>
  );
}

function GameTable({
  entries,
  accentColor,
}: {
  entries: LeaderboardResponse['games'][GameId];
  accentColor: string;
}) {
  if (entries.length === 0) {
    return <EmptyState label="this game" />;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {entries.map((entry) => (
        <li key={entry.userId} className="flex items-center gap-4 py-3">
          <RankBadge rank={entry.rank} />
          <span className="flex-1 font-medium text-gray-900 truncate">{entry.displayName}</span>
          <span
            className={`font-bold text-white text-sm px-3 py-1 rounded-full bg-gradient-to-r ${accentColor}`}
          >
            {entry.score.toLocaleString()}
          </span>
        </li>
      ))}
    </ul>
  );
}

function OverallTable({ entries }: { entries: LeaderboardResponse['overall'] }) {
  if (entries.length === 0) {
    return <EmptyState label="any game" />;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {entries.map((entry) => (
        <li key={entry.userId} className="flex items-center gap-4 py-3">
          <RankBadge rank={entry.rank} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{entry.displayName}</p>
            <p className="text-xs text-gray-500">
              {entry.gamesPlayed} of {GAMES.length} games played
            </p>
          </div>
          <span className="font-bold text-white text-sm px-3 py-1 rounded-full bg-gradient-to-r from-purple-400 to-purple-600">
            {entry.totalScore.toLocaleString()}
          </span>
        </li>
      ))}
    </ul>
  );
}