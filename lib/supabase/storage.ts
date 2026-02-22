// Supabase storage helpers for file uploads
import { supabaseAdmin } from './client';

const BUCKETS = {
  DECKS: 'decks',
  LOGOS: 'logos',
  SAMPLES: 'samples',
  THUMBNAILS: 'thumbnails',
} as const;

/**
 * Upload a file to Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @param file - File buffer or Blob
 * @param contentType - MIME type
 * @returns Public URL of uploaded file
 */
export async function uploadFile(
  bucket: keyof typeof BUCKETS,
  path: string,
  file: Buffer | Blob,
  contentType: string
): Promise<string> {
  const bucketName = BUCKETS[bucket];

  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  bucket: keyof typeof BUCKETS,
  path: string
): Promise<void> {
  const bucketName = BUCKETS[bucket];

  const { error } = await supabaseAdmin.storage
    .from(bucketName)
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Get signed URL for private files (temporary access)
 */
export async function getSignedUrl(
  bucket: keyof typeof BUCKETS,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const bucketName = BUCKETS[bucket];

  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Signed URL generation failed: ${error.message}`);
  }

  return data.signedUrl;
}
