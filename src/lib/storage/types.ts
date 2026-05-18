export type StorageDriverName = "local" | "cloudinary";

export type UploadedAsset = {
  url: string;
  /** Cloudinary public_id — for delete/transform in production */
  publicId?: string;
  width?: number;
  height?: number;
  originalName: string;
  size: number;
  mimeType: string;
  driver: StorageDriverName;
};

export type UploadImageInput = {
  buffer: Uint8Array;
  mimeType: string;
  originalName: string;
};

export interface ImageStorageDriver {
  readonly name: StorageDriverName;
  uploadProductImage(input: UploadImageInput): Promise<UploadedAsset>;
}
