import { ensureAuthSchemaReady, ensureDatabaseConnection } from "@/lib/auth/db";
import { prisma } from "@/lib/prisma";
import { jsonNoStore } from "@/lib/server/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const connection = await ensureDatabaseConnection();
  const schema = connection ? null : await ensureAuthSchemaReady();

  let migrationCount: number | null = null;
  if (!connection) {
    try {
      const rows = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count FROM "_prisma_migrations" WHERE "finished_at" IS NOT NULL
      `;
      migrationCount = Number(rows[0]?.count ?? 0);
    } catch {
      migrationCount = null;
    }
  }

  const ready = hasDatabaseUrl && !connection && !schema;
  const status = ready ? 200 : 503;

  return jsonNoStore(
    {
      ok: ready,
      database: {
        configured: hasDatabaseUrl,
        connected: !connection,
        authSchemaReady: !schema,
        appliedMigrations: migrationCount,
      },
      error: schema ?? connection ?? undefined,
      hint: ready
        ? undefined
        : "PostgreSQL را روشن کنید، سپس در پوشه mojasame-saidi: npm run db:setup",
    },
    { status },
  );
}
