import { NextRequest } from 'next/server';
import { forwardGameRequest } from '@/lib/game-proxy';
export function GET(request: NextRequest) { return forwardGameRequest(request, 'leaderboard'); }
