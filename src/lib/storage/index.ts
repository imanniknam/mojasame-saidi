// Browser-safe storage exports only.
// Server upload logic lives in `@/lib/storage/server` so client components never
// pull Node built-ins like `node:crypto`, `node:fs/promises`, or `node:path`.
export type { UploadedAsset, StorageDriverName, ImageStorageDriver } from "./types";
export {
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_BYTES,
  MAX_PRODUCT_IMAGES,
  getStorageDriverName,
  isCloudinaryConfigured,
} from "./config";
export { shouldUnoptimizeImageUrl } from "./image-client";
