import { Prisma } from "@prisma/client";
import { requireActiveAdmin } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse, jsonNoStore } from "@/lib/server/api-response";
import { categoryUpdateSchema } from "@/lib/validations/catalog";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    await requireActiveAdmin(request);
    const { id } = await context.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return jsonNoStore(
        { ok: false, error: { code: "NOT_FOUND", message: "دسته‌بندی پیدا نشد." } },
        { status: 404 },
      );
    }

    return jsonNoStore({ ok: true, category });
  } catch (error) {
    return apiErrorResponse(error, {
      code: "ADMIN_CATEGORY_GET_FAILED",
      publicMessage: "دریافت دسته‌بندی با خطا روبه‌رو شد.",
    });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireActiveAdmin(request);
    const { id } = await context.params;
    const body = categoryUpdateSchema.parse(await request.json());
    const category = await prisma.category.update({ where: { id }, data: body });
    return jsonNoStore({ ok: true, category });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonNoStore(
        { ok: false, error: { code: "NOT_FOUND", message: "دسته‌بندی پیدا نشد." } },
        { status: 404 },
      );
    }

    return apiErrorResponse(error, {
      code: "ADMIN_CATEGORY_UPDATE_FAILED",
      publicMessage: "ویرایش دسته‌بندی با خطا روبه‌رو شد.",
    });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await requireActiveAdmin(request);
    const { id } = await context.params;
    const category = await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
    return jsonNoStore({ ok: true, category });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonNoStore(
        { ok: false, error: { code: "NOT_FOUND", message: "دسته‌بندی پیدا نشد." } },
        { status: 404 },
      );
    }

    return apiErrorResponse(error, {
      code: "ADMIN_CATEGORY_DELETE_FAILED",
      publicMessage: "غیرفعال‌سازی دسته‌بندی با خطا روبه‌رو شد.",
    });
  }
}
