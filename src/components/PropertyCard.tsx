import { Star, MapPin, Users } from 'lucide-react';
import type { Property } from '../types/database';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

export default function PropertyCard({ property, onClick }: PropertyCardProps) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.image_urls[0] || '/placeholder-house.jpg'}
          alt={property.title}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/6B7280/FFFFFF?text=No+Image';
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
