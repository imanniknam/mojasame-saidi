import type { StorageDriverName } from "./types";

export const MAX_IMAGE_BYTES =
  (Number(process.env.UPLOAD_MAX_IMAGE_MB) || 5) * 1024 * 1024;
export const MAX_PRODUCT_IMAGES = 12;
export const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function getStorageDriverName(): StorageDriverName {
  const driver = process.env.UPLOAD_STORAGE_DRIVER?.toLowerCase();
  if (driver === "cloudinary") return "cloudinary";
  return "local";
}

export function getCloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
    folder: process.env.CLOUDINARY_FOLDER ?? "mojasame/products",
  };
}

export function isCloudinaryConfigured() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  return Boolean(cloudName && apiKey && apiSecret);
}
