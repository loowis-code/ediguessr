import { MAX_POINTS } from './constants';

/**
 * Calculate points based on distance from actual location
 * Stricter scoring tuned for Edinburgh's compact size (~10km across)
 *
 * Score reference for Edinburgh:
 * - 0m = 5000 points (perfect)
 * - 100m = ~4758 points (same street)
 * - 250m = ~4425 points (couple blocks)
 * - 500m = ~3935 points (different neighborhood)
 * - 1km = ~3033 points (across town)
 * - 2km = ~1839 points (wrong side of city)
 * - 5km = ~440 points (way off)
 *
 * @param distanceMeters - Distance in meters between guess and actual location
 * @returns Points awarded (0-5000)
 */
export function calculatePoints(distanceMeters: number): number {
  const distanceKm = distanceMeters / 1000;
  // Much stricter decay for Edinburgh's compact size
  // Using /1.5 instead of /2000 makes distance matter much more
  const points = Math.round(MAX_POINTS * Math.exp(-distanceKm / 1.5));
  return Math.max(0, Math.min(MAX_POINTS, points));
}

/**
 * Calculate distance between two coordinates using Haversine formula
 *
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
