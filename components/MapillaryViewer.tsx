'use client';

import { useState } from 'react';
import styles from './MapillaryViewer.module.css';

interface MapillaryViewerProps {
  imageId: string;
  imageUrl?: string;
  moveAllowed: boolean;
  panAllowed: boolean;
  zoomAllowed: boolean;
}

export default function MapillaryViewer({
  imageId,
  imageUrl,
  moveAllowed,
  panAllowed,
  zoomAllowed
}: MapillaryViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load street view.');
  };

  // Build Mapillary embed URL
  const embedUrl = `https://www.mapillary.com/embed?image_key=${imageId}&style=photo`;

  return (
    <>
      {isLoading && !error && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading street view...</p>
        </div>
      )}
      {error && (
        <div className={styles.error}>
          <p className={styles.errorIcon}>⚠️</p>
          <p className={styles.errorMessage}>{error}</p>
          <p className={styles.errorHint}>Please try starting a new game.</p>
        </div>
      )}
      <iframe
        src={embedUrl}
        className={styles.iframe}
        style={{ display: isLoading || error ? 'none' : 'block' }}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        allowFullScreen
      />
    </>
  );
}
