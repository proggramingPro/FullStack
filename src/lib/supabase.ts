import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const propertiesBucket = supabase.storage.from('properties');

// getImageUrl helper for storage paths (not needed for direct URLs)
export function getImageUrl(path: string): string {
  const { data } = propertiesBucket.getPublicUrl(path);
  return data.publicUrl;
}
