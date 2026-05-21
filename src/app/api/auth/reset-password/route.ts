import { ZodError } from "zod";
import { ensureAuthSchemaReady } from "@/lib/auth/db";
import { resetPasswordWithToken, validatePasswordResetToken } from "@/lib/auth/password-reset";
import { getAuthRuntimeError } from "@/lib/auth/runtime";
import { jsonNoStore } from "@/lib/server/api-response";
import { logger } from "@/lib/server/logger";
import { resetPasswordSchema } from "@/lib/validations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
  if (!token) {
    return jsonNoStore(
      { ok: false, valid: false, error: { message: "لینک بازیابی نامعتبر است." } },
      { status: 400 },
    );
  }

  const result = await validatePasswordResetToken(token);
  return jsonNoStore({ ok: true, valid: result.valid });
}

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
    const body = resetPasswordSchema.parse(await request.json());
    const result = await resetPasswordWithToken(body.token, body.password);

    if (!result.ok) {
      return jsonNoStore(
        {
          ok: false,
          error: {
            code: result.code,
            message: "لینک بازیابی نامعتبر یا منقضی شده است. دوباره درخواست دهید.",
          },
        },
        { status: 400 },
      );
    }

    return jsonNoStore({
      ok: true,
      message: "رمز عبور با موفقیت تغییر کرد.",
      redirectTo: "/login",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonNoStore(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.errors[0]?.message ?? "اطلاعات واردشده معتبر نیست.",
          },
        },
        { status: 422 },
      );
    }

    logger.error("reset_password_failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return jsonNoStore(
      {
        ok: false,
        error: { code: "RESET_PASSWORD_FAILED", message: "خطای غیرمنتظره. دوباره تلاش کنید." },
      },
      { status: 500 },
    );
  }
}
