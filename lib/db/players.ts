import { supabase } from '../supabase';
import type { Player } from '@/types/game';

/**
 * Add a player to a game
 */
export async function addPlayer(
  gameId: string,
  sessionId: string,
  nickname: string
): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .insert({
      game_id: gameId,
      session_id: sessionId,
      nickname
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all players in a game
 */
export async function getPlayersByGameId(gameId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get a player by session ID and game ID
 */
export async function getPlayerBySession(
  gameId: string,
  sessionId: string
): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .eq('session_id', sessionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data;
}

/**
 * Check if a player is in a game
 */
export async function isPlayerInGame(
  gameId: string,
  sessionId: string
): Promise<boolean> {
  const player = await getPlayerBySession(gameId, sessionId);
  return player !== null;
}

/**
 * Remove a player from a game
 */
export async function removePlayer(playerId: string): Promise<void> {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', playerId);

  if (error) throw error;
}
