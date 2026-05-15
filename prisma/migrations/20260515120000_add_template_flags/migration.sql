-- AlterTable
ALTER TABLE "Destination" ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "TravelPackage" ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Excursion" ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "TransportProvider" ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "TransportService" ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT true;

