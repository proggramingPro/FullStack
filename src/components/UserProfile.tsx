import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, createProfile, getCurrentRentals, getBookingHistory } from '../lib/profileService';
import type { Profile, BookingWithProperty } from '../types/database';
import ProfileInfo from './profile/ProfileInfo';
import CurrentRentals from './profile/CurrentRentals';
import BookingHistory from './profile/BookingHistory';
import PropertyDetail from './PropertyDetail';
import ListedProperties from './profile/ListedProperties';
import { getMyHostApplication, getListedProperties } from '../lib/hostService';

interface UserProfileProps {
  onClose: () => void;
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentRentals, setCurrentRentals] = useState<BookingWithProperty[]>([]);
  const [bookingHistory, setBookingHistory] = useState<BookingWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithProperty | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'current' | 'history' | 'listed'>('info');
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let profileData = await getProfile(user.id);
      if (!profileData) {
        try {
          await createProfile(user.id, {
            full_name: (user.user_metadata?.full_name as string) || null,
            phone: (user.user_metadata?.phone as string) || null,
          });
          profileData = await getProfile(user.id);
        } catch (createError) {
          console.error('Failed to create profile on login', createError);
        }
      }

      const [rentalsData, historyData, hostApp, listedProps] = await Promise.all([
        getCurrentRentals(user.id),
        getBookingHistory(user.id),
        getMyHostApplication(user.id),
        getListedProperties(user.id),
      ]);

      setProfile(profileData);
      setCurrentRentals(rentalsData);
      setBookingHistory(historyData);
      if (hostApp?.status === 'approved' || listedProps.length > 0) {
        setIsHost(true);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProperty = (booking: BookingWithProperty) => {
    setSelectedBooking(booking);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 py-8">
          <div className="max-w-6xl mx-auto bg-gray-50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="border-b border-gray-200 bg-white">
              <div className="max-w-6xl mx-auto px-6">
                <nav className="flex space-x-8 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === 'info'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Profile Info
                  </button>
                  <button
                    onClick={() => setActiveTab('current')}
                    className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === 'current'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Current Rentals
                    {currentRentals.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">
                        {currentRentals.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === 'history'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Booking History
                  </button>
                  {isHost && (
                    <button
                      onClick={() => setActiveTab('listed')}
                      className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                        activeTab === 'listed'
                          ? 'border-orange-500 text-orange-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Manage Properties
                    </button>
                  )}
                </nav>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <div className="p-6 md:p-8 space-y-6">
                {activeTab === 'info' && (
                  <ProfileInfo
                    profile={profile}
                    email={user.email || ''}
                    userId={user.id}
                    onUpdate={setProfile}
                  />
                )}

                {activeTab === 'current' && (
                  <CurrentRentals
                    bookings={currentRentals}
                    onViewProperty={handleViewProperty}
                  />
                )}

                {activeTab === 'history' && (
                  <BookingHistory
                    bookings={bookingHistory}
                    onViewProperty={handleViewProperty}
                  />
                )}

                {activeTab === 'listed' && isHost && (
                  <ListedProperties />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedBooking && (
        <PropertyDetail
          property={selectedBooking.property}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </>
  );
}
