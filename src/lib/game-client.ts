import { GameId } from './games';
export type GameQuestion = { _id: string; question: string; passage: string; diagram: string | null; diagramAlt: string; options: string[] };
export type GameSession = {
  id: string; gameType: GameId; subject: string; currentScore: number; goalScore: number;
  status: 'active' | 'completed' | 'won' | 'lost' | 'quit'; questionsAnswered: number; correctAnswers: number;
  startedAt: string; completedAt: string | null; expiresAt: string | null; question: GameQuestion | null;
};
export type GameResponse = { session: GameSession; serverTime: string; feedback?: { correct: boolean; pointsChange: number } };
export async function gameRequest<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/games/${path}`, {
    method: body === undefined ? 'GET' : 'POST', cache: 'no-store',
    ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Unable to load game. Please try again.');
  return data as T;
}
export const gameRules: Record<GameId, string> = {
  'time-attack': 'You have 2 minutes. Each correct answer earns 10 points; wrong answers earn 0. The round ends when time runs out or you finish the subject’s questions.',
  'sudden-death': 'Earn 10 points for every correct answer. One wrong answer ends your round. Answer all available questions to finish with a perfect run.',
  'scholars-wager': 'Start with 100 points and wager 1 to your current balance on each answer. A correct answer wins your wager; a wrong answer loses it. Reach 1,000 points to win, or finish when your balance reaches 0 or the questions run out.',
};
