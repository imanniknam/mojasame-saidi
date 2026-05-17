import { Prisma } from "@prisma/client";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { getAuthRuntimeError } from "@/lib/auth/runtime";
import { setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse, jsonNoStore } from "@/lib/server/api-response";
import {
  normalizeEmail,
  normalizePhone,
  signupSchema,
  splitDisplayName,
} from "@/lib/validations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const body = signupSchema.parse(await request.json());
    const email = normalizeEmail(body.email);
    const phone = normalizePhone(body.phone);
    const passwordHash = await hashPassword(body.password);
    const name = splitDisplayName(body.name);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        isActive: true,
        customer: {
          create: name,
        },
      },
      include: { customer: true },
    });

    const response = jsonNoStore({
      ok: true,
      redirectTo: "/",
      user: {
        id: user.id,
        email: user.email,
        role: "CUSTOMER" as const,
        displayFa: user.customer?.displayFa ?? null,
      },
    });

    await setSessionCookie(response, {
      id: user.id,
      email: user.email,
      role: "CUSTOMER",
    });

    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonNoStore(
        {
          ok: false,
          error: {
            code: "DUPLICATE_ACCOUNT",
            message: "با این ایمیل یا شماره موبایل قبلاً حساب ساخته شده است.",
          },
        },
        { status: 409 },
      );
    }

    if (error instanceof z.ZodError) {
      return jsonNoStore(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "اطلاعات ثبت‌نام را کامل و صحیح وارد کنید.",
          },
        },
        { status: 422 },
      );
    }

    return apiErrorResponse(error, {
      code: "SIGNUP_FAILED",
      publicMessage: "ثبت‌نام با خطا روبه‌رو شد.",
    });
  }
}
