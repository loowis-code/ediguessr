import { EDINBURGH_BOUNDS } from './constants';
import { fetchMapillaryImages, MapillaryImage } from './mapillary';
import type { Location } from '@/types/game';
import { getCuratedLocation } from './curated-locations';

const MAX_RETRIES = 3; // Reduced retries to fail faster
const USE_CURATED_FALLBACK = true; // Set to true to use curated locations when API fails

/**
 * Generate a random location within Edinburgh bounds
 */
function generateRandomCoordinates(): { lat: number; lng: number } {
  const lat =
    EDINBURGH_BOUNDS.south +
    Math.random() * (EDINBURGH_BOUNDS.north - EDINBURGH_BOUNDS.south);
  const lng =
    EDINBURGH_BOUNDS.west +
    Math.random() * (EDINBURGH_BOUNDS.east - EDINBURGH_BOUNDS.west);

  return { lat, lng };
}

/**
 * Find a random street view location in Edinburgh
 * Retries up to MAX_RETRIES times if no images found
 * Falls back to curated locations if API fails
 */
export async function getRandomEdinburghLocation(): Promise<Location> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const { lat, lng } = generateRandomCoordinates();

      // Create a small bounding box around the random point
      const searchRadius = 0.01; // approximately 1km
      const bbox = {
        west: lng - searchRadius,
        south: lat - searchRadius,
        east: lng + searchRadius,
        north: lat + searchRadius
      };

      const images = await fetchMapillaryImages(bbox, 50);

      if (images.length > 0) {
        // Pick a random image from the results
        const randomImage: any = images[Math.floor(Math.random() * images.length)];
        const coords = randomImage.computed_geometry?.coordinates || randomImage.geometry.coordinates;

        console.log(`Selected image: ${randomImage.id} (is_pano: ${randomImage.is_pano})`);

        return {
          lat: coords[1],
          lng: coords[0],
          mapillary_image_id: randomImage.id,
          image_url: randomImage.thumb_1024_url // Include thumbnail URL as fallback
        };
      }

      console.log(`Attempt ${attempt + 1}: No images found at ${lat}, ${lng}`);
    } catch (error: any) {
      console.error(`Error fetching location (attempt ${attempt + 1}):`, error);

      // If it's a Mapillary API error and we have fallback enabled, use curated locations
      if (USE_CURATED_FALLBACK &&
          (error.message?.includes('Service temporarily unavailable') ||
           error.message?.includes('MLYApiException'))) {
        console.log('Mapillary API unavailable, using curated location');
        return getCuratedLocation();
      }
    }
  }

  // If all retries failed, use curated location as final fallback
  if (USE_CURATED_FALLBACK) {
    console.log('All API attempts failed, using curated location');
    return getCuratedLocation();
  }

  throw new Error(
    `Unable to find Edinburgh street view locations. This might be due to Mapillary API issues. Please try again in a moment.`
  );
}
