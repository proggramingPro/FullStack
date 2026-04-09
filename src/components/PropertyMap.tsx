import { useEffect, useRef, useState } from 'react';
import L, { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Property } from '../types/database';
import { geocodeLocation, type Coordinates } from '../lib/geocoding';

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: Property;
  onPropertySelect?: (property: Property) => void;
  center?: Coordinates;
  zoom?: number;
  height?: string;
}

export default function PropertyMap({
  properties,
  selectedProperty,
  onPropertySelect,
  center,
  zoom = 13,
  height = '500px',
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef<Map<string, L.Marker>>(new Map());
  const [loading, setLoading] = useState(true);
  const [propertyCoords, setPropertyCoords] = useState<Map<string, Coordinates>>(new Map());

  useEffect(() => {
    const initMap = async () => {
      if (!mapContainer.current) return;

      map.current = L.map(mapContainer.current).setView([center?.lat || 40.7128, center?.lng || -74.006], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);

      setLoading(false);
    };

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || loading) return;

    const updateMarkers = async () => {
      const coords = new Map<string, Coordinates>();

      for (const property of properties) {
        if (!propertyCoords.has(property.location)) {
          const coord = await geocodeLocation(property.location);
          coords.set(property.location, coord);
        }
      }

      if (coords.size > 0) {
        setPropertyCoords((prev) => new Map([...prev, ...coords]));
      }

      properties.forEach((property) => {
        const coord = coords.get(property.location) || propertyCoords.get(property.location);
        if (!coord) return;

        if (markers.current.has(property.id)) {
          markers.current.get(property.id)?.remove();
        }

        const isSelected = selectedProperty?.id === property.id;
        const customIcon = L.divIcon({
          html: `
            <div class="relative">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-all duration-200 ${
                isSelected
                  ? 'bg-gradient-to-r from-orange-600 to-pink-600 ring-2 ring-orange-300 scale-125'
                  : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:scale-110'
              }" style="cursor: pointer;">
                $${property.price_per_night}
              </div>
            </div>
          `,
          className: 'custom-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        });

        const marker = L.marker([coord.lat, coord.lng], { icon: customIcon })
          .addTo(map.current!)
          .on('click', () => {
            onPropertySelect?.(property);
          });

        const popup = L.popup().setContent(`
          <div class="p-2">
            <p class="font-semibold text-gray-900">${property.title}</p>
            <p class="text-sm text-gray-600">${property.location}</p>
            <p class="text-sm font-medium text-orange-600 mt-1">$${property.price_per_night}/night</p>
            <div class="flex items-center mt-1">
              <span class="text-yellow-500 text-sm">★</span>
              <span class="text-sm text-gray-700 ml-1">${property.rating.toFixed(1)} (${property.review_count})</span>
            </div>
          </div>
        `);

        marker.bindPopup(popup);

        markers.current.set(property.id, marker);
      });

      if (selectedProperty && propertyCoords.has(selectedProperty.location)) {
        const coord = propertyCoords.get(selectedProperty.location);
        if (coord) {
          map.current?.setView([coord.lat, coord.lng], 15);
        }
      }
    };

    updateMarkers();
  }, [properties, propertyCoords, selectedProperty, loading, onPropertySelect]);

  return (
    <div
      ref={mapContainer}
      style={{
        height,
        borderRadius: '12px',
        overflow: 'hidden',
        zIndex: 0,
      }}
      className="w-full shadow-lg"
    />
  );
}