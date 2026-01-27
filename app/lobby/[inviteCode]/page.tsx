'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './lobby.module.css';
import { useGameEvent } from '@/hooks/useGameChannel';
import { PUSHER_EVENTS } from '@/lib/pusher';
import type { Game, Player } from '@/types/game';

export default function Lobby() {
  const router = useRouter();
  const params = useParams();
  const inviteCode = params.inviteCode as string;

  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [nickname, setNickname] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch game state on mount
  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const response = await fetch(`/api/lobby/${inviteCode}`);

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Game not found');
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setGame(data.game);
        setPlayers(data.players);
        setCurrentPlayer(data.currentPlayer);
        setIsCreator(data.isCreator);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchGameState();
  }, [inviteCode]);

  // Listen for new players joining
  const handlePlayerJoined = useCallback((data: { player: Player }) => {
    setPlayers((prev) => {
      // Check if player already exists
      if (prev.some(p => p.id === data.player.id)) {
        return prev;
      }
      return [...prev, data.player];
    });
  }, []);

  // Listen for game starting
  const handleGameStarted = useCallback(() => {
    router.push(`/game/${inviteCode}`);
  }, [router, inviteCode]);

  useGameEvent(game?.id || null, PUSHER_EVENTS.PLAYER_JOINED, handlePlayerJoined);
  useGameEvent(game?.id || null, PUSHER_EVENTS.GAME_STARTED, handleGameStarted);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsJoining(true);

    try {
      const response = await fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode, nickname })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join game');
      }

      const { game: joinedGame, player } = await response.json();
      setGame(joinedGame);
      setCurrentPlayer(player);
      setIsCreator(joinedGame.creator_session_id === player.session_id);
      // Don't add player locally - the Pusher event will handle it
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleStartGame = async () => {
    if (!game) return;

    setIsStarting(true);
    try {
      const response = await fetch(`/api/games/${game.id}/start`, {
        method: 'POST'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start game');
      }

      // The game started event will handle the redirect
    } catch (err: any) {
      setError(err.message);
      setIsStarting(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/lobby/${inviteCode}`;
    navigator.clipboard.writeText(link);
    alert('Invite link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.loading}>Loading...</div>
        </div>
      </main>
    );
  }

  if (error && !game) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
          <button onClick={() => router.push('/')} className={styles.button}>
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  // Show join form if user hasn't joined yet
  if (!currentPlayer) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Join Game</h1>
          <p className={styles.inviteCode}>Code: {inviteCode}</p>

          <form onSubmit={handleJoin} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="nickname">Your Nickname</label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your nickname"
                maxLength={50}
                required
                className={styles.input}
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" disabled={isJoining} className={styles.button}>
              {isJoining ? 'Joining...' : 'Join Lobby'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Show lobby
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Game Lobby</h1>

        <div className={styles.inviteSection}>
          <p className={styles.inviteCode}>Invite Code: {inviteCode}</p>
          <button onClick={copyInviteLink} className={styles.copyButton}>
            Copy Invite Link
          </button>
        </div>

        <div className={styles.players}>
          <h2>Players ({players.length})</h2>
          <ul className={styles.playerList}>
            {players.map((player, index) => (
              <li key={player.id} className={styles.player}>
                <span className={styles.playerNumber}>{index + 1}</span>
                <span className={styles.playerName}>
                  {player.nickname}
                  {player.id === currentPlayer.id && ' (You)'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {game && (
          <div className={styles.settings}>
            <h3>Game Settings</h3>
            <ul>
              <li>Rounds: {game.settings.rounds}</li>
              <li>Time Limit: {game.settings.timeLimit}s</li>
              <li>Movement: {game.settings.moveAllowed ? 'Allowed' : 'Not allowed'}</li>
              <li>Panning: {game.settings.panAllowed ? 'Allowed' : 'Not allowed'}</li>
              <li>Zoom: {game.settings.zoomAllowed ? 'Allowed' : 'Not allowed'}</li>
            </ul>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {isCreator && (
          <button
            onClick={handleStartGame}
            disabled={isStarting || players.length < 1}
            className={styles.startButton}
          >
            {isStarting ? 'Starting...' : 'Start Game'}
          </button>
        )}

        {!isCreator && (
          <p className={styles.waiting}>Waiting for host to start the game...</p>
        )}
      </div>
    </main>
  );
}
