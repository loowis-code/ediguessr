'use client';

import type { Player, Guess } from '@/types/game';
import styles from './ScoreDisplay.module.css';

interface ScoreDisplayProps {
  players: Player[];
  guesses: Guess[];
}

export default function ScoreDisplay({ players, guesses }: ScoreDisplayProps) {
  // Calculate total scores per player
  const playerScores = players.map((player) => {
    const playerGuesses = guesses.filter((g) => g.player_id === player.id);
    const totalPoints = playerGuesses.reduce((sum, g) => sum + g.points, 0);
    return {
      player,
      totalPoints,
      hasGuessed: playerGuesses.length > 0
    };
  });

  // Sort by total points descending
  playerScores.sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Scores</h3>
      <ul className={styles.list}>
        {playerScores.map((ps, index) => (
          <li key={ps.player.id} className={styles.item}>
            <span className={styles.rank}>{index + 1}</span>
            <span className={styles.name}>
              {ps.player.nickname}
              {ps.hasGuessed && <span className={styles.badge}>✓</span>}
            </span>
            <span className={styles.points}>{ps.totalPoints.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
