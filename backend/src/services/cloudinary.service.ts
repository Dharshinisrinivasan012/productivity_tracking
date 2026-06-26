import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

export const uploadImage = async (
  fileBuffer: Buffer,
  folder: string = 'ppms/avatars'
): Promise<string | null> => {
  if (!config.cloudinary.cloudName) {
    return `data:image/png;base64,${fileBuffer.toString('base64')}`;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url || null);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const deleteImage = async (publicId: string): Promise<void> => {
  if (!config.cloudinary.cloudName) return;
  await cloudinary.uploader.destroy(publicId);
};
