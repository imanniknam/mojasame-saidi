// حذف داده‌های آزمایشی — برگشت‌ناپذیر.
// بدون CONFIRM=YES فقط گزارش می‌دهد و چیزی را پاک نمی‌کند.
//
//   node --env-file=.env.local scripts/purge-test-data.mjs            # فقط گزارش
//   CONFIRM=YES node --env-file=.env.local scripts/purge-test-data.mjs # اجرا
//
// محصول عمداً دست‌نخورده می‌ماند. حساب ادمین هم همین‌طور.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DO_IT = process.env.CONFIRM === "YES";

const orders = await prisma.order.findMany({
  select: { id: true, orderNumber: true, status: true },
});

// «همه‌ی حساب‌ها به‌جز ادمین» = هر User که رکورد Admin ندارد.
// حذف User به‌صورت آبشاری Customer، آدرس‌ها، سبدها، علاقه‌مندی‌ها و
// توکن‌های بازیابی رمز را هم پاک می‌کند.
const users = await prisma.user.findMany({
  where: { admin: null },
  select: { id: true, phone: true, email: true, customer: { select: { displayFa: true } } },
});

const admins = await prisma.user.findMany({
  where: { admin: { isNot: null } },
  select: { phone: true, email: true, admin: { select: { displayName: true } } },
});

console.log(`\n=== حذف می‌شوند ===`);
console.log(`  سفارش‌ها: ${orders.length}`);
console.log(`  کاربران:  ${users.length}`);
for (const u of users) {
  console.log(`    - ${u.phone ?? "—"}  ${u.customer?.displayFa ?? ""}  ${u.email ?? ""}`);
}
console.log(`\n=== دست‌نخورده می‌مانند ===`);
console.log(`  محصولات: ${await prisma.product.count()}`);
for (const a of admins) {
  console.log(`  ادمین: ${a.phone ?? "—"}  ${a.admin?.displayName ?? ""}  ${a.email ?? ""}`);
}

if (!DO_IT) {
  console.log(`\n(حالت گزارش — چیزی پاک نشد. برای اجرا: CONFIRM=YES)`);
  await prisma.$disconnect();
  process.exit(0);
}

console.log(`\n=== اجرا ===`);

// ترتیب مهم است: قلم سفارش به محصول ارجاع دارد و سفارش به مشتری، پس اول
// سفارش‌ها می‌روند. items/payments/statusHistory/discountUsage آبشاری پاک می‌شوند.
const deletedOrders = await prisma.order.deleteMany({});
console.log(`  سفارش‌های حذف‌شده: ${deletedOrders.count}`);

const deletedUsers = await prisma.user.deleteMany({ where: { admin: null } });
console.log(`  کاربران حذف‌شده:  ${deletedUsers.count}`);

console.log(`\n=== وضعیت نهایی ===`);
console.log(`  سفارش‌ها: ${await prisma.order.count()}`);
console.log(`  مشتریان:  ${await prisma.customer.count()}`);
console.log(`  کاربران:  ${await prisma.user.count()}`);
console.log(`  ادمین‌ها:  ${await prisma.admin.count()}`);
console.log(`  محصولات:  ${await prisma.product.count()}`);

const inv = await prisma.inventory.findMany({
  select: { quantityOnHand: true, quantityReserved: true, product: { select: { titleFa: true } } },
});
console.log(`\n=== موجودی (سفارش‌های حذف‌شده موجودی را برنمی‌گردانند) ===`);
for (const i of inv) {
  console.log(`  ${i.product.titleFa}: onHand=${i.quantityOnHand} reserved=${i.quantityReserved}`);
}

await prisma.$disconnect();
