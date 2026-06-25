-- AlterTable
ALTER TABLE "Destination" ADD COLUMN "publishStatus" TEXT NOT NULL DEFAULT 'approved';

-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN "publishStatus" TEXT NOT NULL DEFAULT 'approved';

-- AlterTable
ALTER TABLE "TravelPackage" ADD COLUMN "publishStatus" TEXT NOT NULL DEFAULT 'approved';

-- AlterTable
ALTER TABLE "Excursion" ADD COLUMN "publishStatus" TEXT NOT NULL DEFAULT 'approved';

-- AlterTable
ALTER TABLE "TransportService" ADD COLUMN "publishStatus" TEXT NOT NULL DEFAULT 'approved';

-- AlterTable
ALTER TABLE "Cruise" ADD COLUMN "publishStatus" TEXT NOT NULL DEFAULT 'approved';
