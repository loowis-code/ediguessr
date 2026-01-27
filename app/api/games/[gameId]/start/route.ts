import { NextRequest, NextResponse } from 'next/server';
import { getGameById, updateGameStatus } from '@/lib/db/games';
import { createRound } from '@/lib/db/rounds';
import { getRandomEdinburghLocation } from '@/lib/location-generator';
import { pusherServer, PUSHER_EVENTS, getGameChannel } from '@/lib/pusher';

export async function POST(
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

    // Only the creator can start the game
    if (game.creator_session_id !== sessionId) {
      return NextResponse.json(
        { error: 'Only the game creator can start the game' },
        { status: 403 }
      );
    }

    // Check if game is in waiting status
    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Game has already started or finished' },
        { status: 400 }
      );
    }

    // Update game status to active
    const updatedGame = await updateGameStatus(gameId, 'active');

    // Generate first round location
    const location = await getRandomEdinburghLocation();
    const round = await createRound(gameId, 1, location);

    // Broadcast game started event
    await pusherServer.trigger(
      getGameChannel(gameId),
      PUSHER_EVENTS.GAME_STARTED,
      {
        game: updatedGame
      }
    );

    // Broadcast first round
    await pusherServer.trigger(
      getGameChannel(gameId),
      PUSHER_EVENTS.ROUND_STARTED,
      {
        round
      }
    );

    return NextResponse.json({ game: updatedGame, round }, { status: 200 });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    );
  }
}
