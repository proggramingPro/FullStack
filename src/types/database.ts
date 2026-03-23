export interface Database {
  public: {
    Tables: {
      properties: {
        Row: Property;
        Insert: Omit<Property, 'id' | 'created_at' | 'rating' | 'review_count'>;
        Update: Partial<Omit<Property, 'id' | 'created_at'>>;
      };
      host_applications: {
        Row: HostApplication;
        Insert: Omit<HostApplication, 'id' | 'created_at' | 'reviewed_at' | 'reviewed_by'>;
        Update: Partial<Omit<HostApplication, 'id' | 'created_at' | 'user_id'>>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, 'id' | 'created_at' | 'booking_reference'> & {
          booking_reference?: string;
        };
        Update: Partial<Omit<Booking, 'id' | 'created_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at'>;
        Update: Partial<Omit<Review, 'id' | 'created_at'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price_per_night: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  amenities: string[];
  image_urls: string[];
  owner_id: string | null;
  rating: number;
  review_count: number;
  created_at: string;
}

export type HostApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface HostApplication {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  message: string | null;
  status: HostApplicationStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface Booking {
  id: string;
  property_id: string;
  user_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  booking_reference: string;
  created_at: string;
}

export interface Review {
  id: string;
  property_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithProperty extends Booking {
  property: Property;
}
