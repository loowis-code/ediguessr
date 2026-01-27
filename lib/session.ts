import { INVITE_CODE_CHARS, INVITE_CODE_LENGTH } from './constants';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a random session ID for guest players
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Generate a random invite code
 */
export function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * INVITE_CODE_CHARS.length);
    code += INVITE_CODE_CHARS[randomIndex];
  }
  return code;
}

/**
 * Validate invite code format
 */
export function isValidInviteCode(code: string): boolean {
  if (code.length !== INVITE_CODE_LENGTH) {
    return false;
  }
  return /^[A-Z0-9]+$/.test(code);
}
