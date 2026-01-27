'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './GuessMap.module.css';

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

const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
);

interface GuessMapProps {
  onGuessPlaced: (lat: number, lng: number) => void;
  guessLocation: { lat: number; lng: number } | null;
  disabled?: boolean;
}

export default function GuessMap({ onGuessPlaced, guessLocation, disabled }: GuessMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Fix for Leaflet default marker icons
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

  if (!isMounted) {
    return <div className={styles.loading}>Loading map...</div>;
  }

  const MapClickHandler = () => {
    const { useMapEvents } = require('react-leaflet');
    useMapEvents({
      click(e: any) {
        if (!disabled) {
          onGuessPlaced(e.latlng.lat, e.latlng.lng);
        }
      },
    });
    return null;
  };

  return (
    <div className={styles.mapWrapper}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      {/* @ts-ignore */}
      <MapContainer
        center={[55.9533, -3.1883]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        {/* @ts-ignore */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />
        {guessLocation && (
          // @ts-ignore
          <Marker position={[guessLocation.lat, guessLocation.lng]} />
        )}
      </MapContainer>
      {!guessLocation && !disabled && (
        <div className={styles.hint}>Click on the map to place your guess</div>
      )}
    </div>
  );
}
