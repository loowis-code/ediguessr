import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    // Fetch all guesses for rounds in this game
    const { data, error } = await supabase
      .from('guesses')
      .select(`
        *,
        rounds!inner(game_id)
      `)
      .eq('rounds.game_id', gameId);

    if (error) throw error;

    return NextResponse.json({ guesses: data || [] });
  } catch (error) {
    console.error('Error fetching guesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guesses' },
      { status: 500 }
    );
  }
}
