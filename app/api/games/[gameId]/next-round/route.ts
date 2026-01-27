import { NextRequest, NextResponse } from 'next/server';
import { getGameById, updateGameStatus } from '@/lib/db/games';
import { createRound, getCurrentRoundNumber } from '@/lib/db/rounds';
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

    // Only the creator can start next round
    if (game.creator_session_id !== sessionId) {
      return NextResponse.json(
        { error: 'Only the game creator can start the next round' },
        { status: 403 }
      );
    }

    // Check if game is active
    if (game.status !== 'active') {
      return NextResponse.json(
        { error: 'Game is not active' },
        { status: 400 }
      );
    }

    // Get current round number
    const currentRound = await getCurrentRoundNumber(gameId);
    const nextRoundNumber = currentRound + 1;

    // Check if we've reached the end of the game
    if (nextRoundNumber > game.settings.rounds) {
      // End the game
      const finishedGame = await updateGameStatus(gameId, 'finished');

      // Broadcast game ended event
      await pusherServer.trigger(
        getGameChannel(gameId),
        PUSHER_EVENTS.GAME_ENDED,
        {
          game: finishedGame
        }
      );

      return NextResponse.json(
        { game: finishedGame, gameEnded: true },
        { status: 200 }
      );
    }

    // Generate next round location
    const location = await getRandomEdinburghLocation();
    const round = await createRound(gameId, nextRoundNumber, location);

    // Broadcast round started event
    await pusherServer.trigger(
      getGameChannel(gameId),
      PUSHER_EVENTS.ROUND_STARTED,
      {
        round
      }
    );

    return NextResponse.json({ round, gameEnded: false }, { status: 200 });
  } catch (error) {
    console.error('Error starting next round:', error);
    return NextResponse.json(
      { error: 'Failed to start next round' },
      { status: 500 }
    );
  }
}
