import { useEffect, useMemo, useState } from 'react';
import { X, Loader2, Home, Send, PlusCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  applyToBecomeHost,
  createRentalHouse,
  getMyHostApplication,
} from '../lib/hostService';

interface HostModalProps {
  onClose: () => void;
}

export default function HostModal({ onClose }: HostModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [status, setStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerNight, setPricePerNight] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [bathrooms, setBathrooms] = useState<number>(1);
  const [maxGuests, setMaxGuests] = useState<number>(1);
  const [amenitiesText, setAmenitiesText] = useState('');
  const [imageUrlsText, setImageUrlsText] = useState('');

  const userMetaName = (user?.user_metadata?.full_name as string | undefined) || '';
  const userMetaPhone = (user?.user_metadata?.phone as string | undefined) || '';

  const amenities = useMemo(
    () =>
      amenitiesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [amenitiesText]
  );

  const imageUrls = useMemo(
    () =>
      imageUrlsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [imageUrlsText]
  );

  useEffect(() => {
    if (!user) return;
    setFullName(userMetaName);
    setPhone(userMetaPhone);
  }, [user, userMetaName, userMetaPhone]);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user?.id]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const app = await getMyHostApplication(user.id);
      if (!app) {
        setStatus('none');
      } else {
        setFullName(app.full_name || userMetaName);
        setPhone(app.phone || userMetaPhone);
        setMessage(app.message || '');
        setStatus(app.status);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load host application');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await applyToBecomeHost({
        userId: user.id,
        fullName,
        phone,
        message,
      });
      setSuccess('Application submitted. Please wait for admin approval.');
      setStatus('pending');
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateProperty = async () => {
    if (!user) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await createRentalHouse({
        ownerId: user.id,
        title,
        description,
        pricePerNight,
        location,
        bedrooms,
        bathrooms,
        maxGuests,
        amenities,
        imageUrls,
      });
      setSuccess('House listed successfully!');
      setTitle('');
      setDescription('');
      setPricePerNight(0);
      setLocation('');
      setBedrooms(1);
      setBathrooms(1);
      setMaxGuests(1);
      setAmenitiesText('');
      setImageUrlsText('');
    } catch (err: any) {
      setError(err.message || 'Failed to list house');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Home className="w-6 h-6" />
              Become a Host
            </h2>
            <p className="text-sm text-gray-500">
              Apply for permission, then add your rental houses
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {status !== 'approved' && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Host application status
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {status === 'none' && 'Not applied yet'}
                      {status === 'pending' && 'Pending admin review'}
                      {status === 'rejected' && 'Rejected — you can reapply'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {status === 'none' ? 'Not Applied' : status}
                  </span>
                </div>
              </div>
            )}

            {status !== 'approved' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message to admin (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Tell us what you want to rent out"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleApply}
                  disabled={submitting || !fullName.trim() || !phone.trim()}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Apply for Permission
                    </>
                  )}
                </button>
              </div>
            )}

            {status === 'approved' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-green-800">
                    Approved! You can now add rental houses.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Modern apartment near downtown"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Describe your house..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per night
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="City, Area"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max guests
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={maxGuests}
                      onChange={(e) => setMaxGuests(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities (comma separated)
                    </label>
                    <input
                      value={amenitiesText}
                      onChange={(e) => setAmenitiesText(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="WiFi, Parking, Kitchen"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URLs (comma separated)
                    </label>
                    <input
                      value={imageUrlsText}
                      onChange={(e) => setImageUrlsText(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="https://.../1.jpg, https://.../2.jpg"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Note: add at least 1 image URL.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateProperty}
                  disabled={
                    submitting ||
                    !title.trim() ||
                    !description.trim() ||
                    !location.trim() ||
                    pricePerNight <= 0 ||
                    imageUrls.length === 0
                  }
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      Add Rental House
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

