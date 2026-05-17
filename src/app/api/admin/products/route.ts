import { Prisma } from "@prisma/client";
import { requireActiveAdmin } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse, jsonNoStore } from "@/lib/server/api-response";
import { catalogListQuerySchema, productCreateSchema } from "@/lib/validations/catalog";

const productInclude = {
  category: true,
  inventory: true,
  images: { orderBy: [{ sortOrder: "asc" as const }] },
};

export async function GET(request: Request) {
  try {
    await requireActiveAdmin(request);
    const url = new URL(request.url);
    const query = catalogListQuerySchema.parse(Object.fromEntries(url.searchParams));
    const where: Prisma.ProductWhereInput = {
      ...(query.includeInactive ? {} : { isActive: true }),
      ...(query.q
        ? {
            OR: [
              { titleFa: { contains: query.q, mode: "insensitive" } },
              { slug: { contains: query.q, mode: "insensitive" } },
              { sku: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: productInclude,
      }),
      prisma.product.count({ where }),
    ]);

    return jsonNoStore({ ok: true, items, total, page: query.page, limit: query.limit });
  } catch (error) {
    return apiErrorResponse(error, {
      code: "ADMIN_PRODUCT_LIST_FAILED",
      publicMessage: "دریافت محصولات با خطا روبه‌رو شد.",
    });
  }
}

export async function POST(request: Request) {
  try {
    await requireActiveAdmin(request);
    const body = productCreateSchema.parse(await request.json());
    const product = await prisma.product.create({
      data: {
        slug: body.slug,
        sku: body.sku || null,
        titleFa: body.titleFa,
        descriptionFa: body.descriptionFa,
        priceMinor: body.priceMinor,
        compareAtMinor: body.compareAtMinor ?? null,
        weightGrams: body.weightGrams ?? null,
        isActive: body.isActive,
        isFeatured: body.isFeatured,
        isNew: body.isNew,
        isBestSeller: body.isBestSeller,
        metaTitleFa: body.metaTitleFa ?? null,
        metaDescFa: body.metaDescFa ?? null,
        categoryId: body.categoryId,
        inventory: { create: body.inventory },
        images: {
          create: body.images.map((image, index) => ({
            ...image,
            sortOrder: image.sortOrder ?? index,
            isPrimary: image.isPrimary || index === 0,
          })),
        },
      },
      include: productInclude,
    });

    return jsonNoStore({ ok: true, product }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonNoStore(
        {
          ok: false,
          error: { code: "DUPLICATE_PRODUCT", message: "اسلاگ یا SKU محصول تکراری است." },
        },
        { status: 409 },
      );
    }

    return apiErrorResponse(error, {
      code: "ADMIN_PRODUCT_CREATE_FAILED",
      publicMessage: "ساخت محصول با خطا روبه‌رو شد.",
    });
  }
}
