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

export const storeCategories: StoreCategory[] = [
  {
    slug: "goldan",
    nameFa: "گلدان",
    descriptionFa: "گلدان‌های دست‌ساز، سنگی و دکوراتیو برای خانه‌های گرم و هنری.",
  },
  {
    slug: "tandis",
    nameFa: "تندیس",
    descriptionFa: "تندیس‌های رزین و دکور لوکس مناسب هدیه و چیدمان هنری.",
  },
  {
    slug: "shamdan",
    nameFa: "جاشمعی",
    descriptionFa: "جاشمعی‌های دکوراتیو دست‌ساز برای میز، دیوار و فضای پذیرایی.",
  },
];

export const storeProducts: StoreProduct[] = [
  {
    id: "sample-1",
    slug: "sample-1",
    titleFa: "گلدان سنگی دست‌ساز — طرح کوهستان",
    descriptionFa:
      "گلدان سنگی دست‌ساز با بافت گرم و فرم هنری، مناسب چیدمان مینیمال، میز کنسول و دکور پذیرایی.",
    categorySlug: "goldan",
    categoryNameFa: "گلدان",
    priceMinor: 1_250_000,
    compareAtMinor: 1_450_000,
    imageUrl: "/images/placeholder-product.svg",
    images: ["/images/placeholder-product.svg"],
    inStock: true,
    inventoryCount: 12,
    specs: [
      { labelFa: "جنس", valueFa: "سنگ مصنوعی دست‌ساز" },
      { labelFa: "کاربری", valueFa: "دکور میز و کنسول" },
      { labelFa: "رنگ", valueFa: "کرم گرم" },
    ],
    keywordsFa: ["گلدان سنگی", "گلدان دست‌ساز", "دکور لوکس"],
    isFeatured: true,
    isNew: true,
  },
  {
    id: "sample-2",
    slug: "sample-2",
    titleFa: "تندیس رزین با پایه چوب گردو",
    descriptionFa:
      "تندیس رزین هنری با پایه چوب گردو، انتخابی شیک برای هدیه، کتابخانه و دکور محل کار.",
    categorySlug: "tandis",
    categoryNameFa: "تندیس",
    priceMinor: 890_000,
    imageUrl: "/images/placeholder-product.svg",
    images: ["/images/placeholder-product.svg"],
    inStock: true,
    inventoryCount: 8,
    specs: [
      { labelFa: "جنس", valueFa: "رزین و چوب" },
      { labelFa: "سبک", valueFa: "مدرن هنری" },
      { labelFa: "مناسب برای", valueFa: "هدیه و دکور" },
    ],
    keywordsFa: ["تندیس رزین", "مجسمه دکوری", "هدیه هنری"],
    isNew: true,
    isBestSeller: true,
  },
  {
    id: "sample-3",
    slug: "sample-3",
    titleFa: "جاشمعی دیواری ستاره",
    descriptionFa:
      "جاشمعی دیواری دست‌ساز با فرم ستاره، مناسب ساخت نور گرم در راهرو، پذیرایی و فضای هنری.",
    categorySlug: "shamdan",
    categoryNameFa: "جاشمعی",
    priceMinor: 420_000,
    compareAtMinor: 495_000,
    imageUrl: "/images/placeholder-product.svg",
    images: ["/images/placeholder-product.svg"],
    inStock: true,
    inventoryCount: 5,
    specs: [
      { labelFa: "نوع نصب", valueFa: "دیواری" },
      { labelFa: "کاربری", valueFa: "نورپردازی دکوراتیو" },
      { labelFa: "سبک", valueFa: "گرم و مینیمال" },
    ],
    keywordsFa: ["جاشمعی دیواری", "دکور دیواری", "نورپردازی دکوراتیو"],
    isBestSeller: true,
  },
];

export function getProductBySlug(slug: string) {
  return storeProducts.find((product) => product.slug === slug) ?? null;
}

export function getCategoryBySlug(slug: string) {
  return storeCategories.find((category) => category.slug === slug) ?? null;
}

export function getProductsByCategory(slug: string) {
  return storeProducts.filter((product) => product.categorySlug === slug);
}

export function getRelatedProducts(product: StoreProduct) {
  const sameCategory = storeProducts.filter(
    (item) => item.categorySlug === product.categorySlug && item.id !== product.id,
  );
  const fallback = storeProducts.filter((item) => item.id !== product.id);
  return (sameCategory.length ? sameCategory : fallback).slice(0, 4);
}
