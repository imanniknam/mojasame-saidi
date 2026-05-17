export type StoreCategory = {
  slug: string;
  nameFa: string;
  descriptionFa: string;
};

export type StoreProduct = {
  id: string;
  slug: string;
  titleFa: string;
  descriptionFa: string;
  categorySlug: string;
  categoryNameFa: string;
  priceMinor: number;
  compareAtMinor?: number;
  imageUrl: string;
  images: string[];
  inStock: boolean;
  inventoryCount: number;
  specs: { labelFa: string; valueFa: string }[];
  keywordsFa: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
};
