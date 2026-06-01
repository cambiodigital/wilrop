-- AlterTable: Add customDomain and subdomain to Reseller
ALTER TABLE "Reseller" ADD COLUMN "customDomain" TEXT;
ALTER TABLE "Reseller" ADD COLUMN "subdomain" TEXT;

-- CreateIndex: unique constraints
CREATE UNIQUE INDEX "Reseller_customDomain_key" ON "Reseller"("customDomain");
CREATE UNIQUE INDEX "Reseller_subdomain_key" ON "Reseller"("subdomain");

-- CreateIndex: lookup indexes for middleware resolution
CREATE INDEX "Reseller_customDomain_idx" ON "Reseller"("customDomain");
CREATE INDEX "Reseller_subdomain_idx" ON "Reseller"("subdomain");
