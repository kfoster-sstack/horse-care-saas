import { supabase, STORAGE_BUCKETS, getPublicUrl, getSignedUrl } from '../lib/supabase';
import type { ServiceResult } from './businessService';

export interface UploadOptions {
  contentType?: string;
  upsert?: boolean;
}

export interface FileInfo {
  path: string;
  url: string;
  size: number;
  contentType: string;
}

/**
 * Storage Service
 * Handles file uploads, downloads, and management
 */
export const storageService = {
  /**
   * Upload a file to a bucket
   */
  async upload(
    bucket: string,
    path: string,
    file: File | Blob,
    options?: UploadOptions
  ): Promise<ServiceResult<FileInfo>> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: options?.contentType || file.type,
        upsert: options?.upsert || false,
      });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    // Get the URL based on bucket type
    const isPublicBucket =
      bucket === STORAGE_BUCKETS.HORSE_PHOTOS ||
      bucket === STORAGE_BUCKETS.AVATARS;

    let url: string;
    if (isPublicBucket) {
      url = getPublicUrl(bucket, data.path);
    } else {
      url = (await getSignedUrl(bucket, data.path)) || '';
    }

    return {
      data: {
        path: data.path,
        url,
        size: file.size,
        contentType: file.type,
      },
      error: null,
    };
  },

  /**
   * Upload horse photo
   */
  async uploadHorsePhoto(
    businessId: string,
    horseId: string,
    file: File
  ): Promise<ServiceResult<FileInfo>> {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const path = `${businessId}/${horseId}/${fileName}`;

    return this.upload(STORAGE_BUCKETS.HORSE_PHOTOS, path, file);
  },

  /**
   * Upload user avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<ServiceResult<FileInfo>> {
    const fileName = `avatar_${Date.now()}.${file.name.split('.').pop()}`;
    const path = `${userId}/${fileName}`;

    return this.upload(STORAGE_BUCKETS.AVATARS, path, file, { upsert: true });
  },

  /**
   * Upload document
   */
  async uploadDocument(
    businessId: string,
    horseId: string | null,
    category: string,
    file: File
  ): Promise<ServiceResult<FileInfo>> {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const horsePath = horseId || 'general';
    const path = `${businessId}/${horsePath}/${category}/${fileName}`;

    return this.upload(STORAGE_BUCKETS.DOCUMENTS, path, file);
  },

  /**
   * Upload care log photo
   */
  async uploadCareLogPhoto(
    businessId: string,
    careLogId: string,
    file: File
  ): Promise<ServiceResult<FileInfo>> {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const path = `${businessId}/${careLogId}/${fileName}`;

    return this.upload(STORAGE_BUCKETS.CARE_LOG_PHOTOS, path, file);
  },

  /**
   * Get a signed URL for a private file
   */
  async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn?: number
  ): Promise<ServiceResult<string>> {
    const url = await getSignedUrl(bucket, path, expiresIn);

    if (!url) {
      return { data: null, error: new Error('Failed to create signed URL') };
    }

    return { data: url, error: null };
  },

  /**
   * Get public URL for a public file
   */
  getPublicUrl(bucket: string, path: string): string {
    return getPublicUrl(bucket, path);
  },

  /**
   * Delete a file
   */
  async delete(bucket: string, path: string): Promise<ServiceResult<null>> {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  },

  /**
   * Delete multiple files
   */
  async deleteMultiple(
    bucket: string,
    paths: string[]
  ): Promise<ServiceResult<null>> {
    const { error } = await supabase.storage.from(bucket).remove(paths);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  },

  /**
   * List files in a folder
   */
  async listFiles(
    bucket: string,
    folder: string
  ): Promise<ServiceResult<Array<{ name: string; size: number }>>> {
    const { data, error } = await supabase.storage.from(bucket).list(folder);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return {
      data:
        data?.map((file) => ({
          name: file.name,
          size: file.metadata?.size || 0,
        })) || [],
      error: null,
    };
  },

  /**
   * Download a file as blob
   */
  async download(bucket: string, path: string): Promise<ServiceResult<Blob>> {
    const { data, error } = await supabase.storage.from(bucket).download(path);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Move/rename a file
   */
  async move(
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<ServiceResult<null>> {
    const { error } = await supabase.storage.from(bucket).move(fromPath, toPath);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  },

  /**
   * Copy a file
   */
  async copy(
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<ServiceResult<null>> {
    const { error } = await supabase.storage.from(bucket).copy(fromPath, toPath);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  },
};

export default storageService;
