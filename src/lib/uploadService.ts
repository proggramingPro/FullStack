import { propertiesBucket } from './supabase';
import { supabase } from './supabase';

export async function uploadPropertyImages(
  propertyId: string,
  files: File[],
  ownerId: string
): Promise<string[]> {
  const publicUrls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileExt = file.name.split('.').pop();
    const fileName = `${ownerId}-${propertyId}-${Date.now()}-${i}.${fileExt}`;
    const filePath = `${ownerId}/${propertyId}/${fileName}`;

    const { data, error } = await propertiesBucket.upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) throw new Error(`Upload failed for ${file.name}: ${error.message}`);

    const { data: { publicUrl } } = propertiesBucket.getPublicUrl(filePath);
    publicUrls.push(publicUrl);
  }

  const { error: updateError } = await supabase
    .from('properties')
    .update({ 
      image_urls: publicUrls 
    } as any)
    .eq('id', propertyId);

  if (updateError) throw new Error(`Failed to update image_urls: ${updateError.message}`);

  return publicUrls;
}
