import { useState, useEffect } from 'react';
import { Home, MapPin, Edit, Trash2, Eye } from 'lucide-react';
import type { Property } from '../../types/database';
import { getListedProperties, deleteListedProperty } from '../../lib/hostService';
import { useAuth } from '../../contexts/AuthContext';
import EditPropertyModal from './EditPropertyModal';

export default function ListedProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const data = await getListedProperties(user!.id);
      setProperties(data);
    } catch (error) {
      console.error('Failed to load properties', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteListedProperty(propertyId, user!.id);
      setProperties(properties.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Failed to delete property', error);
      alert('Failed to delete property. It might have active bookings.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading your properties...</div>;
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Listed Properties</h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg">No listed properties</p>
          <p className="text-gray-500 mt-2">You haven't enlisted any properties for rent yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Listed Properties</h2>
      
      <div className="space-y-4">
        {properties.map((property) => (
          <div
            key={property.id}
            className="border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <img
                src={property.image_urls?.[0] || '/placeholder-house.jpg'}
                alt={property.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const fallback = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23e2e8f0%22%2F%3E%3Cpath%20d%3D%22M200%20100%20L100%20180%20H130%20V240%20H270%20V180%20H300%20Z%22%20fill%3D%22%2394a3b8%22%2F%3E%3C%2Fsvg%3E';
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
                className="w-full md:w-48 h-36 object-cover rounded-lg"
              />

              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{property.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-lg text-gray-900">₹{property.price_per_night}</span>
                    <span className="text-xs text-gray-500">per night</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">{property.bedrooms}</span> Beds
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">{property.bathrooms}</span> Baths
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">{property.max_guests}</span> Guests
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setEditingProperty(property)}
                    className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="flex items-center space-x-1 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          onClose={() => setEditingProperty(null)}
          onUpdated={() => {
            setEditingProperty(null);
            loadProperties();
          }}
        />
      )}
    </div>
  );
}
