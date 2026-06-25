-- AlterTable
ALTER TABLE "Destination" ADD COLUMN IF NOT EXISTS "publishStatus" TEXT NOT NULL DEFAULT 'approved';

-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN IF NOT EXISTS "publishStatus" TEXT NOT NULL DEFAULT 'approved';

-- AlterTable
ALTER TABLE "TravelPackage" ADD COLUMN IF NOT EXISTS "publishStatus" TEXT NOT NULL DEFAULT 'approved';

-- AlterTable
ALTER TABLE "Excursion" ADD COLUMN IF NOT EXISTS "publishStatus" TEXT NOT NULL DEFAULT 'approved';

-- AlterTable
ALTER TABLE "TransportService" ADD COLUMN IF NOT EXISTS "publishStatus" TEXT NOT NULL DEFAULT 'approved';

-- AlterTable
ALTER TABLE "Cruise" ADD COLUMN IF NOT EXISTS "publishStatus" TEXT NOT NULL DEFAULT 'approved';
