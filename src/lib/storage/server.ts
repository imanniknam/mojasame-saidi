"use server";

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
import { ImageUploadError } from "./index";

let driverCache: ImageStorageDriver | null = null;

export function getImageStorageDriver(): ImageStorageDriver {
  if (driverCache) return driverCache;

  const name = getStorageDriverName();

  if (name === "cloudinary") {
    if (!isCloudinaryConfigured()) {
      throw new ImageUploadError(
        "Cloudinary config missing",
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
    throw new ImageUploadError(
      "Unsupported image type",
      "UNSUPPORTED_IMAGE_TYPE",
    );
  }

  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new ImageUploadError(
      "Image too large",
      "IMAGE_TOO_LARGE",
    );
  }
}

export async function uploadProductImageFiles(
  files: File[],
): Promise<UploadedAsset[]> {
  if (files.length === 0) {
    throw new ImageUploadError("No files", "NO_FILES");
  }

  if (files.length > MAX_PRODUCT_IMAGES) {
    throw new ImageUploadError(
      "Too many files",
      "TOO_MANY_FILES",
    );
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