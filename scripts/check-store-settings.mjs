import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const s = await prisma.storeSettings.findUnique({ where: { id: 1 } });
console.log(JSON.stringify(s, null, 2));
await prisma.$disconnect();
