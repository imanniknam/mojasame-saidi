// تأیید اینکه ستون email واقعاً nullable است و ایندکس یکتا سر جایش مانده
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const col = await prisma.$queryRaw`
  SELECT column_name, is_nullable, data_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'User' AND column_name IN ('email','phone')
`;
console.log("COLUMNS:", JSON.stringify(col));

const idx = await prisma.$queryRaw`
  SELECT indexname FROM pg_indexes
  WHERE schemaname = 'public' AND tablename = 'User'
`;
console.log("INDEXES:", JSON.stringify(idx));

const counts = await prisma.user.groupBy({
  by: ["role"],
  _count: { _all: true },
});
console.log("USERS:", JSON.stringify(counts));

await prisma.$disconnect();
