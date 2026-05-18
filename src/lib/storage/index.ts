import {
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_BYTES,
  MAX_PRODUCT_IMAGES,
  getStorageDriverName,
  isCloudinaryConfigured,
} from "./config";

export type { UploadedAsset, StorageDriverName, ImageStorageDriver } from "./types";

export {
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_BYTES,
  MAX_PRODUCT_IMAGES,
  getStorageDriverName,
  isCloudinaryConfigured,
} from "./config";

export class ImageUploadError extends Error {
  constructor(
    message: string,
    readonly code:
      | "NO_FILES"
      | "TOO_MANY_FILES"
      | "UNSUPPORTED_IMAGE_TYPE"
      | "IMAGE_TOO_LARGE"
      | "CLOUDINARY_NOT_CONFIGURED"
      | "CLOUDINARY_UPLOAD_FAILED",
  ) {
    super(message);
    this.name = "ImageUploadError";
  }
}

export function shouldUnoptimizeImageUrl(url: string) {
  return url.startsWith("/uploads/") || url.startsWith("blob:");
}