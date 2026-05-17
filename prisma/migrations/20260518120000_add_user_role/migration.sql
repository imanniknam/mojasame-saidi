-- Add UserRole enum + column (safe if partially applied via db push)
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER';

UPDATE "User" SET "role" = 'ADMIN' WHERE "id" IN (SELECT "userId" FROM "Admin");
UPDATE "User" SET "role" = 'CUSTOMER' WHERE "role" IS NULL;

DELETE FROM "User" WHERE "passwordHash" IS NULL;
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;
