import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AuthDatabaseError = {
  code: string;
  message: string;
  status: number;
  cause?: string;
};

const SCHEMA_SETUP_HINT =
  "در پوشه پروژه mojasame-saidi اجرا کنید: npm run db:setup (یا npx prisma migrate deploy && npx prisma generate)";

export async function ensureDatabaseConnection(): Promise<AuthDatabaseError | null> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return null;
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    const message =
      error instanceof Prisma.PrismaClientInitializationError
        ? `اتصال به PostgreSQL برقرار نشد. سرویس را روشن کنید و DATABASE_URL را در .env بررسی کنید. ${SCHEMA_SETUP_HINT}`
        : `خطا در دسترسی به پایگاه‌داده. ${SCHEMA_SETUP_HINT}`;

    return {
      code: "DATABASE_UNAVAILABLE",
      message,
      status: 503,
      cause,
    };
  }
}

/** Ensures DB is reachable and auth-related columns exist (e.g. User.role). */
export async function ensureAuthSchemaReady(): Promise<AuthDatabaseError | null> {
  const connectionError = await ensureDatabaseConnection();
  if (connectionError) return connectionError;

  try {
    const [userTable] = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'User'
      ) AS "exists"
    `;

    if (!userTable?.exists) {
      return {
        code: "SCHEMA_OUT_OF_DATE",
        message: `جدول User وجود ندارد. ${SCHEMA_SETUP_HINT}`,
        status: 503,
        cause: "missing User table",
      };
    }

    const [roleColumn] = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'User'
          AND column_name = 'role'
      ) AS "exists"
    `;

    if (!roleColumn?.exists) {
      return {
        code: "SCHEMA_OUT_OF_DATE",
        message: `ستون role در User وجود ندارد. ${SCHEMA_SETUP_HINT}`,
        status: 503,
        cause: "missing User.role",
      };
    }

    return null;
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    return {
      code: "DATABASE_UNAVAILABLE",
      message: `بررسی ساختار دیتابیس ناموفق بود. ${SCHEMA_SETUP_HINT}`,
      status: 503,
      cause,
    };
  }
}

export function mapPrismaAuthError(
  error: unknown,
): { code: string; message: string; status: number } | null {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      code: "DATABASE_UNAVAILABLE",
      message: `اتصال به پایگاه‌داده برقرار نشد. ${SCHEMA_SETUP_HINT}`,
      status: 503,
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        code: "DUPLICATE_USER",
        message: "این ایمیل یا شماره موبایل قبلاً ثبت شده است.",
        status: 409,
      };
    }
    if (error.code === "P2021" || error.code === "P2022") {
      return {
        code: "SCHEMA_OUT_OF_DATE",
        message: `ساختار پایگاه‌داده قدیمی است. ${SCHEMA_SETUP_HINT}`,
        status: 503,
      };
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      code: "SCHEMA_OUT_OF_DATE",
      message: `مدل Prisma با دیتابیس هم‌خوان نیست. ${SCHEMA_SETUP_HINT}`,
      status: 503,
    };
  }

  const message = error instanceof Error ? error.message : String(error);
  if (/column.*does not exist|relation.*does not exist/i.test(message)) {
    return {
      code: "SCHEMA_OUT_OF_DATE",
      message: `ساختار پایگاه‌داده ناقص است. ${SCHEMA_SETUP_HINT}`,
      status: 503,
    };
  }

  return null;
}
