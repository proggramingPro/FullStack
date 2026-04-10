import { Star, MapPin, Users } from 'lucide-react';
import type { Property } from '../types/database';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

export default function PropertyCard({ property, onClick }: PropertyCardProps) {
  let images: string[] = [];
  try {
    if (Array.isArray(property?.image_urls)) {
      images = property.image_urls;
    } else if (typeof property?.image_urls === 'string') {
      images = JSON.parse(property.image_urls);
    }
  } catch (e) {
    images = [];
  }
  const FALLBACK_IMAGE = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23e2e8f0%22%2F%3E%3Cpath%20d%3D%22M200%20100%20L100%20180%20H130%20V240%20H270%20V180%20H300%20Z%22%20fill%3D%22%2394a3b8%22%2F%3E%3C%2Fsvg%3E';
  
  const coverImage = images.length > 0 ? images[0] : FALLBACK_IMAGE;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={coverImage}
          alt={property.title}
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== FALLBACK_IMAGE) {
              target.src = FALLBACK_IMAGE;
            }
          }}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 bg-gray-200"
        />
        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md flex items-center space-x-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold">{property.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1">
            {property.title}
          </h3>
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{property.max_guests} guests</span>
          </div>
          <span>{property.bedrooms} bed</span>
          <span>{property.bathrooms} bath</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ₹{property.price_per_night}
            </span>
            <span className="text-gray-600 text-sm ml-1">/ night</span>
          </div>
          <span className="text-xs text-gray-500">{property.review_count} reviews</span>
        </div>
      </div>
    </div>
  );
}
