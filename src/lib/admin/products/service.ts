import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProductCreateInput, ProductUpdateInput } from "@/lib/validations/catalog";

export const productDetailInclude = {
  category: { select: { id: true, nameFa: true, slug: true } },
  inventory: true,
  images: { orderBy: [{ sortOrder: "asc" as const }] },
} satisfies Prisma.ProductInclude;

export async function createProductRecord(input: ProductCreateInput) {
  return prisma.product.create({
    data: {
      slug: input.slug,
      sku: input.sku || null,
      titleFa: input.titleFa,
      descriptionFa: input.descriptionFa,
      priceMinor: input.priceMinor,
      compareAtMinor: input.compareAtMinor ?? null,
      weightGrams: input.weightGrams ?? null,
      isActive: input.isActive,
      isFeatured: input.isFeatured,
      isNew: input.isNew,
      isBestSeller: input.isBestSeller,
      metaTitleFa: input.metaTitleFa ?? null,
      metaDescFa: input.metaDescFa ?? null,
      categoryId: input.categoryId,
      inventory: { create: input.inventory },
      images: {
        create: input.images.map((image, index) => ({
          url: image.url,
          altFa: image.altFa,
          sortOrder: image.sortOrder ?? index,
          isPrimary: image.isPrimary || index === 0,
        })),
      },
    },
    include: productDetailInclude,
  });
}

export async function updateProductRecord(id: string, input: ProductUpdateInput) {
  return prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.sku !== undefined ? { sku: input.sku || null } : {}),
        ...(input.titleFa !== undefined ? { titleFa: input.titleFa } : {}),
        ...(input.descriptionFa !== undefined ? { descriptionFa: input.descriptionFa } : {}),
        ...(input.priceMinor !== undefined ? { priceMinor: input.priceMinor } : {}),
        ...(input.compareAtMinor !== undefined
          ? { compareAtMinor: input.compareAtMinor ?? null }
          : {}),
        ...(input.weightGrams !== undefined ? { weightGrams: input.weightGrams ?? null } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
        ...(input.isNew !== undefined ? { isNew: input.isNew } : {}),
        ...(input.isBestSeller !== undefined ? { isBestSeller: input.isBestSeller } : {}),
        ...(input.metaTitleFa !== undefined ? { metaTitleFa: input.metaTitleFa ?? null } : {}),
        ...(input.metaDescFa !== undefined ? { metaDescFa: input.metaDescFa ?? null } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      },
    });

    if (input.inventory) {
      await tx.inventory.upsert({
        where: { productId: id },
        create: { productId: id, ...input.inventory },
        update: input.inventory,
      });
    }

    if (input.images) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (input.images.length > 0) {
        await tx.productImage.createMany({
          data: input.images.map((image, index) => ({
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
      include: productDetailInclude,
    });
  });
}

export async function deactivateProductRecord(id: string) {
  return prisma.product.update({
    where: { id },
    data: { isActive: false },
    include: productDetailInclude,
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: productDetailInclude,
  });
}
