'use client';

import { useEffect, useState } from 'react';
import { getPusherClient, getGameChannel, PUSHER_EVENTS } from '@/lib/pusher';
import type { Channel } from 'pusher-js';

export function useGameChannel(gameId: string | null) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    const pusher = getPusherClient();
    const gameChannel = pusher.subscribe(getGameChannel(gameId));

    gameChannel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
    });

    gameChannel.bind('pusher:subscription_error', (error: any) => {
      console.error('Pusher subscription error:', error);
      setIsConnected(false);
    });

    setChannel(gameChannel);

    return () => {
      gameChannel.unbind_all();
      pusher.unsubscribe(getGameChannel(gameId));
      setIsConnected(false);
    };
  }, [gameId]);

  return { channel, isConnected };
}

// Helper hook for specific events
export function useGameEvent<T = any>(
  gameId: string | null,
  eventName: string,
  callback: (data: T) => void
) {
  const { channel } = useGameChannel(gameId);

  useEffect(() => {
    if (!channel) return;

    channel.bind(eventName, callback);

    return () => {
      channel.unbind(eventName, callback);
    };
  }, [channel, eventName, callback]);
}
