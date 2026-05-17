import { Prisma } from "@prisma/client";
import { requireActiveAdmin } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse, jsonNoStore } from "@/lib/server/api-response";
import { productUpdateSchema } from "@/lib/validations/catalog";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const productInclude = {
  category: true,
  inventory: true,
  images: { orderBy: [{ sortOrder: "asc" as const }] },
};

export async function GET(request: Request, context: RouteContext) {
  try {
    await requireActiveAdmin(request);
    const { id } = await context.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });

    if (!product) {
      return jsonNoStore(
        { ok: false, error: { code: "NOT_FOUND", message: "محصول پیدا نشد." } },
        { status: 404 },
      );
    }

    return jsonNoStore({ ok: true, product });
  } catch (error) {
    return apiErrorResponse(error, {
      code: "ADMIN_PRODUCT_GET_FAILED",
      publicMessage: "دریافت محصول با خطا روبه‌رو شد.",
    });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireActiveAdmin(request);
    const { id } = await context.params;
    const body = productUpdateSchema.parse(await request.json());

    const product = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...(body.slug !== undefined ? { slug: body.slug } : {}),
          ...(body.sku !== undefined ? { sku: body.sku || null } : {}),
          ...(body.titleFa !== undefined ? { titleFa: body.titleFa } : {}),
          ...(body.descriptionFa !== undefined ? { descriptionFa: body.descriptionFa } : {}),
          ...(body.priceMinor !== undefined ? { priceMinor: body.priceMinor } : {}),
          ...(body.compareAtMinor !== undefined
            ? { compareAtMinor: body.compareAtMinor ?? null }
            : {}),
          ...(body.weightGrams !== undefined ? { weightGrams: body.weightGrams ?? null } : {}),
          ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
          ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
          ...(body.isNew !== undefined ? { isNew: body.isNew } : {}),
          ...(body.isBestSeller !== undefined ? { isBestSeller: body.isBestSeller } : {}),
          ...(body.metaTitleFa !== undefined ? { metaTitleFa: body.metaTitleFa ?? null } : {}),
          ...(body.metaDescFa !== undefined ? { metaDescFa: body.metaDescFa ?? null } : {}),
          ...(body.categoryId !== undefined ? { categoryId: body.categoryId } : {}),
        },
      });

      if (body.inventory) {
        await tx.inventory.upsert({
          where: { productId: id },
          create: { productId: id, ...body.inventory },
          update: body.inventory,
        });
      }

      if (body.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (body.images.length > 0) {
          await tx.productImage.createMany({
            data: body.images.map((image, index) => ({
              productId: id,
              url: image.url,
              altFa: image.altFa,
              sortOrder: image.sortOrder ?? index,
              isPrimary: image.isPrimary || index === 0,
            })),
          });
        }
      }

      return tx.product.findUniqueOrThrow({
        where: { id },
        include: productInclude,
      });
    });

    return jsonNoStore({ ok: true, product });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonNoStore(
        { ok: false, error: { code: "NOT_FOUND", message: "محصول پیدا نشد." } },
        { status: 404 },
      );
    }

    return apiErrorResponse(error, {
      code: "ADMIN_PRODUCT_UPDATE_FAILED",
      publicMessage: "ویرایش محصول با خطا روبه‌رو شد.",
    });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await requireActiveAdmin(request);
    const { id } = await context.params;
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: productInclude,
    });
    return jsonNoStore({ ok: true, product });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonNoStore(
        { ok: false, error: { code: "NOT_FOUND", message: "محصول پیدا نشد." } },
        { status: 404 },
      );
    }

    return apiErrorResponse(error, {
      code: "ADMIN_PRODUCT_DELETE_FAILED",
      publicMessage: "غیرفعال‌سازی محصول با خطا روبه‌رو شد.",
    });
  }
}
