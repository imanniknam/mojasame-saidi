import type { ProductFormValues } from "@/components/admin/products/admin-product-form";
import type { getProductForAdminEdit } from "./queries";

type ProductRecord = NonNullable<Awaited<ReturnType<typeof getProductForAdminEdit>>>;

export function emptyProductFormValues(categoryId = ""): ProductFormValues {
  return {
    slug: "",
    sku: "",
    titleFa: "",
    descriptionFa: "",
    priceMinor: 0,
    compareAtMinor: null,
    weightGrams: null,
    isActive: true,
    isFeatured: false,
    isNew: true,
    isBestSeller: false,
    metaTitleFa: "",
    metaDescFa: "",
    categoryId,
    inventory: {
      quantityOnHand: 0,
      quantityReserved: 0,
      lowStockThreshold: 3,
    },
    images: [],
  };
}

export function productToFormValues(product: ProductRecord): ProductFormValues {
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku ?? "",
    titleFa: product.titleFa,
    descriptionFa: product.descriptionFa,
    priceMinor: product.priceMinor,
    compareAtMinor: product.compareAtMinor,
    weightGrams: product.weightGrams,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    metaTitleFa: product.metaTitleFa ?? "",
    metaDescFa: product.metaDescFa ?? "",
    categoryId: product.categoryId,
    inventory: {
      quantityOnHand: product.inventory?.quantityOnHand ?? 0,
      quantityReserved: product.inventory?.quantityReserved ?? 0,
      lowStockThreshold: product.inventory?.lowStockThreshold ?? 3,
    },
    images: product.images.map((img, index) => ({
      id: img.id,
      url: img.url,
      altFa: img.altFa,
      sortOrder: img.sortOrder ?? index,
      isPrimary: img.isPrimary,
    })),
  };
}
