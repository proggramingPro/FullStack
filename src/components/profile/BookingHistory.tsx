import { Calendar, MapPin, Users, Eye } from 'lucide-react';
import type { BookingWithProperty } from '../../types/database';
import { generateReceipt } from '../../lib/receiptGenerator';

interface BookingHistoryProps {
  bookings: BookingWithProperty[];
  onViewProperty: (booking: BookingWithProperty) => void;
}

export default function BookingHistory({ bookings, onViewProperty }: BookingHistoryProps) {
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
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking History</h2>
      <div className="space-y-4">
        {bookings.map((booking) => {
          const checkIn = new Date(booking.check_in);
          const checkOut = new Date(booking.check_out);
          const bookingDate = new Date(booking.created_at);
          const nights = Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={booking.id}
              className="border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <img
                  src={booking.property.image_urls[0]}
                  alt={booking.property.title}
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

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => onViewProperty(booking)}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => generateReceipt(booking)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <span>📄</span>
                      <span>Download Receipt</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
