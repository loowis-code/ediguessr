import { supabase } from '../supabase';
import type { Round, Location } from '@/types/game';

/**
 * Create a new round
 */
export async function createRound(
  gameId: string,
  roundNumber: number,
  location: Location
): Promise<Round> {
  const { data, error } = await supabase
    .from('rounds')
    .insert({
      game_id: gameId,
      round_number: roundNumber,
      location
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all rounds for a game
 */
export async function getRoundsByGameId(gameId: string): Promise<Round[]> {
  const { data, error } = await supabase
    .from('rounds')
    .select('*')
    .eq('game_id', gameId)
    .order('round_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get a specific round
 */
export async function getRoundById(roundId: string): Promise<Round | null> {
  const { data, error } = await supabase
    .from('rounds')
    .select('*')
    .eq('id', roundId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data;
}

/**
 * Get current round number for a game
 */
export async function getCurrentRoundNumber(gameId: string): Promise<number> {
  const { data, error } = await supabase
    .from('rounds')
    .select('round_number')
    .eq('game_id', gameId)
    .order('round_number', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return 0; // No rounds yet
    throw error;
  }

  return data.round_number;
}
