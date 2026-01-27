import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true
});

// Client-side Pusher instance
export const getPusherClient = () => {
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth',
  });
};

// Event names
export const PUSHER_EVENTS = {
  PLAYER_JOINED: 'player-joined',
  GAME_STARTED: 'game-started',
  ROUND_STARTED: 'round-started',
  GUESS_SUBMITTED: 'guess-submitted',
  ROUND_ENDED: 'round-ended',
  GAME_ENDED: 'game-ended'
} as const;

// Get channel name for a game
export const getGameChannel = (gameId: string) => `private-game-${gameId}`;
