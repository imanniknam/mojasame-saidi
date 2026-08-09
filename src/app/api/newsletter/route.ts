import { ZodError, z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse, jsonNoStore } from "@/lib/server/api-response";
import { logger } from "@/lib/server/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const newsletterSchema = z.object({
  email: z
    .string({ required_error: "ایمیل را وارد کنید." })
    .trim()
    .min(1, "ایمیل را وارد کنید.")
    .email("ایمیل معتبر نیست."),
  /** منبع ثبت‌نام — footer | homepage | checkout */
  source: z.enum(["footer", "homepage", "checkout"]).optional().default("footer"),
});

export async function POST(request: Request) {
  try {
    const body = newsletterSchema.parse(await request.json());
    const email = body.email.toLowerCase();

    // ثبت مجدد یک ایمیل نباید خطا بدهد — فقط دوباره فعالش می‌کنیم.
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, source: body.source },
      update: { isActive: true, unsubscribedAt: null },
    });

    return jsonNoStore({
      ok: true,
      message: "ایمیل شما با موفقیت ثبت شد.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonNoStore(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.issues[0]?.message ?? "ایمیل معتبر نیست.",
          },
        },
        { status: 422 },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error("newsletter_prisma_error", { code: error.code });
    }

    return apiErrorResponse(error, {
      code: "NEWSLETTER_FAILED",
      publicMessage: "ثبت ایمیل با خطا روبه‌رو شد. لطفاً دوباره تلاش کنید.",
    });
  }
}
