import { Prisma, PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** دسته‌بندی‌های نمونه — اسلاگ لاتین برای URL پایدار */
const CATEGORIES: { slug: string; nameFa: string; sortOrder: number }[] = [
  { slug: "goldan", nameFa: "گلدان", sortOrder: 10 },
  { slug: "tandis", nameFa: "تندیس", sortOrder: 20 },
  { slug: "shamdan", nameFa: "جاشمعی", sortOrder: 30 },
  { slug: "ghab", nameFa: "قاب", sortOrder: 40 },
  { slug: "ghab-fiber", nameFa: "قاب فایبر", sortOrder: 50 },
  { slug: "dastmal-cover", nameFa: "کاور دستمال", sortOrder: 60 },
  { slug: "heyvanat", nameFa: "حیوانات", sortOrder: 70 },
  { slug: "book-holder", nameFa: "هولدر کتاب", sortOrder: 80 },
  { slug: "sini", nameFa: "سینی", sortOrder: 90 },
  { slug: "abajor", nameFa: "اباژور", sortOrder: 100 },
  { slug: "fereshte-mojasame", nameFa: "مجسمه فرشته", sortOrder: 110 },
  { slug: "fereshte-divari", nameFa: "فرشته دیواری", sortOrder: 120 },
  { slug: "shamdan-divari", nameFa: "جاشمعی دیواری", sortOrder: 130 },
  { slug: "konsol", nameFa: "کنسول", sortOrder: 140 },
  { slug: "paye-miz", nameFa: "پایه میز", sortOrder: 150 },
  { slug: "divarkoob", nameFa: "دیوارکوب", sortOrder: 160 },
  { slug: "ghab-payedar", nameFa: "قاب پایه دار", sortOrder: 170 },
  { slug: "banka", nameFa: "بانکه", sortOrder: 180 },
  { slug: "kado", nameFa: "کدو", sortOrder: 190 },
  { slug: "christmas", nameFa: "کریسمسی", sortOrder: 200 },
  { slug: "pazirayi", nameFa: "ظرف پذیرایی", sortOrder: 210 },
  { slug: "haftsin", nameFa: "هفتسین", sortOrder: 220 },
  { slug: "crystal", nameFa: "کریستال", sortOrder: 230 },
];

async function main() {
  const password = await bcrypt.hash("ChangeMe123!", 12);

  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, nameFa: c.nameFa, sortOrder: c.sortOrder, isActive: true },
      update: { nameFa: c.nameFa, sortOrder: c.sortOrder, isActive: true },
    });
  }

  await prisma.storeSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      brandNameFa: "فروشگاه مجسمه‌سازی سعیدی",
      taglineFa: "مجسمه و دکور دست‌ساز",
      supportPhone: "۰۹۱۲۳۴۵۶۷۸۹",
      supportEmail: "info@mojasamesaidi.ir",
      trustBadges: [
        { titleFa: "ارسال سریع", icon: "truck" },
        { titleFa: "پرداخت امن", icon: "shield" },
        { titleFa: "کیفیت دست‌ساز", icon: "sparkles" },
      ],
    },
    update: {},
  });

  const sections = [
    { key: "HERO", titleFa: "اسلایدر قهرمان", sortOrder: 0, isEnabled: true },
    { key: "CATEGORIES", titleFa: "دسته‌بندی‌ها", sortOrder: 10, isEnabled: true },
    { key: "FEATURED", titleFa: "منتخب فروشگاه", sortOrder: 20, isEnabled: true, config: { limit: 8 } },
    { key: "BEST_SELLERS", titleFa: "پرفروش‌ها", sortOrder: 30, isEnabled: true, config: { limit: 8 } },
    { key: "DISCOUNTS", titleFa: "تخفیف‌ها", sortOrder: 40, isEnabled: true },
    { key: "NEW_ARRIVALS", titleFa: "تازه‌ها", sortOrder: 50, isEnabled: true, config: { limit: 8 } },
    { key: "TRUST", titleFa: "اعتماد مشتری", sortOrder: 60, isEnabled: true },
  ];

  for (const s of sections) {
    await prisma.homepageSection.upsert({
      where: { key: s.key },
      create: s,
      update: {
        titleFa: s.titleFa,
        sortOrder: s.sortOrder,
        isEnabled: s.isEnabled,
        config: s.config ?? undefined,
      },
    });
  }

  await prisma.banner.upsert({
    where: { id: "seed-hero-banner" },
    create: {
      id: "seed-hero-banner",
      titleFa: "مجسمه‌سازی سعیدی",
      subtitleFa: "دکور دست‌ساز با حس گرم خانه",
      imageUrl: "/images/placeholder-hero.svg",
      href: "/",
      placement: "HERO",
      sortOrder: 0,
      isActive: true,
    },
    update: {
      titleFa: "مجسمه‌سازی سعیدی",
      subtitleFa: "دکور دست‌ساز با حس گرم خانه",
      imageUrl: "/images/placeholder-hero.svg",
      isActive: true,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@mojasamesaidi.ir" },
    create: {
      email: "admin@mojasamesaidi.ir",
      passwordHash: password,
      phone: "09120000000",
      role: "ADMIN",
      isActive: true,
      admin: {
        create: { displayName: "مدیر سیستم", isSuperAdmin: true },
      },
    },
    update: { passwordHash: password, role: "ADMIN", isActive: true },
    include: { admin: true },
  });

  if (!adminUser.admin) {
    await prisma.admin.create({
      data: { userId: adminUser.id, displayName: "مدیر سیستم", isSuperAdmin: true },
    });
  }

  const customerUser = await prisma.user.upsert({
    where: { email: "customer@mojasamesaidi.ir" },
    create: {
      email: "customer@mojasamesaidi.ir",
      passwordHash: password,
      phone: "09121111111",
      role: "CUSTOMER",
      isActive: true,
      customer: {
        create: { firstName: "نمونه", lastName: "خریدار", displayFa: "خریدار نمونه" },
      },
    },
    update: { passwordHash: password, role: "CUSTOMER", isActive: true },
    include: { customer: true },
  });

  if (!customerUser.customer) {
    await prisma.customer.create({
      data: {
        userId: customerUser.id,
        firstName: "نمونه",
        lastName: "خریدار",
        displayFa: "خریدار نمونه",
      },
    });
  }

  const customer = await prisma.customer.findUniqueOrThrow({
    where: { userId: customerUser.id },
  });

  let productIndex = 0;
  for (const category of CATEGORIES) {
    productIndex += 1;
    const categoryRow = await prisma.category.findUniqueOrThrow({
      where: { slug: category.slug },
    });
    const slug = `nemune-${category.slug}`;
    const sku = `MS-SEED-${String(productIndex).padStart(3, "0")}`;
    const priceMinor = 450_000 + productIndex * 35_000;
    const isFeatured = productIndex <= 4;
    const isNew = productIndex % 3 === 0;
    const isBestSeller = productIndex % 5 === 0;

    const product = await prisma.product.upsert({
      where: { slug },
      create: {
        slug,
        sku,
        titleFa: `${category.nameFa} دست‌ساز نمونه`,
        descriptionFa: `محصول نمونه در دسته ${category.nameFa} — مناسب تست فروشگاه و چیدمان دکور.`,
        priceMinor,
        compareAtMinor: isFeatured ? priceMinor + 120_000 : null,
        weightGrams: 800 + productIndex * 40,
        isActive: true,
        isFeatured,
        isNew,
        isBestSeller,
        categoryId: categoryRow.id,
        images: {
          create: [
            {
              url: "/images/placeholder-product.svg",
              altFa: `${category.nameFa} نمونه`,
              sortOrder: 0,
              isPrimary: true,
            },
          ],
        },
        inventory: {
          create: {
            quantityOnHand: 8 + (productIndex % 6),
            quantityReserved: 0,
            lowStockThreshold: 2,
          },
        },
      },
      update: {
        titleFa: `${category.nameFa} دست‌ساز نمونه`,
        priceMinor,
        isActive: true,
        categoryId: categoryRow.id,
        isFeatured,
        isNew,
        isBestSeller,
      },
      include: { inventory: true },
    });

    if (!product.inventory) {
      await prisma.inventory.create({
        data: {
          productId: product.id,
          quantityOnHand: 8 + (productIndex % 6),
          lowStockThreshold: 2,
        },
      });
    }
  }

  const discount = await prisma.discount.upsert({
    where: { code: "WELCOME10" },
    create: {
      code: "WELCOME10",
      nameFa: "تخفیف خوش‌آمدگویی",
      descriptionFa: "۱۰٪ تخفیف برای اولین خرید (نمونه)",
      type: "PERCENT",
      value: 10,
      scope: "ALL",
      minOrderMinor: 500_000,
      maxDiscountMinor: 200_000,
      isActive: true,
    },
    update: { isActive: true },
  });

  await prisma.discount.update({
    where: { id: discount.id },
    data: {
      products: { set: [] },
      categories: { set: [] },
    },
  });

  await prisma.address.upsert({
    where: { id: "seed-address-home" },
    create: {
      id: "seed-address-home",
      customerId: customer.id,
      label: "HOME",
      recipientFa: "خریدار نمونه",
      phone: "09121111111",
      provinceFa: "تهران",
      cityFa: "تهران",
      postalCode: "1234567890",
      line1: "خیابان نمونه، پلاک ۱",
      isDefault: true,
    },
    update: {},
  }).catch(async () => {
    const existing = await prisma.address.findFirst({
      where: { customerId: customer.id, isDefault: true },
    });
    if (!existing) {
      await prisma.address.create({
        data: {
          customerId: customer.id,
          label: "HOME",
          recipientFa: "خریدار نمونه",
          phone: "09121111111",
          provinceFa: "تهران",
          cityFa: "تهران",
          postalCode: "1234567890",
          line1: "خیابان نمونه، پلاک ۱",
          isDefault: true,
        },
      });
    }
  });

  const addr = await prisma.address.findFirst({
    where: { customerId: customer.id, isDefault: true },
  });

  const productForWish = await prisma.product.findUniqueOrThrow({
    where: { slug: "nemune-goldan" },
  });

  await prisma.wishlist.upsert({
    where: {
      customerId_productId: { customerId: customer.id, productId: productForWish.id },
    },
    create: { customerId: customer.id, productId: productForWish.id },
    update: {},
  });

  const order = await prisma.order.upsert({
    where: { orderNumber: "MS-100001" },
    create: {
      orderNumber: "MS-100001",
      status: "PAID",
      customerId: customer.id,
      currency: "IRT",
      subtotalMinor: 1_250_000,
      discountMinor: 0,
      shippingMinor: 80_000,
      taxMinor: 0,
      totalMinor: 1_330_000,
      shippingAddressId: addr?.id,
      shippingSnapshot: {
        recipientFa: "خریدار نمونه",
        phone: "09121111111",
        provinceFa: "تهران",
        cityFa: "تهران",
        line1: "خیابان نمونه، پلاک ۱",
      },
      billingSnapshot: Prisma.JsonNull,
      items: {
        create: [
          {
            productId: productForWish.id,
            quantity: 1,
            unitPriceMinor: 1_250_000,
            titleFaSnap: productForWish.titleFa,
            skuSnap: productForWish.sku,
          },
        ],
      },
      payments: {
        create: {
          provider: "MANUAL",
          status: "CAPTURED",
          amountMinor: 1_330_000,
          currency: "IRT",
          paidAt: new Date(),
        },
      },
    },
    update: { status: "PAID" },
  });

  await prisma.order.upsert({
    where: { orderNumber: order.orderNumber },
    create: {},
    update: {},
  });

  console.info("Seed OK:", {
    categories: CATEGORIES.length,
    products: productIndex,
    admin: "admin@mojasamesaidi.ir",
    customer: "customer@mojasamesaidi.ir",
    passwordNote: "ChangeMe123! (حتماً در تولید تغییر دهید)",
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
