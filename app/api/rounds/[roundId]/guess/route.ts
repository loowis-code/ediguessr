import { NextRequest, NextResponse } from 'next/server';
import { getRoundById } from '@/lib/db/rounds';
import { getPlayerBySession, getPlayersByGameId } from '@/lib/db/players';
import { submitGuess, hasPlayerGuessed } from '@/lib/db/guesses';
import { pusherServer, PUSHER_EVENTS, getGameChannel } from '@/lib/pusher';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session ID found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { guessLat, guessLng, timeTakenSeconds } = body;

    // Validate coordinates
    if (
      typeof guessLat !== 'number' ||
      typeof guessLng !== 'number' ||
      guessLat < -90 ||
      guessLat > 90 ||
      guessLng < -180 ||
      guessLng > 180
    ) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    if (typeof timeTakenSeconds !== 'number' || timeTakenSeconds < 0) {
      return NextResponse.json(
        { error: 'Invalid time taken' },
        { status: 400 }
      );
    }

    const { roundId } = await params;
    // Get the round
    const round = await getRoundById(roundId);

    if (!round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    // Get the player
    const player = await getPlayerBySession(round.game_id, sessionId);

    if (!player) {
      return NextResponse.json(
        { error: 'You are not in this game' },
        { status: 403 }
      );
    }

    // Check if player has already guessed
    const alreadyGuessed = await hasPlayerGuessed(roundId, player.id);

    if (alreadyGuessed) {
      return NextResponse.json(
        { error: 'You have already submitted a guess for this round' },
        { status: 400 }
      );
    }

    // Submit the guess
    const guess = await submitGuess(
      roundId,
      player.id,
      guessLat,
      guessLng,
      round.location.lat,
      round.location.lng,
      timeTakenSeconds
    );

    // Broadcast guess submitted (without revealing location yet)
    await pusherServer.trigger(
      getGameChannel(round.game_id),
      PUSHER_EVENTS.GUESS_SUBMITTED,
      {
        playerId: player.id,
        playerNickname: player.nickname,
        roundId
      }
    );

    return NextResponse.json({ guess }, { status: 200 });
  } catch (error) {
    console.error('Error submitting guess:', error);
    return NextResponse.json(
      { error: 'Failed to submit guess' },
      { status: 500 }
    );
  }
}
