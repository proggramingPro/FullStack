import { supabase } from '../lib/supabase'; 
import { getProfilesByIds } from './profileService'; 
import type { BookingWithProperty, Profile } from '../types/database';

export interface AdminBooking extends BookingWithProperty {
  renter: Profile | null;
}

export interface RenterStats {
  renter: Profile | null;
  bookingCount: number;
  totalSpent: number;
  properties: string[];
}

export interface AdminOverview {
  totalBookings: number;
  totalRevenue: number;
  totalProperties: number;
  totalRenters: number;
}


export async function getAllBookings(): Promise<AdminBooking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const bookings = (data || []) as unknown as BookingWithProperty[];

  const userIds = [...new Set(bookings.map((b) => b.user_id))];
  const profilesMap = await getProfilesByIds(userIds);

  return bookings.map((b) => ({
    ...b,
    renter: profilesMap[b.user_id] ?? null,
  }));
}


export async function getAdminOverview(): Promise<AdminOverview> {
  const [bookingsRes, propertiesRes, rentersRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('total_price', { count: 'exact' }),

    supabase
      .from('properties')
      .select('id', { count: 'exact', head: true }),

    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true }),
  ]);

  if (bookingsRes.error) throw bookingsRes.error;
  if (propertiesRes.error) throw propertiesRes.error;
  if (rentersRes.error) throw rentersRes.error;

  const bookings = (bookingsRes.data || []) as { total_price: number }[];

  const totalBookings = bookingsRes.count || bookings.length;
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (b.total_price || 0),
    0
  );

  return {
    totalBookings,
    totalRevenue,
    totalProperties: propertiesRes.count || 0,
    totalRenters: rentersRes.count || 0,
  };
}


export async function getRenterStats(): Promise<RenterStats[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      user_id, 
      total_price,
      property:properties(title)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const statsMap = new Map<
    string,
    { bookingCount: number; totalSpent: number; properties: Set<string> }
  >();

  for (const row of data || []) {
    const { user_id, total_price, property } = row as any;
    const propertyTitle = property?.title || 'Unknown Property';

    const existing = statsMap.get(user_id);

    if (existing) {
      existing.bookingCount += 1;
      existing.totalSpent += total_price || 0;
      existing.properties.add(propertyTitle);
    } else {
      statsMap.set(user_id, {
        bookingCount: 1,
        totalSpent: total_price || 0,
        properties: new Set([propertyTitle]),
      });
    }
  }

  const userIds = [...statsMap.keys()];
  const profilesMap = await getProfilesByIds(userIds);

  return Array.from(statsMap.entries())
    .map(([user_id, stats]) => ({
      renter: profilesMap[user_id] ?? null,
      bookingCount: stats.bookingCount,
      totalSpent: stats.totalSpent,
      properties: Array.from(stats.properties),
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);
}