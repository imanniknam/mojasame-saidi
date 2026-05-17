import { ZodError } from "zod";
import { ensureAuthSchemaReady, mapPrismaAuthError } from "@/lib/auth/db";
import { formatUserDisplayName } from "@/lib/auth/display-name";
import { hashPassword } from "@/lib/auth/password";
import { getAuthRuntimeError } from "@/lib/auth/runtime";
import { setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse, jsonNoStore } from "@/lib/server/api-response";
import { logger } from "@/lib/server/logger";
import {
  normalizeEmail,
  normalizePhone,
  signupSchema,
  splitDisplayName,
} from "@/lib/validations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleSignup(request: Request) {
  const runtimeError = getAuthRuntimeError();
  if (runtimeError) {
    return jsonNoStore(
      { ok: false, error: { code: runtimeError.code, message: runtimeError.message } },
      { status: runtimeError.status },
    );
  }

  const schemaError = await ensureAuthSchemaReady();
  if (schemaError) {
    logger.error("signup_schema_unavailable", { cause: schemaError.cause });
    return jsonNoStore(
      { ok: false, error: { code: schemaError.code, message: schemaError.message } },
      { status: schemaError.status },
    );
  }

  try {
    const body = signupSchema.parse(await request.json());
    const email = normalizeEmail(body.email);
    const phone = normalizePhone(body.phone);
    const { firstName, lastName, displayFa } = splitDisplayName(body.name);
    const passwordHash = await hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        role: "CUSTOMER",
        isActive: true,
        customer: {
          create: {
            firstName,
            lastName,
            displayFa,
          },
        },
      },
      include: { customer: true },
    });

    const displayName = formatUserDisplayName({
      email: user.email,
      customer: user.customer,
    });

    const response = jsonNoStore({
      ok: true,
      redirectTo: "/",
      user: {
        id: user.id,
        email: user.email,
        role: "CUSTOMER" as const,
        displayName,
      },
    });

    try {
      await setSessionCookie(response, {
        id: user.id,
        email: user.email,
        role: "CUSTOMER",
      });
    } catch (cookieError) {
      logger.error("signup_session_cookie_failed", {
        error: cookieError instanceof Error ? cookieError.message : String(cookieError),
      });
      return jsonNoStore(
        {
          ok: false,
          error: {
            code: "SESSION_FAILED",
            message: "حساب ساخته شد اما ورود خودکار ناموفق بود. لطفاً از صفحه ورود وارد شوید.",
          },
        },
        { status: 500 },
      );
    }

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonNoStore(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.issues[0]?.message ?? "اطلاعات ثبت‌نام معتبر نیست.",
          },
        },
        { status: 422 },
      );
    }

    const mapped = mapPrismaAuthError(error);
    if (mapped) {
      logger.error("signup_prisma_error", { code: mapped.code, error: String(error) });
      return jsonNoStore(
        { ok: false, error: { code: mapped.code, message: mapped.message } },
        { status: mapped.status },
      );
    }

    logger.error("signup_failed", { error: error instanceof Error ? error.message : String(error) });
    return apiErrorResponse(error, {
      code: "SIGNUP_FAILED",
      publicMessage: "ثبت‌نام با خطا روبه‌رو شد. لطفاً دوباره تلاش کنید.",
    });
  }
}

export async function POST(request: Request) {
  try {
    return await handleSignup(request);
  } catch (error) {
    logger.error("signup_fatal", { error: error instanceof Error ? error.message : String(error) });
    return jsonNoStore(
      {
        ok: false,
        error: {
          code: "SIGNUP_FATAL",
          message:
            "خطای غیرمنتظره در ثبت‌نام. PostgreSQL و migrate را بررسی کنید؛ سپس npm run db:setup را در پوشه mojasame-saidi اجرا کنید.",
        },
      },
      { status: 500 },
    );
  }
}
