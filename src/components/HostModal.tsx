import { useEffect, useMemo, useState, useCallback } from 'react';
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
const [pricePerNight, setPricePerNight] = useState<number>(0);
const [bedrooms, setBedrooms] = useState<number>(1);
const [bathrooms, setBathrooms] = useState<number>(1);
  const [maxGuests, setMaxGuests] = useState<number | ''>('');
  const [amenitiesText, setAmenitiesText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  }, []);

  const removeImage = useCallback((index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  }, [selectedFiles, imagePreviews]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const userMetaName = (user?.user_metadata?.full_name as string | undefined) || '';
  const userMetaPhone = (user?.user_metadata?.phone as string | undefined) || '';

  const amenities = useMemo(
    () => amenitiesText.split(',').map(s => s.trim()).filter(Boolean),
    [amenitiesText]
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
        files: selectedFiles,
      });
      setSuccess('Property created with images uploaded successfully!');
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
  type="number"
  min="0"
  step="0.01"
  value={pricePerNight || ''}
  onChange={(e) => setPricePerNight(Number(e.target.value) || 0)}
  placeholder="0"
  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm 
  focus:outline-none focus:ring-1 focus:ring-gray-800
  placeholder:text-gray-400"
    placeholder="Price"
    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm 
    focus:outline-none focus:ring-1 focus:ring-gray-800
    placeholder:text-gray-400"
  />

  <input
    type="number"
  type="number"
  min="1"
  value={bedrooms}
  onChange={(e) => setBedrooms(Math.max(1, Number(e.target.value)))}
  placeholder="1"
  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm 
  focus:outline-none focus:ring-1 focus:ring-gray-800
  placeholder:text-gray-400"
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Images (multiple files)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-8 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-800 cursor-pointer"
                />
                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 p-2 border rounded-md">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleCreateProperty}
                disabled={
                  submitting ||
                  !title.trim() ||
                  !description.trim() ||
                  !location.trim() ||
                  (typeof pricePerNight === 'string' ? parseFloat(pricePerNight) <= 0 : pricePerNight <= 0) ||
                  selectedFiles.length === 0
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
