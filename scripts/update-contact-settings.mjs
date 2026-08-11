// به‌روزرسانی شماره پشتیبانی و حذف ایمیل نمایشی از تنظیمات فروشگاه
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updated = await prisma.storeSettings.update({
  where: { id: 1 },
  data: {
    supportPhone: "۰۹۱۷۱۲۰۳۹۹۱",
    supportEmail: null,
  },
});

console.log(JSON.stringify(updated, null, 2));
await prisma.$disconnect();
