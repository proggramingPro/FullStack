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
  const [location, setLocation] = useState('');
  const [pricePerNight, setPricePerNight] = useState<number | ''>('');
const [bedrooms, setBedrooms] = useState<number | ''>('');
const [bathrooms, setBathrooms] = useState<number | ''>('');
const [maxGuests, setMaxGuests] = useState<number | ''>('');
  const [amenitiesText, setAmenitiesText] = useState('');
  const [imageUrlsText, setImageUrlsText] = useState('');

  const userMetaName = (user?.user_metadata?.full_name as string | undefined) || '';
  const userMetaPhone = (user?.user_metadata?.phone as string | undefined) || '';

  const amenities = useMemo(
    () => amenitiesText.split(',').map(s => s.trim()).filter(Boolean),
    [amenitiesText]
  );

  const imageUrls = useMemo(
    () => imageUrlsText.split(',').map(s => s.trim()).filter(Boolean),
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
    try {
      const app = await getMyHostApplication(user.id);
      if (!app) setStatus('none');
      else {
        setFullName(app.full_name || userMetaName);
        setPhone(app.phone || userMetaPhone);
        setMessage(app.message || '');
        setStatus(app.status);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await applyToBecomeHost({ userId: user.id, fullName, phone, message });
      setSuccess('Application submitted');
      setStatus('pending');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateProperty = async () => {
    if (!user) return;
    setSubmitting(true);
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
      setSuccess('House listed');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

 return (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-3xl rounded-lg border border-gray-200 shadow-xl">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Home className="w-5 h-5 text-gray-600" />
            Host Management
          </h2>
          <p className="text-xs text-gray-500">Apply & manage your listings</p>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="p-6 space-y-6">

          {/* Alerts */}
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-md">
              {success}
            </div>
          )}

          {/* Status Card */}
          {status !== 'approved' && (
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Application Status
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {status === 'none' && 'Not applied yet'}
                  {status === 'pending' && 'Pending admin approval'}
                  {status === 'rejected' && 'Rejected — you can reapply'}
                </p>
              </div>

              <span
                className={`px-3 py-1 text-xs font-medium rounded-full
                  ${status === 'pending' && 'bg-yellow-100 text-yellow-700'}
                  ${status === 'rejected' && 'bg-red-100 text-red-700'}
                  ${status === 'none' && 'bg-gray-200 text-gray-700'}
                `}
              >
                {status === 'none' ? 'Not Applied' : status}
              </span>
            </div>
          )}

          {/* Apply Form */}
          {status !== 'approved' && (
            <div className="border border-gray-200 rounded-md p-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Host Application
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-800"
                />

                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-800"
                />
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Message (optional)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-800"
              />

              <button
                onClick={handleApply}
                disabled={submitting || !fullName.trim() || !phone.trim()}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium py-2 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
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

          {/* Approved Section */}
          {status === 'approved' && (
            <div className="border border-gray-200 rounded-md p-4 space-y-4">
              <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-md text-sm text-green-700">
                Approved — you can now add properties
              </div>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Property Title"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Description"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

  <input
    type="number"
    value={pricePerNight}
    onChange={(e) =>
      setPricePerNight(e.target.value === '' ? '' : Number(e.target.value))
    }
    placeholder="Price"
    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm 
    focus:outline-none focus:ring-1 focus:ring-gray-800
    placeholder:text-gray-400"
  />

  <input
    type="number"
    value={bedrooms}
    onChange={(e) =>
      setBedrooms(e.target.value === '' ? '' : Number(e.target.value))
    }
    placeholder="Bedrooms"
    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm 
    focus:outline-none focus:ring-1 focus:ring-gray-800
    placeholder:text-gray-400"
  />

  <input
    type="number"
    value={bathrooms}
    onChange={(e) =>
      setBathrooms(e.target.value === '' ? '' : Number(e.target.value))
    }
    placeholder="Bathrooms"
    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm 
    focus:outline-none focus:ring-1 focus:ring-gray-800
    placeholder:text-gray-400"
  />

  <input
    type="number"
    value={maxGuests}
    onChange={(e) =>
      setMaxGuests(e.target.value === '' ? '' : Number(e.target.value))
    }
    placeholder="Guests"
    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm 
    focus:outline-none focus:ring-1 focus:ring-gray-800
    placeholder:text-gray-400"
  />

</div>

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
              />

              <input
                value={amenitiesText}
                onChange={(e) => setAmenitiesText(e.target.value)}
                placeholder="Amenities (comma separated)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />

              <input
                value={imageUrlsText}
                onChange={(e) => setImageUrlsText(e.target.value)}
                placeholder="Image URLs"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />

              <button
                onClick={handleCreateProperty}
                disabled={
                  submitting ||
                  !title.trim() ||
                  !description.trim() ||
                  !location.trim() ||
                  pricePerNight <= 0 ||
                  imageUrls.length === 0
                }
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium py-2 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
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
