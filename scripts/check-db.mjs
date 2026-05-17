import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const log = [];

function step(name, fn) {
  try {
    const result = fn();
    log.push({ step: name, ok: true, result });
    return result;
  } catch (error) {
    log.push({
      step: name,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

try {
  const envPath = resolve(root, ".env");
  const envText = readFileSync(envPath, "utf8");
  const dbUrl = envText.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();
  log.push({
    step: "env",
    ok: !!dbUrl,
    hasDatabaseUrl: !!dbUrl,
    database: dbUrl?.replace(/:[^:@/]+@/, ":***@"),
  });
} catch (error) {
  log.push({ step: "env", ok: false, error: String(error) });
}

try {
  step("migrate_deploy", () =>
    execSync("npx prisma migrate deploy", {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }),
  );
} catch {
  // continue to generate + probe
}

try {
  step("generate", () =>
    execSync("npx prisma generate", {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }),
  );
} catch {
  // continue
}

try {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  await step("query_raw", () => prisma.$queryRaw`SELECT 1 as ok`);
  const columns = await step("user_columns", () =>
    prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'User'
      ORDER BY column_name`,
  );
  log.push({ step: "user_columns_list", ok: true, columns });
  await prisma.$disconnect();
} catch (error) {
  log.push({
    step: "prisma_probe",
    ok: false,
    error: error instanceof Error ? error.message : String(error),
  });
}

writeFileSync(resolve(root, "check-db-result.json"), JSON.stringify(log, null, 2), "utf8");
