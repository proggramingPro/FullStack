export interface Coordinates {
  lat: number;
  lng: number;
}

export class GeocodingError extends Error {
  constructor(
    message: string,
    public readonly location: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'GeocodingError';
  }
}

const GEOLOCATION_CACHE = new Map<string, Coordinates>();
const NOMINATIM_DELAY_MS = 1100;
const FETCH_TIMEOUT_MS = 10_000;

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < NOMINATIM_DELAY_MS) {
    await new Promise((r) => setTimeout(r, NOMINATIM_DELAY_MS - elapsed));
  }
  lastRequestTime = Date.now();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: { 'User-Agent': 'HomeStay-App/1.0' },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function queryNominatim(query: string): Promise<Coordinates | null> {
const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1&countrycodes=in&bounded=1&viewbox=68.17665,8.08226,97.43437,35.49487`;
  const response = await rateLimitedFetch(url);

  if (!response.ok) return null;

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const lat = parseFloat(data[0].lat);
  const lng = parseFloat(data[0].lon);
  if (isNaN(lat) || isNaN(lng)) return null;

  return { lat, lng };
}

function buildFallbackQueries(address: string): string[] {
  // Normalize address
  const cleanAddress = address.replace(/\s*,\s*/g, ',').trim();
  
  const parts = cleanAddress
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const queries: string[] = [];

  const addQuery = (q: string) => {
    if (!q) return;
    const withCountry = /india/i.test(q) ? q : `${q}, India`;
    queries.push(q);
    queries.push(withCountry);
  };

  // 1. Try full address first (structured format helps Nominatim)
  addQuery(parts.join(', '));

  // Regex to identify granular Indian address markers that commonly fail in OpenStreetMap
  const granularRegex = /\b(plot|flat|shop|door|room|house|no\.?|number|bldg|building|block|phase|sector|area|survey)\s*([a-zA-Z0-9\-\/]+)?\b/gi;

  // 2. Drop leading parts (house no, apartment name) progressively
  for (let i = 1; i < parts.length; i++) {
    const simplified = parts.slice(i).join(', ');
    addQuery(simplified);
  }

  // 3. Try scrubbing highly specific granular terms from the original address if it lacks commas
  // e.g., "Plot 43 Area 51 New Delhi" -> "New Delhi"
  const scrubbedAddress = cleanAddress.replace(granularRegex, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  if (scrubbedAddress && scrubbedAddress !== cleanAddress) {
    addQuery(scrubbedAddress);
  }

  return [...new Set(queries)]; // dedupe
}

export async function geocodeLocation(location: string): Promise<Coordinates> {
  const cacheKey = location.trim().toLowerCase();
  if (GEOLOCATION_CACHE.has(cacheKey)) {
    return GEOLOCATION_CACHE.get(cacheKey)!;
  }

  const queries = buildFallbackQueries(location.trim());

  for (const query of queries) {
    try {
      const coords = await queryNominatim(query);
      if (coords) {
        console.info(`Geocoded "${location}" using query: "${query}"`);
        GEOLOCATION_CACHE.set(cacheKey, coords);
        return coords;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new GeocodingError(`Geocoding timed out`, location, error);
      }
      // network blip — keep trying next query
      console.warn(`Query failed: "${query}"`, error);
    }
  }

  throw new GeocodingError(
    `Could not geocode "${location}" — no results from any fallback query`,
    location
  );
}

export async function geocodeBatch(
  locations: string[],
  {
    onError = 'skip',
  }: {
    onError?: 'skip' | 'throw';
  } = {}
): Promise<Map<string, Coordinates>> {
  const results = new Map<string, Coordinates>();

  for (const location of locations) {
    try {
      results.set(location, await geocodeLocation(location));
    } catch (error) {
      if (onError === 'throw') throw error;
      console.error(`Skipping "${location}":`, error);
    }
  }

  return results;
}