import { requireActiveAdmin } from "@/lib/auth/server";
import { apiErrorResponse, jsonNoStore } from "@/lib/server/api-response";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function safeFileName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase() ?? "webp";
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
}

export async function POST(request: Request) {
  try {
    await requireActiveAdmin(request);
    const formData = await request.formData();
    const files = formData.getAll("files").filter((item): item is File => item instanceof File);

    if (files.length === 0) {
      return jsonNoStore(
        {
          ok: false,
          error: { code: "NO_FILES", message: "هیچ فایلی ارسال نشده است." },
        },
        { status: 400 },
      );
    }

    if (files.length > 12) {
      return jsonNoStore(
        {
          ok: false,
          error: { code: "TOO_MANY_FILES", message: "حداکثر ۱۲ تصویر قابل آپلود است." },
        },
        { status: 400 },
      );
    }

    const uploads = files.map((file) => {
      if (!ALLOWED_TYPES.has(file.type)) {
        throw new Error("UNSUPPORTED_IMAGE_TYPE");
      }

      if (file.size > MAX_IMAGE_BYTES) {
        throw new Error("IMAGE_TOO_LARGE");
      }

      return {
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: `/uploads/products/${safeFileName(file.name)}`,
        pendingStorage: true,
      };
    });

    return jsonNoStore({
      ok: true,
      uploads,
      message: "اعتبارسنجی فایل انجام شد. اتصال ذخیره‌سازی دائمی در مرحله بعد فعال می‌شود.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNSUPPORTED_IMAGE_TYPE") {
      return jsonNoStore(
        {
          ok: false,
          error: { code: "UNSUPPORTED_IMAGE_TYPE", message: "فرمت تصویر پشتیبانی نمی‌شود." },
        },
        { status: 415 },
      );
    }

    if (error instanceof Error && error.message === "IMAGE_TOO_LARGE") {
      return jsonNoStore(
        {
          ok: false,
          error: { code: "IMAGE_TOO_LARGE", message: "حجم هر تصویر باید کمتر از ۵ مگابایت باشد." },
        },
        { status: 413 },
      );
    }

    return apiErrorResponse(error, {
      code: "ADMIN_UPLOAD_FAILED",
      publicMessage: "آپلود تصویر با خطا روبه‌رو شد.",
    });
  }
}
