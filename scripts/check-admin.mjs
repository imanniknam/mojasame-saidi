// تشخیص مشکل ورود ادمین — فقط‌خواندنی، هیچ رمزی چاپ نمی‌شود.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CANDIDATES = ["ChangeMe123!", "changeme123!", "ChangeMe123", "Admin@123", "admin"];

const users = await prisma.user.findMany({
  where: { OR: [{ role: "ADMIN" }, { email: { contains: "admin" } }] },
  select: {
    id: true,
    email: true,
    role: true,
    isActive: true,
    passwordHash: true,
    createdAt: true,
    admin: { select: { id: true, displayName: true, isSuperAdmin: true } },
  },
});

console.log(`MATCHING ACCOUNTS: ${users.length}\n`);

for (const u of users) {
  const h = u.passwordHash ?? "";
  console.log(`email:        ${u.email}`);
  console.log(`role:         ${u.role}`);
  console.log(`isActive:     ${u.isActive}`);
  console.log(`admin row:    ${u.admin ? `yes (${u.admin.displayName})` : "NO  <-- login needs this"}`);
  console.log(`hash algo:    ${h.slice(0, 4) || "(empty)"}  cost=${h.split("$")[2] ?? "?"}`);
  console.log(`hash length:  ${h.length}`);

  for (const c of CANDIDATES) {
    const ok = await bcrypt.compare(c, h);
    if (ok) console.log(`  MATCH: this account's password IS "${c}"`);
  }
  const anyMatch = (
    await Promise.all(CANDIDATES.map((c) => bcrypt.compare(c, h)))
  ).some(Boolean);
  if (!anyMatch) console.log(`  none of the ${CANDIDATES.length} common/seed passwords match this hash`);
  console.log("");
}

await prisma.$disconnect();
