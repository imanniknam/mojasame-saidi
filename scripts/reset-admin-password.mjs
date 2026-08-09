/**
 * تغییر رمز حساب ادمین.
 *
 * رمز از متغیر محیطی خوانده می‌شود تا در تاریخچه‌ی شل یا لاگ‌ها ثبت نشود
 * و در کد هم جایی نوشته نشود.
 *
 *   PowerShell:
 *     $env:NEW_ADMIN_PASSWORD = 'رمز-قوی-شما'
 *     node --env-file=.env.local scripts/reset-admin-password.mjs
 *     Remove-Item Env:\NEW_ADMIN_PASSWORD
 *
 * برای هدف گرفتن حساب دیگر: $env:ADMIN_EMAIL = 'other@example.com'
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const password = process.env.NEW_ADMIN_PASSWORD;
const email = process.env.ADMIN_EMAIL ?? "admin@mojasamesaidi.ir";

if (!password) {
  console.error("NEW_ADMIN_PASSWORD تنظیم نشده است. راهنما را در بالای همین فایل ببینید.");
  process.exit(1);
}

const problems = [];
if (password.length < 10) problems.push("حداقل ۱۰ کاراکتر");
if (!/[a-z]/.test(password)) problems.push("حداقل یک حرف کوچک");
if (!/[A-Z]/.test(password)) problems.push("حداقل یک حرف بزرگ");
if (!/[0-9]/.test(password)) problems.push("حداقل یک رقم");
if (password === "ChangeMe123!") problems.push("رمز پیش‌فرض seed قابل استفاده نیست");

if (problems.length > 0) {
  console.error("رمز انتخابی ضعیف است:\n  - " + problems.join("\n  - "));
  process.exit(1);
}

const user = await prisma.user.findUnique({
  where: { email },
  select: { id: true, role: true },
});

if (!user) {
  console.error(`حسابی با ایمیل ${email} پیدا نشد.`);
  process.exit(1);
}
if (user.role !== "ADMIN") {
  console.error(`حساب ${email} نقش ADMIN ندارد. تغییری اعمال نشد.`);
  process.exit(1);
}

await prisma.user.update({
  where: { id: user.id },
  data: { passwordHash: await bcrypt.hash(password, 12) },
});

console.log(`رمز حساب ${email} با موفقیت تغییر کرد.`);
console.log("حالا متغیر محیطی را پاک کنید: Remove-Item Env:\\NEW_ADMIN_PASSWORD");

await prisma.$disconnect();
