import { ZodError, z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse, jsonNoStore } from "@/lib/server/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contactSchema = z.object({
  nameFa: z
    .string({ required_error: "نام را وارد کنید." })
    .trim()
    .min(2, "نام باید حداقل ۲ حرف باشد.")
    .max(80, "نام بیش از حد طولانی است."),
  email: z
    .string({ required_error: "ایمیل را وارد کنید." })
    .trim()
    .email("ایمیل معتبر نیست."),
  phone: z
    .string()
    .trim()
    .max(20, "شماره تماس معتبر نیست.")
    .optional()
    .or(z.literal("")),
  subjectFa: z.string().trim().max(120).optional().or(z.literal("")),
  bodyFa: z
    .string({ required_error: "متن پیام را بنویسید." })
    .trim()
    .min(10, "متن پیام باید حداقل ۱۰ حرف باشد.")
    .max(4000, "متن پیام بیش از حد طولانی است."),
  /**
   * تله‌ی ربات — کاربر واقعی این فیلد را نمی‌بیند و پر نمی‌کند.
   * عمداً اینجا اعتبارسنجی نمی‌شود: اگر Zod ردش کند، ربات خطای ۴۲۲ می‌گیرد و
   * می‌فهمد تله وجود دارد. بررسی‌اش در handler انجام می‌شود تا پاسخ موفقِ جعلی بگیرد.
   */
  website: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = contactSchema.parse(await request.json());

    // ربات‌ها فیلد مخفی را پر می‌کنند. موفقیت جعلی برمی‌گردانیم تا متوجه نشوند.
    if (body.website) {
      return jsonNoStore({ ok: true, message: "پیام شما ثبت شد." });
    }

    await prisma.contactMessage.create({
      data: {
        nameFa: body.nameFa,
        email: body.email.toLowerCase(),
        phone: body.phone || null,
        subjectFa: body.subjectFa || null,
        bodyFa: body.bodyFa,
      },
    });

    return jsonNoStore({
      ok: true,
      message: "پیام شما ثبت شد. به‌زودی پاسخ می‌دهیم.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonNoStore(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.issues[0]?.message ?? "اطلاعات واردشده معتبر نیست.",
          },
        },
        { status: 422 },
      );
    }

    return apiErrorResponse(error, {
      code: "CONTACT_FAILED",
      publicMessage: "ارسال پیام با خطا روبه‌رو شد. لطفاً دوباره تلاش کنید.",
    });
  }
}
