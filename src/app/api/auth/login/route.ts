import { verifyPassword } from "@/lib/auth/password";
import { getAuthRuntimeError } from "@/lib/auth/runtime";
import { setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse, jsonNoStore } from "@/lib/server/api-response";
import {
  loginSchema,
  normalizeEmail,
  normalizeDigits,
  normalizePhone,
  safeNextPath,
} from "@/lib/validations/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function invalidCredentialsResponse() {
  return jsonNoStore(
    {
      ok: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "ایمیل/موبایل یا رمز عبور نادرست است.",
      },
    },
    { status: 401 },
  );
}

export async function POST(request: Request) {
  try {
    const runtimeError = getAuthRuntimeError();
    if (runtimeError) {
      return jsonNoStore(
        {
          ok: false,
          error: {
            code: runtimeError.code,
            message: runtimeError.message,
          },
        },
        { status: runtimeError.status },
      );
    }

    const body = loginSchema.parse(await request.json());
    const rawIdentifier = normalizeDigits(body.identifier.trim());
    const isPhone = /^09\d{9}$/.test(rawIdentifier);
    const identifier = isPhone ? normalizePhone(rawIdentifier) : normalizeEmail(rawIdentifier);

    const user = await prisma.user.findFirst({
      where: isPhone ? { phone: identifier } : { email: identifier },
      include: { admin: true, customer: true },
    });

    if (!user?.isActive || !(await verifyPassword(body.password, user.passwordHash))) {
      return invalidCredentialsResponse();
    }

    const role = body.mode === "admin" ? "ADMIN" : "CUSTOMER";
    if (role === "ADMIN" && !user.admin) {
      return invalidCredentialsResponse();
    }
    if (role === "CUSTOMER" && !user.customer) {
      return invalidCredentialsResponse();
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const redirectTo = safeNextPath(body.next, role === "ADMIN" ? "/admin" : "/");
    const response = jsonNoStore({
      ok: true,
      redirectTo,
      user: {
        id: user.id,
        email: user.email,
        role,
      },
    });

    await setSessionCookie(
      response,
      {
        id: user.id,
        email: user.email,
        role,
      },
      { remember: body.remember },
    );

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonNoStore(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "اطلاعات ورود را کامل و صحیح وارد کنید.",
          },
        },
        { status: 422 },
      );
    }

    return apiErrorResponse(error, {
      code: "LOGIN_FAILED",
      publicMessage: "ورود با خطا روبه‌رو شد.",
    });
  }
}
