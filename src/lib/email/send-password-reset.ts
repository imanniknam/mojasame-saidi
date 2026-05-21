import "server-only";

import { SITE_NAME_FA } from "@/lib/constants/site";
import { getSiteUrl } from "@/lib/seo/metadata";
import { logger } from "@/lib/server/logger";

type SendPasswordResetInput = {
  to: string;
  token: string;
};

export function buildPasswordResetUrl(token: string) {
  const url = new URL("/login", getSiteUrl());
  url.searchParams.set("token", token);
  return url.toString();
}

export async function sendPasswordResetEmail({ to, token }: SendPasswordResetInput) {
  const resetUrl = buildPasswordResetUrl(token);
  const from = process.env.EMAIL_FROM?.trim() || "noreply@mojasamesaidi.ir";
  const resendKey = process.env.RESEND_API_KEY?.trim();

  const subject = `بازیابی رمز عبور — ${SITE_NAME_FA}`;
  const text = [
    `سلام،`,
    ``,
    `درخواست بازیابی رمز عبور برای حساب شما در ${SITE_NAME_FA} ثبت شد.`,
    `برای انتخاب رمز جدید این لینک را باز کنید (اعتبار محدود):`,
    resetUrl,
    ``,
    `اگر این درخواست را شما نداده‌اید، این ایمیل را نادیده بگیرید.`,
  ].join("\n");

  if (resendKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      logger.error("password_reset_email_failed", {
        status: response.status,
        detail: detail.slice(0, 300),
      });
      throw new Error("EMAIL_SEND_FAILED");
    }

    return { delivered: true as const, mode: "resend" as const };
  }

  logger.info("password_reset_email_log", {
    to,
    resetUrl,
    hint: "Set RESEND_API_KEY in production to send real emails.",
  });

  return { delivered: false as const, mode: "log" as const, resetUrl };
}
