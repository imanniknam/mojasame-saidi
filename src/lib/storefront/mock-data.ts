/** @deprecated Use `@/lib/storefront/types` and `@/lib/storefront/queries` */
export type { StoreCategory, StoreProduct } from "@/lib/storefront/types";

export {
  getRelatedStoreProducts as getRelatedProducts,
  getStoreCategoryBySlug as getCategoryBySlug,
  getStoreProductBySlug as getProductBySlug,
  listProductsByCategorySlug as getProductsByCategory,
  listStoreCategories,
  listStoreProducts,
} from "@/lib/storefront/queries";
