'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Guess, Round, Player } from '@/types/game';
import { formatDistance } from '@/lib/scoring';
import styles from './RoundResults.module.css';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

interface RoundResultsProps {
  round: Round;
  guesses: Guess[];
  players: Player[];
  isCreator: boolean;
  onNextRound: () => void;
  isLastRound: boolean;
}

export default function RoundResults({
  round,
  guesses,
  players,
  isCreator,
  onNextRound,
  isLastRound
}: RoundResultsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  // Match guesses with player names
  const guessesWithPlayers = guesses.map((guess) => {
    const player = players.find((p) => p.id === guess.player_id);
    return { ...guess, playerName: player?.nickname || 'Unknown' };
  });

  // Add players who didn't guess with 0 points
  const playersWhoGuessed = new Set(guesses.map(g => g.player_id));
  const playersWhoDidntGuess = players
    .filter(p => !playersWhoGuessed.has(p.id))
    .map(p => ({
      id: `no-guess-${p.id}`,
      player_id: p.id,
      playerName: p.nickname,
      points: 0,
      distance_meters: 0,
      guess_lat: 0,
      guess_lng: 0,
      time_taken_seconds: 0,
      round_id: round.id,
      submitted_at: ''
    }));

  // Combine and sort by points descending
  const allResults = [...guessesWithPlayers, ...playersWhoDidntGuess];
  allResults.sort((a, b) => b.points - a.points);

  if (!isMounted) {
    return <div className={styles.loading}>Loading results...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Round {round.round_number} Results</h2>

      <div className={styles.mapContainer}>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        {/* @ts-ignore */}
        <MapContainer
          center={[round.location.lat, round.location.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          {/* @ts-ignore */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Actual location marker (star) */}
          {/* @ts-ignore */}
          <Marker position={[round.location.lat, round.location.lng]} />

          {/* Player guesses and lines */}
          {guessesWithPlayers.map((guess) => (
            <div key={guess.id}>
              {/* @ts-ignore */}
              <Marker position={[guess.guess_lat, guess.guess_lng]} />
              {/* @ts-ignore */}
              <Polyline
                positions={[
                  [round.location.lat, round.location.lng],
                  [guess.guess_lat, guess.guess_lng]
                ]}
                color="red"
                weight={2}
                opacity={0.6}
              />
            </div>
          ))}
        </MapContainer>
      </div>

      <div className={styles.results}>
        <h3>Scores</h3>
        <ul className={styles.list}>
          {allResults.map((guess, index) => (
            <li key={guess.id} className={styles.item}>
              <span className={styles.rank}>{index + 1}</span>
              <span className={styles.name}>{guess.playerName}</span>
              <span className={styles.distance}>
                {guess.points === 0 ? 'No guess' : formatDistance(guess.distance_meters)}
              </span>
              <span className={styles.points}>
                {guess.points > 0 ? `+${guess.points.toLocaleString()}` : '0'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {isCreator && (
        <button onClick={onNextRound} className={styles.nextButton}>
          {isLastRound ? 'View Final Results' : 'Next Round'}
        </button>
      )}

      {!isCreator && (
        <p className={styles.waiting}>Waiting for host to continue...</p>
      )}
    </div>
  );
}
