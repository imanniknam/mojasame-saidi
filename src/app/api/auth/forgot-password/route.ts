import { ZodError } from "zod";
import { ensureAuthSchemaReady } from "@/lib/auth/db";
import { requestPasswordReset } from "@/lib/auth/password-reset";
import { getAuthRuntimeError } from "@/lib/auth/runtime";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset";
import { jsonNoStore } from "@/lib/server/api-response";
import { logger } from "@/lib/server/logger";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GENERIC_OK_MESSAGE =
  "اگر ایمیل در سیستم ثبت شده باشد، لینک بازیابی رمز برای شما ارسال می‌شود.";

export async function POST(request: Request) {
  const runtimeError = getAuthRuntimeError();
  if (runtimeError) {
    return jsonNoStore(
      { ok: false, error: { code: runtimeError.code, message: runtimeError.message } },
      { status: runtimeError.status },
    );
  }

  const dbError = await ensureAuthSchemaReady();
  if (dbError) {
    return jsonNoStore(
      { ok: false, error: { code: dbError.code, message: dbError.message } },
      { status: dbError.status },
    );
  }

  try {
    const body = forgotPasswordSchema.parse(await request.json());
    const result = await requestPasswordReset(body.email);

    if (result.sent) {
      try {
        const mail = await sendPasswordResetEmail({
          to: result.email,
          token: result.token,
        });

        return jsonNoStore({
          ok: true,
          message: GENERIC_OK_MESSAGE,
          ...(process.env.NODE_ENV !== "production" && mail.mode === "log"
            ? { devResetUrl: mail.resetUrl }
            : {}),
        });
      } catch (error) {
        logger.error("forgot_password_email", {
          error: error instanceof Error ? error.message : String(error),
        });
        return jsonNoStore(
          {
            ok: false,
            error: {
              code: "EMAIL_SEND_FAILED",
              message: "ارسال ایمیل ممکن نشد. کمی بعد دوباره تلاش کنید.",
            },
          },
          { status: 503 },
        );
      }
    }

    if (result.reason === "rate_limited") {
      return jsonNoStore(
        {
          ok: false,
          error: {
            code: "RATE_LIMITED",
            message: "چند دقیقه قبل درخواست داده‌اید. کمی بعد دوباره تلاش کنید.",
          },
        },
        { status: 429 },
      );
    }

    return jsonNoStore({ ok: true, message: GENERIC_OK_MESSAGE });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonNoStore(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.errors[0]?.message ?? "ایمیل معتبر نیست.",
          },
        },
        { status: 422 },
      );
    }

    logger.error("forgot_password_failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return jsonNoStore(
      {
        ok: false,
        error: { code: "FORGOT_PASSWORD_FAILED", message: "خطای غیرمنتظره. دوباره تلاش کنید." },
      },
      { status: 500 },
    );
  }
}
