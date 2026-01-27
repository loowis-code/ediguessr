const MAPILLARY_API_URL = 'https://graph.mapillary.com';
const MAPILLARY_TOKEN = process.env.MAPILLARY_CLIENT_TOKEN;

export interface MapillaryImage {
  id: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  computed_geometry?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface MapillaryImagesResponse {
  data: MapillaryImage[];
}

/**
 * Fetch Mapillary images within a bounding box
 */
export async function fetchMapillaryImages(
  bbox: { west: number; south: number; east: number; north: number },
  limit = 50
): Promise<MapillaryImage[]> {
  if (!MAPILLARY_TOKEN) {
    throw new Error('MAPILLARY_CLIENT_TOKEN is not set');
  }

  const bboxString = `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`;

  const url = new URL(`${MAPILLARY_API_URL}/images`);
  url.searchParams.set('bbox', bboxString);
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('access_token', MAPILLARY_TOKEN);
  url.searchParams.set('fields', 'id,geometry,computed_geometry,thumb_1024_url,is_pano');

  console.log(`Fetching Mapillary images with bbox: ${bboxString}`);

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mapillary API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Mapillary API error (${response.status}): ${response.statusText} - ${errorText}`);
    }

    const data: MapillaryImagesResponse = await response.json();
    console.log(`Mapillary API returned ${data.data?.length || 0} images for bbox ${bboxString}`);

    // Log first image details for debugging
    if (data.data && data.data.length > 0) {
      console.log('Sample image data:', JSON.stringify(data.data[0], null, 2));
    }

    return data.data || [];
  } catch (error) {
    console.error('Error fetching Mapillary images:', error);
    throw error;
  }
}

/**
 * Get a single image by ID
 */
export async function getMapillaryImage(imageId: string): Promise<MapillaryImage | null> {
  if (!MAPILLARY_TOKEN) {
    throw new Error('MAPILLARY_CLIENT_TOKEN is not set');
  }

  const url = new URL(`${MAPILLARY_API_URL}/images/${imageId}`);
  url.searchParams.set('access_token', MAPILLARY_TOKEN);

  const response = await fetch(url.toString());

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Mapillary API error: ${response.statusText}`);
  }

  return await response.json();
}
