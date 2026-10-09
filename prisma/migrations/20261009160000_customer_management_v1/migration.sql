CREATE TYPE "CustomerStatus" AS ENUM ('Active', 'Deactivated');

ALTER TABLE "Customer"
  ADD COLUMN "status" "CustomerStatus" NOT NULL DEFAULT 'Active',
  ADD COLUMN "notes" TEXT;

DROP INDEX "Customer_email_key";

CREATE UNIQUE INDEX "Customer_active_company_email_key"
  ON "Customer" (lower("company"), lower("email"))
  WHERE "status" = 'Active' AND "company" IS NOT NULL AND "email" IS NOT NULL;
