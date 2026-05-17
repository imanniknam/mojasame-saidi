/** تایپ‌های نمایشی/فرم — آینه‌ی انتخابی از Prisma برای لایه‌ی UI */

export type MoneyMinor = number;

export type ProductCardDTO = {
  id: string;
  slug: string;
  titleFa: string;
  priceMinor: MoneyMinor;
  compareAtMinor?: MoneyMinor | null;
  imageUrl?: string | null;
};
