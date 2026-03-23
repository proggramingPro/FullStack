import { useState } from 'react';
import { Calendar, Users } from 'lucide-react';
import type { Property } from '../types/database';
import { supabase } from '../lib/supabase';

interface BookingCardProps {
  property: Property;
}

export default function BookingCard({ property }: BookingCardProps) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();
  const subtotal = nights * property.price_per_night;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  const handleBooking = async () => {
    setMessage('');
    setBooking(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMessage('Please sign in to make a booking');
        setBooking(false);
        return;
      }

      if (!checkIn || !checkOut) {
        setMessage('Please select check-in and check-out dates');
        setBooking(false);
        return;
      }

      if (nights <= 0) {
        setMessage('Check-out date must be after check-in date');
        setBooking(false);
        return;
      }

      const insertData = {
        property_id: property.id,
        user_id: user.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        total_price: total,
        status: 'confirmed',
        booking_reference: `REF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      };
      const { error } = await (supabase.from('bookings') as any).insert(insertData);

      if (error) throw error;

      setMessage('Booking confirmed! Check your profile for details.');
      setCheckIn('');
      setCheckOut('');
      setGuests(1);
    } catch (error: any) {
      setMessage(error.message || 'Failed to create booking');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="sticky top-24 bg-white border border-gray-300 rounded-2xl shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">
            ₹{property.price_per_night}
          </span>
          <span className="text-gray-600">/ night</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {Array.from({ length: property.max_guests }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Guest' : 'Guests'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {nights > 0 && (
        <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
          <div className="flex justify-between text-gray-700">
            <span>
              ${property.price_per_night} x {nights} nights
            </span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Service fee</span>
            <span>₹{serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleBooking}
        disabled={booking}
        className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {booking ? 'Processing...' : 'Reserve'}
      </button>

      {message && (
        <p
          className={`mt-4 text-sm text-center ${
            message.includes('success') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}

      <p className="text-xs text-gray-500 text-center mt-4">
        No payment required — booking is confirmed instantly
      </p>
    </div>
  );
}
