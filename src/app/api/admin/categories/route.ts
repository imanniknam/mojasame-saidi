import { Prisma } from "@prisma/client";
import { requireActiveAdmin } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse, jsonNoStore } from "@/lib/server/api-response";
import {
  catalogListQuerySchema,
  categoryCreateSchema,
} from "@/lib/validations/catalog";

export async function GET(request: Request) {
  try {
    await requireActiveAdmin(request);
    const url = new URL(request.url);
    const query = catalogListQuerySchema.parse(Object.fromEntries(url.searchParams));
    const where: Prisma.CategoryWhereInput = {
      ...(query.includeInactive ? {} : { isActive: true }),
      ...(query.q
        ? {
            OR: [
              { nameFa: { contains: query.q, mode: "insensitive" } },
              { slug: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: { _count: { select: { products: true } } },
      }),
      prisma.category.count({ where }),
    ]);

    return jsonNoStore({ ok: true, items, total, page: query.page, limit: query.limit });
  } catch (error) {
    return apiErrorResponse(error, {
      code: "ADMIN_CATEGORY_LIST_FAILED",
      publicMessage: "دریافت دسته‌بندی‌ها با خطا روبه‌رو شد.",
    });
  }
}

export async function POST(request: Request) {
  try {
    await requireActiveAdmin(request);
    const body = categoryCreateSchema.parse(await request.json());
    const category = await prisma.category.create({ data: body });
    return jsonNoStore({ ok: true, category }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonNoStore(
        {
          ok: false,
          error: { code: "DUPLICATE_CATEGORY", message: "این اسلاگ قبلاً ثبت شده است." },
        },
        { status: 409 },
      );
    }

    return apiErrorResponse(error, {
      code: "ADMIN_CATEGORY_CREATE_FAILED",
      publicMessage: "ساخت دسته‌بندی با خطا روبه‌رو شد.",
    });
  }
}
