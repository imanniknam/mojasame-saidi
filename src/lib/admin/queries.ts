import { prisma } from "@/lib/prisma";

export async function getAdminDashboardStats() {
  const [
    products,
    categories,
    activeProducts,
    lowStock,
    orders,
    customers,
    openOrders,
    revenue,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.inventory.count({ where: { quantityOnHand: { lte: 3 } } }),
    prisma.order.count(),
    prisma.customer.count(),
    // سفارش‌هایی که منتظر اقدام فروشنده‌اند
    prisma.order.count({
      where: { status: { in: ["AWAITING_PAYMENT", "PAID", "PROCESSING"] } },
    }),
    // فروش محقق‌شده — فقط سفارش‌های پرداخت‌شده
    prisma.order.aggregate({
      _sum: { totalMinor: true },
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
    }),
  ]);

  return {
    products,
    categories,
    activeProducts,
    lowStock,
    orders,
    customers,
    openOrders,
    revenueMinor: revenue._sum.totalMinor ?? 0,
  };
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
