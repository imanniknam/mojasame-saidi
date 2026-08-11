import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const u = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { email: true, phone: true } });
console.log(JSON.stringify(u));
await prisma.$disconnect();
