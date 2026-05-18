import { requireActiveAdmin } from "@/lib/auth/server";
import { apiErrorResponse, jsonNoStore } from "@/lib/server/api-response";
import {
  ImageUploadError,
  getStorageDriverName,
  uploadProductImageFiles,
} from "@/server/storage/upload-product-images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireActiveAdmin(request);
    const formData = await request.formData();
    const files = formData.getAll("files").filter((item): item is File => item instanceof File);
    const uploads = await uploadProductImageFiles(files);

    return jsonNoStore({
      ok: true,
      driver: getStorageDriverName(),
      uploads,
    });
  } catch (error) {
    if (error instanceof ImageUploadError) {
      const status =
        error.code === "NO_FILES"
          ? 400
          : error.code === "TOO_MANY_FILES"
            ? 400
            : error.code === "UNSUPPORTED_IMAGE_TYPE"
              ? 415
              : error.code === "IMAGE_TOO_LARGE"
                ? 413
                : error.code === "CLOUDINARY_NOT_CONFIGURED"
                  ? 503
                  : 502;
      return jsonNoStore(
        { ok: false, error: { code: error.code, message: error.message } },
        { status },
      );
    }

    return apiErrorResponse(error, {
      code: "ADMIN_UPLOAD_FAILED",
      publicMessage: "آپلود تصویر با خطا روبه‌رو شد.",
    });
  }
}
