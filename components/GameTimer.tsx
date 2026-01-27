'use client';

import { useEffect, useState } from 'react';
import styles from './GameTimer.module.css';

interface GameTimerProps {
  timeLimit: number;
  onTimeUpdate: (timeRemaining: number) => void;
  onTimeUp: () => void;
}

export default function GameTimer({ timeLimit, onTimeUpdate, onTimeUp }: GameTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  useEffect(() => {
    setTimeRemaining(timeLimit);
  }, [timeLimit]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        onTimeUpdate(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onTimeUpdate, onTimeUp]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining <= 30;

  return (
    <div className={`${styles.timer} ${isLowTime ? styles.lowTime : ''}`}>
      <span className={styles.icon}>⏱️</span>
      <span className={styles.time}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
