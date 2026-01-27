'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './create.module.css';
import { DEFAULT_GAME_SETTINGS } from '@/lib/constants';
import type { GameSettings } from '@/types/game';

export default function CreateGame() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    try {
      const response = await fetch('/api/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, settings })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create game');
      }

      const { game } = await response.json();
      router.push(`/lobby/${game.invite_code}`);
    } catch (err: any) {
      setError(err.message);
      setIsCreating(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Create Game</h1>

        <form onSubmit={handleCreate} className={styles.form}>
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

          <div className={styles.field}>
            <label htmlFor="rounds">Number of Rounds</label>
            <input
              id="rounds"
              type="number"
              value={settings.rounds}
              onChange={(e) => {
                const value = e.target.value === '' ? 1 : parseInt(e.target.value);
                setSettings({ ...settings, rounds: isNaN(value) ? 1 : value });
              }}
              min={1}
              max={10}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="timeLimit">Time Limit (seconds)</label>
            <input
              id="timeLimit"
              type="number"
              value={settings.timeLimit}
              onChange={(e) => {
                const value = e.target.value === '' ? 60 : parseInt(e.target.value);
                setSettings({ ...settings, timeLimit: isNaN(value) ? 60 : value });
              }}
              min={60}
              max={600}
              step={30}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={settings.moveAllowed}
                onChange={(e) =>
                  setSettings({ ...settings, moveAllowed: e.target.checked })
                }
              />
              <span>Allow movement</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={settings.panAllowed}
                onChange={(e) =>
                  setSettings({ ...settings, panAllowed: e.target.checked })
                }
              />
              <span>Allow panning</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={settings.zoomAllowed}
                onChange={(e) =>
                  setSettings({ ...settings, zoomAllowed: e.target.checked })
                }
              />
              <span>Allow zoom</span>
            </label>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={isCreating}
            className={styles.submitButton}
          >
            {isCreating ? 'Creating...' : 'Create Game'}
          </button>
        </form>
      </div>
    </main>
  );
}
