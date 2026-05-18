import "server-only";

import {
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_BYTES,
  MAX_PRODUCT_IMAGES,
  getStorageDriverName,
  isCloudinaryConfigured,
} from "./config";
import { cloudinaryImageStorage } from "./drivers/cloudinary";
import { localImageStorage } from "./drivers/local";
import type { ImageStorageDriver, UploadedAsset } from "./types";

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

let driverCache: ImageStorageDriver | null = null;

export function getImageStorageDriver(): ImageStorageDriver {
  if (driverCache) return driverCache;

  const name = getStorageDriverName();
  if (name === "cloudinary") {
    if (!isCloudinaryConfigured()) {
      throw new ImageUploadError(
        "Cloudinary پیکربندی نشده است. CLOUDINARY_CLOUD_NAME، API_KEY و API_SECRET را تنظیم کنید.",
        "CLOUDINARY_NOT_CONFIGURED",
      );
    }
    driverCache = cloudinaryImageStorage;
  } else {
    driverCache = localImageStorage;
  }

  return driverCache;
}

function validateFile(file: File, buffer: Buffer) {
  if (!ALLOWED_IMAGE_MIME.has(file.type)) {
    throw new ImageUploadError("فرمت تصویر پشتیبانی نمی‌شود.", "UNSUPPORTED_IMAGE_TYPE");
  }
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new ImageUploadError("حجم هر تصویر باید کمتر از ۵ مگابایت باشد.", "IMAGE_TOO_LARGE");
  }
}

export async function uploadProductImageFiles(files: File[]): Promise<UploadedAsset[]> {
  if (files.length === 0) {
    throw new ImageUploadError("هیچ فایلی ارسال نشده است.", "NO_FILES");
  }
  if (files.length > MAX_PRODUCT_IMAGES) {
    throw new ImageUploadError("حداکثر ۱۲ تصویر قابل آپلود است.", "TOO_MANY_FILES");
  }

  const driver = getImageStorageDriver();
  const uploads: UploadedAsset[] = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    validateFile(file, buffer);
    const asset = await driver.uploadProductImage({
      buffer,
      mimeType: file.type,
      originalName: file.name,
    });
    uploads.push(asset);
  }

  return uploads;
}
