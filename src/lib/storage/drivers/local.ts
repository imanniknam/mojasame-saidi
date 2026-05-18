import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ImageStorageDriver, UploadImageInput, UploadedAsset } from "../types";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

function safeFileName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase() ?? "webp";
  const safeExt = ["jpeg", "jpg", "png", "webp", "avif"].includes(extension) ? extension : "webp";
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt === "jpg" ? "jpeg" : safeExt}`;
}

export const localImageStorage: ImageStorageDriver = {
  name: "local",

  async uploadProductImage(input: UploadImageInput): Promise<UploadedAsset> {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const fileName = safeFileName(input.originalName);
    await writeFile(path.join(UPLOAD_DIR, fileName), input.buffer);

    return {
      url: `/uploads/products/${fileName}`,
      originalName: input.originalName,
      size: input.buffer.byteLength,
      mimeType: input.mimeType,
      driver: "local",
    };
  },
};
