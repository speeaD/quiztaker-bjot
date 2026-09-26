import { GameId } from '@/lib/games';

interface RankedPlayer {
  rank: number;
  userId: string;
  displayName: string;
  department?: string | null;
  achievedAt: string;
}

export interface GameLeaderboardEntry extends RankedPlayer {
  score: number;
  correctAnswers?: number | null;
  questionsAnswered?: number;
  accuracy?: number | null;
  averageSeconds?: number | null;
}

export interface OverallLeaderboardEntry extends RankedPlayer {
  totalScore: number;
  gamesPlayed: number;
  breakdown: Record<GameId, number>;
}

export interface LeaderboardResponse {
  games: Record<GameId, GameLeaderboardEntry[]>;
  overall: OverallLeaderboardEntry[];
  week: { startsAt: string; endsAt: string; timeZone: string };
  generatedAt: string;
  totalPlayers?: Record<GameId | 'overall', number>;
  viewer?: {
    userId: string;
    overall: OverallLeaderboardEntry | null;
    games: Record<GameId, GameLeaderboardEntry | null>;
  };
}
