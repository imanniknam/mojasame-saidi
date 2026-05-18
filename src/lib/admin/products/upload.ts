/**
 * @deprecated Import from `@/lib/storage/server` instead.
 * Re-exported for backward compatibility with existing imports.
 */
export {
  uploadProductImageFiles as saveProductImageFiles,
  MAX_IMAGE_BYTES,
  MAX_PRODUCT_IMAGES as MAX_IMAGES,
  ALLOWED_IMAGE_MIME as ALLOWED_IMAGE_TYPES,
  type UploadedAsset as SavedUpload,
} from "@/lib/storage/server";
