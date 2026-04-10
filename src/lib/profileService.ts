import { supabase } from './supabase';
import type { Profile, BookingWithProperty } from '../types/database';


export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}


export async function getProfilesByIds(
  userIds: string[]
): Promise<Record<string, Profile | null>> {
  if (userIds.length === 0) return {};

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);

  if (error) throw error;

  const map: Record<string, Profile | null> = {};
  for (const id of userIds) map[id] = null;
  for (const p of data || []) map[p.id] = p;

  return map;
}


export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}


export async function createProfile(userId: string, data: Partial<Profile>): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, ...data, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );

  if (error) throw error;
}


export async function getUserBookings(userId: string): Promise<BookingWithProperty[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as BookingWithProperty[];
}


export async function getCurrentRentals(userId: string): Promise<BookingWithProperty[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties(*)
    `)
    .eq('user_id', userId)
    .or('status.eq.confirmed,status.eq.pending')
    .gte('check_out', today)
    .order('check_in', { ascending: true });

  if (error) throw error;
  return (data || []) as unknown as BookingWithProperty[];
}


export async function getBookingHistory(userId: string): Promise<BookingWithProperty[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties(*)
    `)
    .eq('user_id', userId)
    .or(
      `status.eq.completed,status.eq.cancelled,and(or(status.eq.confirmed,status.eq.pending),check_out.lt.${today})`
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as BookingWithProperty[];
}

export async function getReviewedPropertyIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('property_id')
    .eq('user_id', userId);

  if (error) throw error;
  return data ? data.map(r => r.property_id) : [];
}

export async function submitReview(userId: string, propertyId: string, rating: number, comment: string): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .insert({
      user_id: userId,
      property_id: propertyId,
      rating,
      comment
    });

  if (error) throw error;
}