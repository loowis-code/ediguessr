'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './results.module.css';
import type { Game, Player, Guess } from '@/types/game';
import { formatDistance } from '@/lib/scoring';

interface PlayerStats {
  player: Player;
  totalPoints: number;
  averageDistance: number;
  bestGuess: number;
  worstGuess: number;
}

export default function FinalResults() {
  const router = useRouter();
  const params = useParams();
  const inviteCode = params.inviteCode as string;

  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/lobby/${inviteCode}`);
        if (!response.ok) throw new Error('Game not found');

        const data = await response.json();
        setGame(data.game);
        setPlayers(data.players);

        // Fetch all game data including rounds and guesses
        if (data.game.id) {
          const gameResponse = await fetch(`/api/games/${data.game.id}`);
          if (gameResponse.ok) {
            const gameData = await gameResponse.json();

            // Fetch all guesses for the game
            const guessesResponse = await fetch(`/api/games/${data.game.id}/guesses`);
            if (guessesResponse.ok) {
              const guessesData = await guessesResponse.json();
              const allGuesses: Guess[] = guessesData.guesses || [];

              // Calculate stats for each player
              const stats: PlayerStats[] = data.players.map((player: Player) => {
                const playerGuesses = allGuesses.filter(g => g.player_id === player.id);

                if (playerGuesses.length === 0) {
                  return {
                    player,
                    totalPoints: 0,
                    averageDistance: 0,
                    bestGuess: 0,
                    worstGuess: 0
                  };
                }

                const totalPoints = playerGuesses.reduce((sum, g) => sum + g.points, 0);
                const totalDistance = playerGuesses.reduce((sum, g) => sum + g.distance_meters, 0);
                const distances = playerGuesses.map(g => g.distance_meters);

                return {
                  player,
                  totalPoints,
                  averageDistance: totalDistance / playerGuesses.length,
                  bestGuess: Math.min(...distances),
                  worstGuess: Math.max(...distances)
                };
              });

              setPlayerStats(stats);
            }
          }
        }

        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [inviteCode]);

  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>Loading results...</div>
      </main>
    );
  }

  if (error || !game) {
    return (
      <main className={styles.main}>
        <div className={styles.error}>{error || 'Game not found'}</div>
        <Link href="/" className={styles.homeButton}>
          Back to Home
        </Link>
      </main>
    );
  }

  // Sort players by total points
  const sortedStats = [...playerStats].sort((a, b) => b.totalPoints - a.totalPoints);
  const winner = sortedStats[0];

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Game Over!</h1>
          {winner && (
            <div className={styles.winner}>
              <div className={styles.trophy}>🏆</div>
              <h2 className={styles.winnerName}>{winner.player.nickname}</h2>
              <p className={styles.winnerPoints}>{winner.totalPoints.toLocaleString()} points</p>
            </div>
          )}
        </div>

        <div className={styles.stats}>
          <h3>Final Standings</h3>
          <ul className={styles.standings}>
            {sortedStats.map((stat, index) => (
              <li key={stat.player.id} className={styles.standing}>
                <div className={styles.rank}>
                  <span className={styles.rankNumber}>#{index + 1}</span>
                  {index === 0 && <span className={styles.medal}>🥇</span>}
                  {index === 1 && <span className={styles.medal}>🥈</span>}
                  {index === 2 && <span className={styles.medal}>🥉</span>}
                </div>
                <div className={styles.playerInfo}>
                  <span className={styles.playerName}>{stat.player.nickname}</span>
                  <div className={styles.playerStats}>
                    <span className={styles.totalPoints}>
                      {stat.totalPoints.toLocaleString()} pts
                    </span>
                    {stat.averageDistance > 0 && (
                      <>
                        <span className={styles.divider}>•</span>
                        <span className={styles.avgDistance}>
                          Avg: {formatDistance(stat.averageDistance)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.gameInfo}>
          <h3>Game Summary</h3>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Rounds Played</span>
              <span className={styles.summaryValue}>{game.settings.rounds}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Time per Round</span>
              <span className={styles.summaryValue}>{game.settings.timeLimit}s</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Players</span>
              <span className={styles.summaryValue}>{players.length}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Location</span>
              <span className={styles.summaryValue}>Edinburgh 🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/" className={styles.homeButton}>
            Back to Home
          </Link>
          <Link href="/create" className={styles.playAgainButton}>
            Play Again
          </Link>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Thanks for playing EdiGuessr!
          </p>
        </div>
      </div>
    </main>
  );
}
