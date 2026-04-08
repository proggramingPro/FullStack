import { createClient } from '@supabase/supabase-js';
import { geocodeBatch } from '../src/lib/geocoding.js';
import type { Database } from '../src/types/database.js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // From Supabase dashboard Settings > API

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function migrateCoords() {
  console.log('Fetching properties without coordinates...');
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, location, lat, lng')
    .or('lat.is.null, lng.is.null, lat.eq.0, lng.eq.0');

  if (error) throw error;
  if (!properties || properties.length === 0) {
    console.log('No properties need migration.');
    return;
  }

  console.log(`Found ${properties.length} properties to geocode.`);

  // Group unique locations
  const uniqueLocations = Array.from(new Set(properties.map(p => p.location)));
  console.log(`Unique locations: ${uniqueLocations.length}`);

  const results = await geocodeBatch(uniqueLocations, { onError: 'skip' });
  console.log(`${results.size}/${uniqueLocations.length} locations geocoded.`);

  // Update each property
  for (const prop of properties) {
    const coords = results.get(prop.location);
    if (coords) {
      const { error: updateError } = await supabase
        .from('properties')
        .update({ lat: coords.lat, lng: coords.lng })
        .eq('id', prop.id);
      if (updateError) {
        console.error(`Failed to update ${prop.id}:`, updateError);
      } else {
        console.log(`Updated ${prop.location} -> (${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)})`);
      }
    }
  }

  console.log('Migration complete!');
}

migrateCoords().catch(console.error);

