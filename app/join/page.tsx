'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './join.module.css';

export default function JoinGame() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      router.push(`/lobby/${inviteCode.toUpperCase()}`);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Join Game</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="inviteCode">Invite Code</label>
            <input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
              required
              className={styles.input}
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Join Game
          </button>
        </form>
      </div>
    </main>
  );
}
