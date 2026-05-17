import { MAX_PRODUCT_IMAGES } from "@/lib/storage";

export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/avif";

export type ProductImageFieldValue = {
  id: string;
  url: string;
  altFa: string;
  sortOrder: number;
  isPrimary: boolean;
  publicId?: string;
};

export type PendingImageItem = {
  id: string;
  previewUrl: string;
  status: "uploading" | "error";
  fileName: string;
  errorMessage?: string;
};

export function createImageId() {
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizeProductImages(images: ProductImageFieldValue[]): ProductImageFieldValue[] {
  return images.map((img, index) => ({
    ...img,
    sortOrder: index,
  }));
}

export function moveImageInList<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return list;
  }
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function remainingImageSlots(current: number, pending: number) {
  return Math.max(0, MAX_PRODUCT_IMAGES - current - pending);
}

export function filesWithinLimit(count: number, current: number, pending: number) {
  return count <= remainingImageSlots(current, pending);
}
