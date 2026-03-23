import { supabase } from './supabase';
import type { HostApplication, HostApplicationStatus, Property } from '../types/database';


export async function getMyHostApplication(userId: string): Promise<HostApplication | null> {
  const { data, error } = await supabase
    .from('host_applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .maybeSingle();

  if (error) throw error;
  return data;
}


export async function applyToBecomeHost(params: {
  userId: string;
  fullName: string;
  phone: string;
  message?: string;
}): Promise<void> {
  const { error } = await supabase.from('host_applications').upsert(
    {
      user_id: params.userId,
      full_name: params.fullName,
      phone: params.phone,
      message: params.message ?? null,
      status: 'pending' as HostApplicationStatus,
    },
    { onConflict: 'user_id' }
  );

  if (error) throw error;
}


export async function createRentalHouse(params: {
  ownerId: string;
  title: string;
  description: string;
  pricePerNight: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  imageUrls: string[];
}): Promise<Property> {
  const { data, error } = await supabase
    .from('properties')
    .insert({
      title: params.title,
      description: params.description,
      price_per_night: params.pricePerNight,
      location: params.location,
      bedrooms: params.bedrooms,
      bathrooms: params.bathrooms,
      max_guests: params.maxGuests,
      amenities: params.amenities,
      image_urls: params.imageUrls,
      owner_id: params.ownerId,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Property;
}


export async function getHostApplicationsForAdmin(): Promise<HostApplication[]> {
  const { data, error } = await supabase
    .from('host_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}


export async function updateHostApplicationStatus(params: {
  id: string;
  status: HostApplicationStatus;
  reviewedBy: string;
}): Promise<void> {
  const { error } = await supabase
    .from('host_applications')
    .update({
      status: params.status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: params.reviewedBy,
    })
    .eq('id', params.id);

  if (error) throw error;
}