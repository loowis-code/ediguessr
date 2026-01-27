import { supabase } from '../supabase';
import type { Game, GameSettings } from '@/types/game';
import { generateInviteCode } from '../session';

/**
 * Create a new game
 */
export async function createGame(
  creatorSessionId: string,
  settings: GameSettings
): Promise<Game> {
  // Generate unique invite code
  let inviteCode = generateInviteCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const { data: existing } = await supabase
      .from('games')
      .select('id')
      .eq('invite_code', inviteCode)
      .single();

    if (!existing) break;

    inviteCode = generateInviteCode();
    attempts++;
  }

  if (attempts === maxAttempts) {
    throw new Error('Failed to generate unique invite code');
  }

  const { data, error } = await supabase
    .from('games')
    .insert({
      invite_code: inviteCode,
      creator_session_id: creatorSessionId,
      status: 'waiting',
      settings
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get game by ID
 */
export async function getGameById(gameId: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data;
}

/**
 * Get game by invite code
 */
export async function getGameByInviteCode(inviteCode: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('invite_code', inviteCode)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data;
}

/**
 * Update game status
 */
export async function updateGameStatus(
  gameId: string,
  status: 'waiting' | 'active' | 'finished'
): Promise<Game> {
  const updates: any = { status };

  if (status === 'active') {
    updates.started_at = new Date().toISOString();
  } else if (status === 'finished') {
    updates.finished_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', gameId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a game (only if waiting)
 */
export async function deleteGame(gameId: string): Promise<void> {
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', gameId)
    .eq('status', 'waiting');

  if (error) throw error;
}
