import { supabase } from '../supabase';
import type { Guess } from '@/types/game';
import { calculateDistance, calculatePoints } from '../scoring';

/**
 * Submit a guess for a round
 */
export async function submitGuess(
  roundId: string,
  playerId: string,
  guessLat: number,
  guessLng: number,
  actualLat: number,
  actualLng: number,
  timeTakenSeconds: number
): Promise<Guess> {
  const distanceMeters = calculateDistance(guessLat, guessLng, actualLat, actualLng);
  const points = calculatePoints(distanceMeters);

  const { data, error } = await supabase
    .from('guesses')
    .insert({
      round_id: roundId,
      player_id: playerId,
      guess_lat: guessLat,
      guess_lng: guessLng,
      distance_meters: distanceMeters,
      points,
      time_taken_seconds: timeTakenSeconds
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all guesses for a round
 */
export async function getGuessesByRoundId(roundId: string): Promise<Guess[]> {
  const { data, error } = await supabase
    .from('guesses')
    .select('*')
    .eq('round_id', roundId)
    .order('submitted_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get all guesses for a player in a game
 */
export async function getGuessesByPlayerId(playerId: string): Promise<Guess[]> {
  const { data, error } = await supabase
    .from('guesses')
    .select('*')
    .eq('player_id', playerId)
    .order('submitted_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Check if a player has submitted a guess for a round
 */
export async function hasPlayerGuessed(
  roundId: string,
  playerId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('guesses')
    .select('id')
    .eq('round_id', roundId)
    .eq('player_id', playerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return false; // Not found
    throw error;
  }

  return !!data;
}

/**
 * Get total points for a player across all rounds in a game
 */
export async function getPlayerTotalPoints(
  playerId: string,
  gameId: string
): Promise<number> {
  const { data, error } = await supabase
    .from('guesses')
    .select('points, rounds!inner(game_id)')
    .eq('player_id', playerId)
    .eq('rounds.game_id', gameId);

  if (error) throw error;

  if (!data || data.length === 0) return 0;

  return data.reduce((total, guess) => total + guess.points, 0);
}
