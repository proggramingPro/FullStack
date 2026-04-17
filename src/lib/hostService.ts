import { supabase } from './supabase';
import type { HostApplication, HostApplicationStatus, Property } from '../types/database';
import { uploadPropertyImages } from './uploadService';
import { geocodeLocation } from './geocoding';


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

export async function getListedProperties(ownerId: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateListedProperty(
  propertyId: string,
  ownerId: string,
  updates: Partial<Property>
): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', propertyId)
    .eq('owner_id', ownerId); // Double check owner

  if (error) throw error;
}

export async function deleteListedProperty(propertyId: string, ownerId: string): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId)
    .eq('owner_id', ownerId); // Double check owner

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
  files?: File[];
}): Promise<Property> {
  let insertData = {
      title: params.title,
      description: params.description,
      price_per_night: params.pricePerNight,
      location: params.location,
      bedrooms: params.bedrooms,
      bathrooms: params.bathrooms,
      max_guests: params.maxGuests,
      amenities: params.amenities,
      image_urls: [],
      owner_id: params.ownerId,
    };

    try {
      const coords = await geocodeLocation(params.location);
      insertData = { ...insertData, lat: coords.lat, lng: coords.lng };
      console.info(`Geocoded property location: ${params.location} -> (${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)})`);
    } catch (error) {
      console.warn(`Could not geocode "${params.location}":`, error);
      // Insert without coords, update later if needed
    }

  const { data, error } = await supabase
    .from('properties')
    .insert(insertData)
    .select('*')
    .single();


  if (error) throw error;

  if (data && params.files && params.files.length > 0) {
    await uploadPropertyImages(data.id!, params.files, params.ownerId);
  }

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