import { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard';
import PropertyDetail from './PropertyDetail';
import PropertyMap from './PropertyMap';
import type { Property } from '../types/database';
import { supabase } from '../lib/supabase';
import type { SearchFilters } from './SearchBar';
import { Loader2, Layout, Map } from 'lucide-react';

interface PropertyGridProps {
  filters: SearchFilters | null;
}

export default function PropertyGrid({ filters }: PropertyGridProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .order('rating', { ascending: false });

      if (filters) {
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }
        if (filters.minPrice > 0) {
          query = query.gte('price_per_night', filters.minPrice);
        }
        if (filters.maxPrice < 1000) {
          query = query.lte('price_per_night', filters.maxPrice);
        }
        if (filters.bedrooms > 0) {
          query = query.gte('bedrooms', filters.bedrooms);
        }
        if (filters.guests > 1) {
          query = query.gte('max_guests', filters.guests);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const fetchedProps = data || [];
      const ownerIds = Array.from(new Set(fetchedProps.map(p => p.owner_id).filter(Boolean))) as string[];
      
      if (ownerIds.length > 0) {
        const { getProfilesByIds } = await import('../lib/profileService');
        try {
          const profilesMap = await getProfilesByIds(ownerIds);
          fetchedProps.forEach(p => {
            if (p.owner_id && profilesMap[p.owner_id]) {
              p.owner = profilesMap[p.owner_id];
            }
          });
        } catch (profileErr) {
          console.error('Failed to fetch property owner profiles:', profileErr);
        }
      }

      console.log('Fetched properties:', fetchedProps.map(p => ({ id: p.id, image_count: p.image_urls?.length || 0, first_image: p.image_urls?.[0] })));
      setProperties(fetchedProps);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 text-lg">No properties found matching your criteria.</p>
        <p className="text-gray-500 mt-2">Try adjusting your search filters.</p>
      </div>
    );
  }

  return (
    <>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => setSelectedProperty(property)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex bg-gray-200 rounded-lg p-1 mx-auto max-w-max">
            <button
              onClick={() => setViewMode('grid')}
              className="flex items-center space-x-2 px-4 py-2 rounded-l-md font-medium transition-all bg-white text-gray-900 shadow-sm"
            >
              <Layout className="w-5 h-5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className="flex items-center space-x-2 px-4 py-2 rounded-r-md font-medium transition-all bg-white text-gray-900 shadow-sm"
            >
              <Map className="w-5 h-5" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
          <div className="w-full h-[500px] lg:h-[600px] rounded-xl shadow-lg overflow-hidden">
            <PropertyMap
              properties={properties}
              selectedProperty={selectedProperty || undefined}
              onPropertySelect={setSelectedProperty}
              height="100%"
            />
          </div>
        </div>
      )}

      {selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </>
  );
}
