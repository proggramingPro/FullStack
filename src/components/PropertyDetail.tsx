import { X, Star, MapPin, Users, Bed, Bath, Wifi, ChevronLeft, ChevronRight, Map } from 'lucide-react';
import { useState } from 'react';
import type { Property } from '../types/database';
import BookingCard from './BookingCard';
import PropertyMap from './PropertyMap';

interface PropertyDetailProps {
  property: Property;
  onClose: () => void;
}

export default function PropertyDetail({ property, onClose }: PropertyDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === property.image_urls.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.image_urls.length - 1 : prev - 1
    );
  };

  const amenityIcons: Record<string, any> = {
    WiFi: Wifi,
    Wifi: Wifi,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 truncate pr-4">
              {property.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative aspect-[16/9] md:aspect-[21/9] bg-gray-900">
            <img
              src={property.image_urls[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            {property.image_urls.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {property.image_urls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-white w-8'
                          : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-lg">{property.rating.toFixed(1)}</span>
                      <span className="text-gray-600">({property.review_count} reviews)</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-1" />
                      <span>{property.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 py-4 border-y border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">{property.max_guests} guests</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bed className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">{property.bedrooms} bedrooms</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bath className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">{property.bathrooms} bathrooms</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">About this place</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity) => {
                      const Icon = amenityIcons[amenity] || Wifi;
                      return (
                        <div
                          key={amenity}
                          className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                        >
                          <Icon className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Location</h3>
                    <button
                      onClick={() => setShowMap(!showMap)}
                      className="flex items-center space-x-1 px-3 py-2 text-sm bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      <Map className="w-4 h-4" />
                      <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
                    </button>
                  </div>
                  {showMap && (
                    <PropertyMap properties={[property]} height="400px" />
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                <BookingCard property={property} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
