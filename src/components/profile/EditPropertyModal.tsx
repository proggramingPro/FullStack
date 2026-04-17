import { useState } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import type { Property } from '../../types/database';
import { updateListedProperty } from '../../lib/hostService';
import { useAuth } from '../../contexts/AuthContext';

interface EditPropertyModalProps {
  property: Property;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditPropertyModal({ property, onClose, onUpdated }: EditPropertyModalProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState(property.title);
  const [description, setDescription] = useState(property.description);
  const [location, setLocation] = useState(property.location);
  const [pricePerNight, setPricePerNight] = useState<number>(property.price_per_night);
  const [bedrooms, setBedrooms] = useState<number>(property.bedrooms);
  const [bathrooms, setBathrooms] = useState<number>(property.bathrooms);
  const [maxGuests, setMaxGuests] = useState<number>(property.max_guests);
  const [amenitiesText, setAmenitiesText] = useState((property.amenities || []).join(', '));

  const handleUpdate = async () => {
    if (!user) return;
    setSubmitting(true);
    setError('');
    
    try {
      const amenities = amenitiesText.split(',').map(s => s.trim()).filter(Boolean);
      
      await updateListedProperty(property.id, user.id, {
        title,
        description,
        location,
        price_per_night: pricePerNight,
        bedrooms,
        bathrooms,
        max_guests: maxGuests,
        amenities,
      });
      
      onUpdated();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update property');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-lg border border-gray-200 shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-800">Edit Property</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100 transition">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Property Title"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Description"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                min="0"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(Number(e.target.value))}
                placeholder="Price"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <input
                type="number"
                min="1"
                value={bedrooms}
                onChange={(e) => setBedrooms(Math.max(1, Number(e.target.value)))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <input
                type="number"
                min="1"
                value={bathrooms}
                onChange={(e) => setBathrooms(Math.max(1, Number(e.target.value)))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
              <input
                type="number"
                min="1"
                value={maxGuests}
                onChange={(e) => setMaxGuests(Math.max(1, Number(e.target.value)))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
            <input
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              placeholder="Amenities (comma separated)"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
            />
          </div>

        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={submitting || !title.trim() || !description.trim() || pricePerNight <= 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
