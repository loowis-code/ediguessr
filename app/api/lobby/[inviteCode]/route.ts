import { NextRequest, NextResponse } from 'next/server';
import { getGameByInviteCode } from '@/lib/db/games';
import { getPlayersByGameId, getPlayerBySession } from '@/lib/db/players';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ inviteCode: string }> }
) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session ID found' },
        { status: 401 }
      );
    }

    const { inviteCode } = await params;
    const game = await getGameByInviteCode(inviteCode.toUpperCase());

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    const players = await getPlayersByGameId(game.id);
    const currentPlayer = await getPlayerBySession(game.id, sessionId);

    return NextResponse.json({
      game,
      players,
      currentPlayer,
      isCreator: game.creator_session_id === sessionId
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    );
  }
}
