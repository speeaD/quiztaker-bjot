/**
 * Single source of truth for the games available in the hub.
 * Used by GameHub, the Leaderboard UI, and API-side validation
 * (never trust a game id coming from the client without checking
 * it against this list).
 */
export const GAMES = [
  {
    id: 'time-attack',
    name: 'Time Attack',
    description: 'Race against the clock',
    icon: '⏱️',
    color: 'from-blue-400 to-blue-600',
    route: '/time-attack',
  },
  {
    id: 'sudden-death',
    name: 'Sudden Death',
    description: "One wrong move and it's over",
    icon: '⚡',
    color: 'from-red-400 to-red-600',
    route: '/sudden-death',
  },
  {
    id: 'scholars-wager',
    name: "Scholar's Wager",
    description: 'Bet points on your confidence',
    icon: '💰',
    color: 'from-yellow-400 to-yellow-600',
    route: '/scholars-wager',
  },
] as const;

export type GameId = (typeof GAMES)[number]['id'];

export const GAME_IDS = GAMES.map((g) => g.id) as GameId[];

export function isGameId(value: unknown): value is GameId {
  return typeof value === 'string' && (GAME_IDS as string[]).includes(value);
}

export function getGameConfig(id: GameId) {
  return GAMES.find((g) => g.id === id);
}