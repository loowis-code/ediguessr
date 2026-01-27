import { NextRequest, NextResponse } from 'next/server';
import { createGame } from '@/lib/db/games';
import { addPlayer } from '@/lib/db/players';
import { DEFAULT_GAME_SETTINGS } from '@/lib/constants';
import type { GameSettings } from '@/types/game';

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
    const { nickname, settings } = body;

    if (!nickname || nickname.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nickname is required' },
        { status: 400 }
      );
    }

    // Merge provided settings with defaults
    const gameSettings: GameSettings = {
      ...DEFAULT_GAME_SETTINGS,
      ...settings
    };

    // Validate settings
    if (gameSettings.rounds < 1 || gameSettings.rounds > 10) {
      return NextResponse.json(
        { error: 'Rounds must be between 1 and 10' },
        { status: 400 }
      );
    }

    if (gameSettings.timeLimit < 60 || gameSettings.timeLimit > 600) {
      return NextResponse.json(
        { error: 'Time limit must be between 60 and 600 seconds' },
        { status: 400 }
      );
    }

    // Create the game
    const game = await createGame(sessionId, gameSettings);

    // Add the creator as the first player
    await addPlayer(game.id, sessionId, nickname.trim());

    return NextResponse.json({ game }, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}
