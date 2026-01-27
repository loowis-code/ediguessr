'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './game.module.css';
import { useGameEvent } from '@/hooks/useGameChannel';
import { PUSHER_EVENTS } from '@/lib/pusher';
import type { Game, Round, Player, Guess } from '@/types/game';
import MapillaryViewer from '@/components/MapillaryViewer';
import GuessMap from '@/components/GuessMap';
import GameTimer from '@/components/GameTimer';
import ScoreDisplay from '@/components/ScoreDisplay';
import RoundResults from '@/components/RoundResults';

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const inviteCode = params.inviteCode as string;

  const [game, setGame] = useState<Game | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [guessLocation, setGuessLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');

  // Use ref for hasGuessed to avoid stale closures
  const hasGuessedRef = useRef(false);
  const guessLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const timeRemainingRef = useRef(0);

  useEffect(() => {
    hasGuessedRef.current = hasGuessed;
  }, [hasGuessed]);

  useEffect(() => {
    guessLocationRef.current = guessLocation;
  }, [guessLocation]);

  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  // Memoize callbacks to prevent render issues
  const handleTimeUpdate = useCallback((time: number) => {
    timeRemainingRef.current = time;
    // Use setTimeout to defer the state update
    setTimeout(() => {
      setTimeRemaining(time);
    }, 0);
  }, []);

  const handleSubmitGuess = useCallback(async () => {
    const location = guessLocationRef.current;
    if (!location || !currentRound || hasGuessedRef.current) return;

    setIsSubmitting(true);
    setError('');

    try {
      const timeTaken = (game?.settings.timeLimit || 120) - timeRemainingRef.current;

      const response = await fetch(`/api/rounds/${currentRound.id}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guessLat: location.lat,
          guessLng: location.lng,
          timeTakenSeconds: timeTaken
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit guess');
      }

      const { guess } = await response.json();
      setHasGuessed(true);
      setGuesses([guess]);

      // Show results after a short delay
      setTimeout(() => {
        setShowResults(true);
      }, 500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentRound, game]);

  const handleTimeUp = useCallback(async () => {
    // If player has a guess location but hasn't submitted, auto-submit it
    if (!hasGuessedRef.current && guessLocationRef.current) {
      await handleSubmitGuess();
    }

    // Always show results when time is up, even if player didn't guess
    // (They'll get 0 points if they didn't submit a guess)
    setTimeout(() => {
      setShowResults(true);
    }, 1000);
  }, [handleSubmitGuess]);

  // Fetch initial game state
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/lobby/${inviteCode}`);
        if (!response.ok) throw new Error('Game not found');

        const data = await response.json();
        setGame(data.game);
        setPlayers(data.players);
        setCurrentPlayer(data.currentPlayer);
        setIsCreator(data.isCreator);

        // Fetch rounds for the game
        if (data.game.id) {
          const gameResponse = await fetch(`/api/games/${data.game.id}`);
          if (gameResponse.ok) {
            const gameData = await gameResponse.json();
            if (gameData.rounds && gameData.rounds.length > 0) {
              // Get the latest round
              const latestRound = gameData.rounds[gameData.rounds.length - 1];
              setCurrentRound(latestRound);
              setTimeRemaining(data.game.settings.timeLimit);

              // Fetch guesses for this round
              // TODO: Add API endpoint to fetch guesses
            }
          }
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchGame();
  }, [inviteCode]);

  // Handle round started
  const handleRoundStarted = useCallback((data: { round: Round }) => {
    setCurrentRound(data.round);
    setHasGuessed(false);
    setGuessLocation(null);
    setGuesses([]);
    setShowResults(false);
    setTimeRemaining(game?.settings.timeLimit || 120);
  }, [game]);

  // Handle game ended
  const handleGameEnded = useCallback(() => {
    router.push(`/results/${inviteCode}`);
  }, [router, inviteCode]);

  // Handle guess submitted (from other players)
  const handleGuessSubmitted = useCallback(() => {
    // Could add a visual indicator that another player has guessed
  }, []);

  useGameEvent(game?.id || null, PUSHER_EVENTS.ROUND_STARTED, handleRoundStarted);
  useGameEvent(game?.id || null, PUSHER_EVENTS.GAME_ENDED, handleGameEnded);
  useGameEvent(game?.id || null, PUSHER_EVENTS.GUESS_SUBMITTED, handleGuessSubmitted);

  const handleGuessPlaced = (lat: number, lng: number) => {
    setGuessLocation({ lat, lng });
  };

  const handleNextRound = async () => {
    if (!game) return;

    try {
      const response = await fetch(`/api/games/${game.id}/next-round`, {
        method: 'POST'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start next round');
      }

      const { gameEnded } = await response.json();
      if (gameEnded) {
        // Will be handled by GAME_ENDED event
      }
      // Otherwise will be handled by ROUND_STARTED event
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!game || !currentRound) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>Loading game...</div>
      </main>
    );
  }

  // Show results after guessing
  if (showResults && currentPlayer) {
    return (
      <main className={styles.main}>
        <RoundResults
          round={currentRound}
          guesses={guesses}
          players={players}
          isCreator={isCreator}
          onNextRound={handleNextRound}
          isLastRound={currentRound.round_number >= game.settings.rounds}
        />
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.gameContainer}>
        {/* Street View */}
        <div className={styles.streetView}>
          <MapillaryViewer
            imageId={currentRound.location.mapillary_image_id}
            imageUrl={currentRound.location.image_url}
            moveAllowed={game.settings.moveAllowed}
            panAllowed={game.settings.panAllowed}
            zoomAllowed={game.settings.zoomAllowed}
          />
        </div>

        {/* Guess Map & Controls */}
        <div className={styles.controls}>
          <div className={styles.topBar}>
            <GameTimer
              timeLimit={game.settings.timeLimit}
              onTimeUpdate={handleTimeUpdate}
              onTimeUp={handleTimeUp}
            />
            <div className={styles.roundInfo}>
              Round {currentRound.round_number} / {game.settings.rounds}
            </div>
          </div>

          <div className={styles.mapContainer}>
            <GuessMap
              onGuessPlaced={handleGuessPlaced}
              guessLocation={guessLocation}
              disabled={hasGuessed}
            />
          </div>

          <div className={styles.actions}>
            {error && <div className={styles.error}>{error}</div>}

            <button
              onClick={handleSubmitGuess}
              disabled={!guessLocation || hasGuessed || isSubmitting}
              className={styles.submitButton}
            >
              {hasGuessed ? 'Guess Submitted' : isSubmitting ? 'Submitting...' : 'Submit Guess'}
            </button>
          </div>

          <ScoreDisplay players={players} guesses={guesses} />
        </div>
      </div>
    </main>
  );
}
