import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Eye, Star } from 'lucide-react';
import type { BookingWithProperty } from '../../types/database';
import { generateReceipt } from '../../lib/receiptGenerator';
import { useAuth } from '../../contexts/AuthContext';
import { getReviewedPropertyIds } from '../../lib/profileService';
import ReviewModal from './ReviewModal';

interface BookingHistoryProps {
  bookings: BookingWithProperty[];
  onViewProperty: (booking: BookingWithProperty) => void;
}

export default function BookingHistory({ bookings, onViewProperty }: BookingHistoryProps) {
  const { user } = useAuth();
  const [reviewedPropIds, setReviewedPropIds] = useState<string[]>([]);
  const [reviewingBooking, setReviewingBooking] = useState<BookingWithProperty | null>(null);

  useEffect(() => {
    if (user) {
      getReviewedPropertyIds(user.id).then(setReviewedPropIds).catch(console.error);
    }
  }, [user]);

  const handleReviewSubmitted = (propertyId: string) => {
    setReviewedPropIds((prev) => [...prev, propertyId]);
    setReviewingBooking(null);
  };

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking History</h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg">No booking history</p>
          <p className="text-gray-500 mt-2">Your past bookings will appear here</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      completed: { bg: 'bg-green-100', text: 'text-green-700' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
      confirmed: { bg: 'bg-gray-100', text: 'text-gray-700' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 relative">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking History</h2>
      
      <div className="space-y-4">
        {bookings.map((booking) => {
          const checkIn = new Date(booking.check_in);
          const checkOut = new Date(booking.check_out);
          const bookingDate = new Date(booking.created_at);
          const nights = Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Check if the stay is over
          const isStayOver = new Date() > checkOut || booking.status === 'completed';
          const hasReviewed = reviewedPropIds.includes(booking.property_id);

          return (
            <div
              key={booking.id}
              className="border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <img
                  src={booking.property.image_urls[0] || '/placeholder-house.jpg'}
                  alt={booking.property.title}
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
                        {booking.property.title}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{booking.property.location}</span>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span>
                        {checkIn.toLocaleDateString()} - {checkOut.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="mr-2 text-gray-500">🌙</span>
                      <span>{nights} {nights === 1 ? 'night' : 'nights'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Users className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="mr-2 text-gray-500">💰</span>
                      <span>
                        <strong>₹{booking.total_price.toFixed(2)}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span>Booked on {bookingDate.toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>Ref: {booking.booking_reference}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={() => onViewProperty(booking)}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => generateReceipt(booking)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                    >
                      <span>📄</span>
                      <span>Receipt</span>
                    </button>
                    
                    {/* Make sure booking wasn't cancelled */}
                    {isStayOver && booking.status !== 'cancelled' && (
                      hasReviewed ? (
                         <div className="flex items-center space-x-1 px-4 py-2 text-sm text-green-700 bg-green-50 rounded-lg">
                           <Star className="w-4 h-4 fill-green-600" />
                           <span>Reviewed</span>
                         </div>
                      ) : (
                        <button
                          onClick={() => setReviewingBooking(booking)}
                          className="flex items-center space-x-1 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors text-sm"
                        >
                          <Star className="w-4 h-4" />
                          <span>Rate Stay</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {reviewingBooking && user && (
        <ReviewModal
          booking={reviewingBooking}
          userId={user.id}
          onClose={() => setReviewingBooking(null)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}
