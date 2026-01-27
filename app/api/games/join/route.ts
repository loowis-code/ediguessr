import { NextRequest, NextResponse } from 'next/server';
import { getGameByInviteCode } from '@/lib/db/games';
import { addPlayer, isPlayerInGame } from '@/lib/db/players';
import { isValidInviteCode } from '@/lib/session';
import { pusherServer, PUSHER_EVENTS, getGameChannel } from '@/lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session ID found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { inviteCode, nickname } = body;

    if (!inviteCode || !isValidInviteCode(inviteCode)) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 400 }
      );
    }

    if (!nickname || nickname.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nickname is required' },
        { status: 400 }
      );
    }

    // Find the game
    const game = await getGameByInviteCode(inviteCode.toUpperCase());

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Check if game is still in waiting status
    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Game has already started or finished' },
        { status: 400 }
      );
    }

    // Check if player is already in the game
    const alreadyJoined = await isPlayerInGame(game.id, sessionId);

    if (alreadyJoined) {
      return NextResponse.json(
        { error: 'You have already joined this game' },
        { status: 400 }
      );
    }

    // Add player to the game
    const player = await addPlayer(game.id, sessionId, nickname.trim());

    // Broadcast player joined event
    await pusherServer.trigger(
      getGameChannel(game.id),
      PUSHER_EVENTS.PLAYER_JOINED,
      {
        player
      }
    );

    return NextResponse.json({ game, player }, { status: 200 });
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Failed to join game' },
      { status: 500 }
    );
  }
}
