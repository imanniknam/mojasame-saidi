import { prisma } from "@/lib/prisma";

type DashboardStatsRow = {
  products: number;
  categories: number;
  activeProducts: number;
  lowStock: number;
  orders: number;
  customers: number;
  openOrders: number;
  revenueMinor: number;
};

/**
 * هشت شمارش در یک کوئری.
 *
 * قبلاً هشت کوئری جدا با `Promise.all` زده می‌شد، ولی «موازی» فقط در کد
 * موازی بود: دیتابیس تولید از راه دور است و درخواست‌ها عملاً پشت‌سرهم اجرا
 * می‌شدند. اندازه‌گیری روی همان دیتابیس: هشت کوئری ۳۵۶۳ میلی‌ثانیه، همین
 * کوئری واحد ۴۳۲ میلی‌ثانیه. داشبورد صفحه‌ی اولِ پنل است و همین تفاوت،
 * فرقِ «کند ولی کار می‌کند» با «مرز خطا فعال می‌شود» بود.
 */
export async function getAdminDashboardStats(): Promise<DashboardStatsRow> {
  const [row] = await prisma.$queryRaw<DashboardStatsRow[]>`
    SELECT
      (SELECT COUNT(*) FROM "Product")::int AS "products",
      (SELECT COUNT(*) FROM "Category")::int AS "categories",
      (SELECT COUNT(*) FROM "Product" WHERE "isActive")::int AS "activeProducts",
      (SELECT COUNT(*) FROM "Inventory" WHERE "quantityOnHand" <= 3)::int AS "lowStock",
      (SELECT COUNT(*) FROM "Order")::int AS "orders",
      (SELECT COUNT(*) FROM "Customer")::int AS "customers",
      (SELECT COUNT(*) FROM "Order"
        WHERE "status" IN ('AWAITING_PAYMENT','PAID','PROCESSING'))::int AS "openOrders",
      (SELECT COALESCE(SUM("totalMinor"), 0) FROM "Order"
        WHERE "status" IN ('PAID','PROCESSING','SHIPPED','DELIVERED'))::int AS "revenueMinor"
  `;

  return (
    row ?? {
      products: 0,
      categories: 0,
      activeProducts: 0,
      lowStock: 0,
      orders: 0,
      customers: 0,
      openOrders: 0,
      revenueMinor: 0,
    }
  );
}

/** آخرین سفارش‌ها برای داشبورد */
export async function listRecentOrders(limit = 5) {
  return prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalMinor: true,
      createdAt: true,
      guestNameFa: true,
      customer: { select: { displayFa: true } },
    },
  });
}

export async function listAdminProducts(limit = 50) {
  return prisma.product.findMany({
    take: limit,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      titleFa: true,
      slug: true,
      isActive: true,
      priceMinor: true,
      category: { select: { nameFa: true } },
      inventory: { select: { quantityOnHand: true } },
    },
  });
}

export async function listAdminCategories(limit = 50) {
  return prisma.category.findMany({
    take: limit,
    orderBy: [{ sortOrder: "asc" }, { nameFa: "asc" }],
    select: {
      id: true,
      nameFa: true,
      slug: true,
      isActive: true,
      sortOrder: true,
      _count: { select: { products: true } },
    },
  });
}

export async function listAdminOrders(limit = 50) {
  return prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalMinor: true,
      createdAt: true,
      guestNameFa: true,
      customer: {
        select: {
          displayFa: true,
          user: { select: { email: true } },
        },
      },
    },
  });
}

export async function listAdminCustomers(limit = 50) {
  return prisma.customer.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      displayFa: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      user: { select: { email: true, isActive: true } },
      _count: { select: { orders: true } },
    },
  });
}

export async function listAdminBanners() {
  return prisma.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      titleFa: true,
      placement: true,
      isActive: true,
      sortOrder: true,
    },
  });
}

export async function listAdminHomepageSections() {
  return prisma.homepageSection.findMany({
    orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
    select: {
      id: true,
      key: true,
      titleFa: true,
      isEnabled: true,
      sortOrder: true,
    },
  });
}

export async function getStoreSettings() {
  return prisma.storeSettings.findUnique({ where: { id: 1 } });
}

export async function getAdminDisplayName(userId: string) {
  const admin = await prisma.admin.findUnique({
    where: { userId },
    select: { displayName: true },
  });
  return admin?.displayName ?? null;
}
