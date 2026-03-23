export interface Coordinates {
  lat: number;
  lng: number;
}
const GEOLOCATION_CACHE: Map<string, Coordinates> = new Map();

export async function geocodeLocation(location: string): Promise<Coordinates> {
  if (GEOLOCATION_CACHE.has(location)) {
    return GEOLOCATION_CACHE.get(location)!;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
      {
        headers: {
          'User-Agent': 'HomeStay-App',
        },
      }
    );

    if (!response.ok) throw new Error('Geocoding failed');

    const data = await response.json();
    if (!data || data.length === 0) {
      return { lat: 40.7128, lng: -74.006 };
    }

    const coords: Coordinates = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

    GEOLOCATION_CACHE.set(location, coords);
    return coords;
  } catch (error) {
    console.error('Geocoding error:', error);
    return { lat: 40.7128, lng: -74.006 };
  }
}

export async function geocodeBatch(locations: string[]): Promise<Map<string, Coordinates>> {
  const results = new Map<string, Coordinates>();
  for (const location of locations) {
    const coords = await geocodeLocation(location);
    results.set(location, coords);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}
