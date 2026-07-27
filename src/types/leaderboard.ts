import { GameId } from "@/lib/games";


export interface GameLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  achievedAt: string; // ISO date
}

export interface OverallLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  totalScore: number;
  gamesPlayed: number;
  breakdown: Record<GameId, number>;
}

export interface LeaderboardResponse {
  games: Record<GameId, GameLeaderboardEntry[]>;
  overall: OverallLeaderboardEntry[];
  generatedAt: string; // ISO date
}