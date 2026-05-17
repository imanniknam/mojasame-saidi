import { ZodError } from "zod";
import { ensureAuthSchemaReady, mapPrismaAuthError } from "@/lib/auth/db";
import { formatUserDisplayName } from "@/lib/auth/display-name";
import { findUserByIdentifier } from "@/lib/auth/find-user";
import { verifyPassword } from "@/lib/auth/password";
import { getAuthRuntimeError } from "@/lib/auth/runtime";
import { setSessionCookie, type SessionRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse, jsonNoStore } from "@/lib/server/api-response";
import { loginSchema, safeNextPath } from "@/lib/validations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    return await handleLogin(request);
  } catch (error) {
    return jsonNoStore(
      {
        ok: false,
        error: {
          code: "LOGIN_FATAL",
          message:
            "خطای غیرمنتظره در ورود. PostgreSQL را بررسی کنید و npm run db:setup را در پوشه mojasame-saidi اجرا کنید.",
        },
      },
      { status: 500 },
    );
  }
}

async function handleLogin(request: Request) {
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
    const body = loginSchema.parse(await request.json());
    const user = await findUserByIdentifier(body.identifier);

    if (!user?.isActive) {
      return jsonNoStore(
        {
          ok: false,
          error: { code: "INVALID_CREDENTIALS", message: "ایمیل/موبایل یا رمز عبور اشتباه است." },
        },
        { status: 401 },
      );
    }

    const passwordOk = await verifyPassword(body.password, user.passwordHash);
    if (!passwordOk) {
      return jsonNoStore(
        {
          ok: false,
          error: { code: "INVALID_CREDENTIALS", message: "ایمیل/موبایل یا رمز عبور اشتباه است." },
        },
        { status: 401 },
      );
    }

    let role: SessionRole;
    if (body.mode === "admin") {
      if (user.role !== "ADMIN" || !user.admin) {
        return jsonNoStore(
          {
            ok: false,
            error: { code: "FORBIDDEN", message: "دسترسی مدیریت برای این حساب فعال نیست." },
          },
          { status: 403 },
        );
      }
      role = "ADMIN";
    } else {
      if (!user.customer) {
        return jsonNoStore(
          {
            ok: false,
            error: { code: "FORBIDDEN", message: "این حساب برای ورود مشتری فعال نیست." },
          },
          { status: 403 },
        );
      }
      role = "CUSTOMER";
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    const redirectTo =
      body.mode === "admin"
        ? safeNextPath(body.next, "/admin")
        : safeNextPath(body.next, "/");

    const displayName = formatUserDisplayName({
      email: user.email,
      customer: user.customer,
      admin: user.admin,
    });

    const response = jsonNoStore({
      ok: true,
      redirectTo,
      user: { id: user.id, email: user.email, role, displayName },
    });

    await setSessionCookie(response, { id: user.id, email: user.email, role }, { remember: body.remember });
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonNoStore(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.issues[0]?.message ?? "اطلاعات ورود معتبر نیست.",
          },
        },
        { status: 422 },
      );
    }

    const mapped = mapPrismaAuthError(error);
    if (mapped) {
      return jsonNoStore(
        { ok: false, error: { code: mapped.code, message: mapped.message } },
        { status: mapped.status },
      );
    }

    return apiErrorResponse(error, {
      code: "LOGIN_FAILED",
      publicMessage: "ورود با خطا روبه‌رو شد. لطفاً دوباره تلاش کنید.",
    });
  }
}
