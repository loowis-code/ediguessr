import type { Location } from '@/types/game';

/**
 * Curated list of Edinburgh locations
 * NOTE: These are fallback locations when Mapillary API fails
 * The image IDs may not be valid - this is a known limitation
 * For production, you would need to manually collect valid image IDs
 * or implement a different street view provider
 */
export const CURATED_EDINBURGH_LOCATIONS: Location[] = [
  {
    lat: 55.9533,
    lng: -3.1883,
    mapillary_image_id: 'FALLBACK_LOCATION' // Placeholder
  },
  {
    lat: 55.9486,
    lng: -3.1992,
    mapillary_image_id: 'FALLBACK_LOCATION'
  },
  {
    lat: 55.9511,
    lng: -3.1884,
    mapillary_image_id: 'FALLBACK_LOCATION'
  },
  {
    lat: 55.9533,
    lng: -3.1725,
    mapillary_image_id: 'FALLBACK_LOCATION'
  },
  {
    lat: 55.9578,
    lng: -3.2025,
    mapillary_image_id: 'FALLBACK_LOCATION'
  }
];

/**
 * Get a random location from the curated list
 */
export function getCuratedLocation(): Location {
  const randomIndex = Math.floor(Math.random() * CURATED_EDINBURGH_LOCATIONS.length);
  return CURATED_EDINBURGH_LOCATIONS[randomIndex];
}
