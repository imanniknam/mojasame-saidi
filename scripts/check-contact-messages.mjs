import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const rows = await prisma.contactMessage.findMany({ select: { id: true, email: true, phone: true } });
console.log("count:", rows.length);
console.log(JSON.stringify(rows, null, 2));
await prisma.$disconnect();
