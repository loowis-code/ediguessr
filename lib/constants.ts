// Edinburgh bounds for location generation
export const EDINBURGH_BOUNDS = {
  north: 55.9900,
  south: 55.9000,
  east: -3.1000,
  west: -3.2500
} as const;

// Game defaults
export const DEFAULT_GAME_SETTINGS = {
  rounds: 5,
  timeLimit: 120, // seconds
  moveAllowed: false,
  panAllowed: true,
  zoomAllowed: true
} as const;

// Scoring
export const MAX_POINTS = 5000;

// Invite code
export const INVITE_CODE_LENGTH = 6;
export const INVITE_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
