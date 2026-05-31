-- Add resellerId to catalog models for reseller-owned content filtering.
-- These columns were defined in schema but never materialized in DB.

-- Hotel
ALTER TABLE "Hotel" ADD COLUMN "resellerId" TEXT;
CREATE INDEX "Hotel_resellerId_idx" ON "Hotel"("resellerId");

-- TravelPackage
ALTER TABLE "TravelPackage" ADD COLUMN "resellerId" TEXT;
CREATE INDEX "TravelPackage_resellerId_idx" ON "TravelPackage"("resellerId");

-- Excursion
ALTER TABLE "Excursion" ADD COLUMN "resellerId" TEXT;
CREATE INDEX "Excursion_resellerId_idx" ON "Excursion"("resellerId");

-- TransportService
ALTER TABLE "TransportService" ADD COLUMN "resellerId" TEXT;
CREATE INDEX "TransportService_resellerId_idx" ON "TransportService"("resellerId");

-- Cruise
ALTER TABLE "Cruise" ADD COLUMN "resellerId" TEXT;
CREATE INDEX "Cruise_resellerId_idx" ON "Cruise"("resellerId");

-- Nullable FK constraints (SetNull on delete so catalog items survive reseller removal)
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_resellerId_fkey"
  FOREIGN KEY ("resellerId") REFERENCES "Reseller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TravelPackage" ADD CONSTRAINT "TravelPackage_resellerId_fkey"
  FOREIGN KEY ("resellerId") REFERENCES "Reseller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Excursion" ADD CONSTRAINT "Excursion_resellerId_fkey"
  FOREIGN KEY ("resellerId") REFERENCES "Reseller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TransportService" ADD CONSTRAINT "TransportService_resellerId_fkey"
  FOREIGN KEY ("resellerId") REFERENCES "Reseller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Cruise" ADD CONSTRAINT "Cruise_resellerId_fkey"
  FOREIGN KEY ("resellerId") REFERENCES "Reseller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
