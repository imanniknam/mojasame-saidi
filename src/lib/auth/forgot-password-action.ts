"use server";

import {
  requestPasswordReset,
  resetPasswordWithToken,
  validatePasswordResetToken,
} from "@/lib/auth/password-reset";
import { ensureAuthSchemaReady } from "@/lib/auth/db";
import { getAuthRuntimeError } from "@/lib/auth/runtime";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth";

const GENERIC_OK_MESSAGE =
  "اگر ایمیل در سیستم ثبت شده باشد، لینک بازیابی رمز برای شما ارسال می‌شود.";

export async function requestForgotPasswordAction(rawEmail: string) {
  const runtimeError = getAuthRuntimeError();
  if (runtimeError) {
    return { ok: false as const, message: runtimeError.message };
  }

  const dbError = await ensureAuthSchemaReady();
  if (dbError) {
    return { ok: false as const, message: dbError.message };
  }

  const parsed = forgotPasswordSchema.safeParse({ email: rawEmail });
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.errors[0]?.message ?? "ایمیل معتبر نیست.",
    };
  }

  try {
    const result = await requestPasswordReset(parsed.data.email);

    if (result.sent) {
      try {
        const mail = await sendPasswordResetEmail({
          to: result.email,
          token: result.token,
        });

        return {
          ok: true as const,
          message: GENERIC_OK_MESSAGE,
          ...(process.env.NODE_ENV !== "production" && mail.mode === "log"
            ? { devResetUrl: mail.resetUrl }
            : {}),
        };
      } catch {
        return {
          ok: false as const,
          message: "ارسال ایمیل ممکن نشد. کمی بعد دوباره تلاش کنید.",
        };
      }
    }

    if (result.reason === "rate_limited") {
      return {
        ok: false as const,
        message: "چند دقیقه قبل درخواست داده‌اید. کمی بعد دوباره تلاش کنید.",
      };
    }

    return { ok: true as const, message: GENERIC_OK_MESSAGE };
  } catch {
    return { ok: false as const, message: "خطای غیرمنتظره. دوباره تلاش کنید." };
  }
}

export async function resetPasswordAction(input: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  const runtimeError = getAuthRuntimeError();
  if (runtimeError) {
    return { ok: false as const, message: runtimeError.message };
  }

  const dbError = await ensureAuthSchemaReady();
  if (dbError) {
    return { ok: false as const, message: dbError.message };
  }

  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.errors[0]?.message ?? "اطلاعات واردشده معتبر نیست.",
    };
  }

  try {
    const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
    if (!result.ok) {
      return {
        ok: false as const,
        message: "لینک بازیابی نامعتبر یا منقضی شده است. دوباره درخواست دهید.",
      };
    }

    return {
      ok: true as const,
      message: "رمز عبور با موفقیت تغییر کرد.",
      redirectTo: "/login",
    };
  } catch {
    return { ok: false as const, message: "خطای غیرمنتظره. دوباره تلاش کنید." };
  }
}

export async function validateResetTokenAction(token: string) {
  const dbError = await ensureAuthSchemaReady();
  if (dbError) {
    return { valid: false as const };
  }

  const result = await validatePasswordResetToken(token.trim());
  return { valid: result.valid };
}
