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
      console.log('Fetched properties:', data?.map(p => ({ id: p.id, image_count: p.image_urls?.length || 0, first_image: p.image_urls?.[0] })) || []);
      setProperties(data || []);
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
      <div className="mb-6 flex justify-center">
        <div className="flex bg-gray-200 rounded-lg p-1 gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layout className="w-5 h-5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
              viewMode === 'map'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Map className="w-5 h-5" />
            <span className="hidden sm:inline">Map</span>
          </button>
        </div>
      </div>

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
        <div className="fixed inset-0 z-40 bg-white flex flex-col max-h-screen overflow-hidden">
          <div className="p-6 border-b bg-white/90 backdrop-blur-sm flex justify-center items-center gap-4 z-50 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Layout className="w-5 h-5" />
              <span className="text-sm font-medium">Grid View</span>
            </button>
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <Map className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden p-2 sm:p-4">
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
