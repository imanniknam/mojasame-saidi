// آیا همه‌ی حساب‌ها شماره موبایل دارند؟ اگر نه، ورود فقط-با-موبایل قفلشان می‌کند.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  select: { email: true, phone: true, role: true, isActive: true },
  orderBy: { createdAt: "asc" },
});

console.log(`TOTAL USERS: ${users.length}\n`);
for (const u of users) {
  const mask = (e) => e.replace(/^(.).*(@.*)$/, "$1***$2");
  console.log(
    `${u.role.padEnd(8)} active=${String(u.isActive).padEnd(5)} phone=${(u.phone ?? "— MISSING").padEnd(14)} ${mask(u.email)}`,
  );
}

const missing = users.filter((u) => !u.phone);
console.log(`\nWITHOUT PHONE (would be locked out): ${missing.length}`);

await prisma.$disconnect();
