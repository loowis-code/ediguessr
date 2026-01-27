import { NextRequest, NextResponse } from 'next/server';
import { getGameById } from '@/lib/db/games';
import { getPlayersByGameId, getPlayerBySession } from '@/lib/db/players';
import { getRoundsByGameId } from '@/lib/db/rounds';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session ID found' },
        { status: 401 }
      );
    }

    const { gameId } = await params;
    const game = await getGameById(gameId);

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    const players = await getPlayersByGameId(gameId);
    const currentPlayer = await getPlayerBySession(gameId, sessionId);
    const rounds = await getRoundsByGameId(gameId);

    return NextResponse.json({
      game,
      players,
      currentPlayer,
      rounds,
      isCreator: game.creator_session_id === sessionId
    });
  } catch (error) {
    console.error('Error fetching game state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game state' },
      { status: 500 }
    );
  }
}
