import "server-only";

import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { getCloudinaryConfig } from "../config";
import type { ImageStorageDriver, UploadImageInput, UploadedAsset } from "../types";

function signParams(params: Record<string, string>, apiSecret: string) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(sorted + apiSecret).digest("hex");
}

/** Node Buffer is a valid BlobPart and avoids strict Uint8Array/ArrayBuffer typing issues. */
function toBlobPart(bytes: Uint8Array): BlobPart {
  return Buffer.from(bytes);
}

export const cloudinaryImageStorage: ImageStorageDriver = {
  name: "cloudinary",

  async uploadProductImage(input: UploadImageInput): Promise<UploadedAsset> {
    const { cloudName, apiKey, apiSecret, folder } = getCloudinaryConfig();
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("CLOUDINARY_NOT_CONFIGURED");
    }

    const timestamp = String(Math.round(Date.now() / 1000));
    const paramsToSign: Record<string, string> = { folder, timestamp };
    const signature = signParams(paramsToSign, apiSecret);

    const body = new FormData();
    body.append(
      "file",
      new Blob([toBlobPart(input.buffer)], { type: input.mimeType }),
      input.originalName,
    );
    body.append("api_key", apiKey);
    body.append("timestamp", timestamp);
    body.append("folder", folder);
    body.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`CLOUDINARY_UPLOAD_FAILED:${detail.slice(0, 200)}`);
    }

    const data = (await response.json()) as {
      secure_url: string;
      public_id: string;
      width?: number;
      height?: number;
      bytes?: number;
    };

    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      originalName: input.originalName,
      size: data.bytes ?? input.buffer.byteLength,
      mimeType: input.mimeType,
      driver: "cloudinary",
    };
  },
};
